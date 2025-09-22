from django.urls import path
from .views import NonceView, VerifyView

urlpatterns = [
    path("nonce/", NonceView.as_view(), name="nonce"),
    path("wallet/", VerifyView.as_view(), name="wallet-login"),
]
