from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from .views import NonceView, VerifyView, GoogleLoginView, LinkWalletView

urlpatterns = [
    path("nonce/", NonceView.as_view(), name="nonce"),
    path("wallet/", VerifyView.as_view(), name="wallet-login"),
    path("google/", GoogleLoginView.as_view(), name="google-login"),
    path("link-wallet/", LinkWalletView.as_view(), name="link-wallet"),
    path("verify/", TokenVerifyView.as_view(), name="token_verify"),
]
