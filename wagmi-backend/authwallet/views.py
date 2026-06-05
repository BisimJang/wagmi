import secrets
from eth_account.messages import encode_defunct
from eth_account import Account
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import WalletNonce
from rest_framework_simplejwt.tokens import RefreshToken
from .models import WalletNonce, WalletUser
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from rest_framework import serializers

class NonceView(APIView):
    def post(self, request):
        address = request.data.get("address")
        if not address:
            return Response({"error": "Address required"}, status=400)

        # generate random nonce
        nonce = secrets.token_hex(16)

        WalletNonce.objects.update_or_create(
            address=address.lower(),
            defaults={"nonce": nonce},
        )
        return Response({"nonce": nonce})


class VerifyView(APIView):
    def post(self, request):
        address = request.data.get("address")
        signature = request.data.get("signature")

        if not address or not signature:
            return Response({"error": "Address and signature required"}, status=400)

        wallet_nonce = get_object_or_404(WalletNonce, address=address.lower())
        message = encode_defunct(text=f"Sign in to Studyverse\n\nNonce: {wallet_nonce.nonce}")


        try:
            recovered_address = Account.recover_message(message, signature=signature)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

        if recovered_address.lower() != address.lower():
            return Response({"error": "Signature invalid"}, status=400)

        # delete nonce so it can't be reused
        wallet_nonce.delete()

        # Get or create wallet user
        user, _ = WalletUser.objects.get_or_create(address=address.lower())

        # Generate JWT tied to this user
        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "address": user.address,
        })


class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"error": "Token is required"}, status=400)

        try:
            # Verify the token with Google
            # Note: GOOGLE_CLIENT_ID should be in your settings
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                getattr(settings, 'GOOGLE_CLIENT_ID', None)
            )

            email = idinfo['email']
            google_id = idinfo['sub']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            picture = idinfo.get('picture', '')

            # Get or create user by google_id or email
            user = WalletUser.objects.filter(google_id=google_id).first()
            if not user:
                user = WalletUser.objects.filter(email=email).first()
                if user:
                    user.google_id = google_id
                    user.save()
                else:
                    user = WalletUser.objects.create_user(
                        email=email,
                        google_id=google_id,
                        first_name=first_name,
                        last_name=last_name,
                        profile_image=picture,
                        display_name=first_name
                    )

            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "email": user.email,
                "address": user.address,
                "is_wallet_linked": user.is_wallet_linked
            })

        except ValueError as e:
            return Response({"error": f"Invalid token: {str(e)}"}, status=400)


class LinkWalletView(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        address = request.data.get("address")
        signature = request.data.get("signature")
        nonce = request.data.get("nonce")

        if not address or not signature or not nonce:
            return Response({"error": "Missing parameters"}, status=400)

        # Verify the signature
        message = encode_defunct(text=f"Link wallet to Studyverse account\n\nNonce: {nonce}")
        try:
            recovered_address = Account.recover_message(message, signature=signature)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

        if recovered_address.lower() != address.lower():
            return Response({"error": "Signature invalid"}, status=400)

        # Check if this address is already linked to another account
        existing = WalletUser.objects.filter(address=address.lower()).first()
        if existing and existing.id != request.user.id:
            return Response({"error": "This wallet is already linked to another account"}, status=400)

        # Link the wallet
        user = request.user
        user.address = address.lower()
        user.is_wallet_linked = True
        user.save()

        return Response({
            "message": "Wallet linked successfully",
            "address": user.address
        })

from rest_framework.permissions import IsAuthenticated

class StudentProvisioningView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        
        # Only staff/instructors can provision
        if not user.is_staff:
            return Response({"error": "Only instructors can provision students."}, status=403)
            
        from courses.models import SovereignSchool, SchoolMembership
        
        # Get instructor's school
        school = SovereignSchool.objects.filter(instructor=user).first()
        if not school:
            return Response({"error": "You must create a school before provisioning students."}, status=400)
            
        email = request.data.get("email")
        password = request.data.get("password")
        
        if not email or not password:
            return Response({"error": "Email and password are required."}, status=400)
            
        # Check if user already exists
        if WalletUser.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists."}, status=400)
            
        student = WalletUser.objects.create_user(
            email=email,
            password=password
        )
        
        # Add to school
        SchoolMembership.objects.create(user=student, school=school)
        
        return Response({
            "message": f"Student {email} provisioned and added to {school.name}.",
            "email": email
        }, status=201)

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = self.fields.pop('address', None) or self.fields.pop('username', None)
        if 'email' not in self.fields:
            self.fields['email'] = serializers.CharField()
            
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        from django.contrib.auth import authenticate
        from .models import WalletUser
        
        user = WalletUser.objects.filter(email=email).first()
        if not user:
            raise serializers.ValidationError('No active account found with the given credentials')

        if not user.check_password(password):
            raise serializers.ValidationError('No active account found with the given credentials')
            
        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


