from django.contrib import admin
from .models import WalletNonce, WalletUser

@admin.register(WalletNonce)
class WalletNonceAdmin(admin.ModelAdmin):
    list_display = ('address', 'nonce', 'created_at')
    search_fields = ('address',)

@admin.register(WalletUser)
class WalletUserAdmin(admin.ModelAdmin):
    list_display = ('address', 'display_name', 'email', 'is_active', 'is_staff')
    search_fields = ('address', 'display_name', 'email')
