from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class WalletNonce(models.Model):
    address = models.CharField(max_length=255, unique=True)
    nonce = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.address} - {self.nonce}"

class WalletUserManager(BaseUserManager):
    def create_user(self, address, **extra_fields):
        if not address:
            raise ValueError("Wallet address required")
        address = address.lower()
        user = self.model(address=address, **extra_fields)
        user.set_unusable_password()  # no password login
        user.save(using=self._db)
        return user

    def create_superuser(self, address, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(address, **extra_fields)


class WalletUser(AbstractBaseUser, PermissionsMixin):
    address = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "address"
    REQUIRED_FIELDS = []

    objects = WalletUserManager()

    def __str__(self):
        return self.address