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
