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
