from django.contrib import admin
from .models import WalletUserManager, WalletNonce, WalletUser  # whatever models you have

admin.site.register(WalletNonce)
admin.site.register(WalletUser)
