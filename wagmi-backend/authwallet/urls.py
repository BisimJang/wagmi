from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from .views import (
    NonceView, VerifyView, GoogleLoginView, LinkWalletView, 
    StudentProvisioningView, BulkStudentProvisioningView, EmailTokenObtainPairView,
    RegisterUserView, RegisterInstitutionView, ChangePasswordView
)
from .billing_views import BillingPlansView, BillingSubscribeView, BillingStatusView

urlpatterns = [
    path("nonce/", NonceView.as_view(), name="nonce"),
    path("wallet/", VerifyView.as_view(), name="wallet-login"),
    path("google/", GoogleLoginView.as_view(), name="google-login"),
    path("password/", EmailTokenObtainPairView.as_view(), name="password-login"),
    path("link-wallet/", LinkWalletView.as_view(), name="link-wallet"),
    path("verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("provision/", StudentProvisioningView.as_view(), name="provision_student"),
    path("provision-bulk/", BulkStudentProvisioningView.as_view(), name="provision_bulk_student"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("register/", RegisterUserView.as_view(), name="register_user"),
    path("register-institution/", RegisterInstitutionView.as_view(), name="register_institution"),
    
    # Billing
    path("billing/plans/", BillingPlansView.as_view(), name="billing_plans"),
    path("billing/subscribe/", BillingSubscribeView.as_view(), name="billing_subscribe"),
    path("billing/status/", BillingStatusView.as_view(), name="billing_status"),
]
