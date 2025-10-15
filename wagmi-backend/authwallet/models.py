from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class WalletUserManager(BaseUserManager):
    def create_user(self, address, password=None, **extra_fields):
        if not address:
            raise ValueError("The Address must be set")
        address = address.lower()
        user = self.model(address=address, **extra_fields)
        user.set_password(password)  # hashed properly
        user.save(using=self._db)
        return user

    def create_superuser(self, address, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(address, password, **extra_fields)


class WalletNonce(models.Model):
    address = models.CharField(max_length=255, unique=True)
    nonce = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.address} - {self.nonce}"


class WalletUser(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)
    display_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    profile_image = models.URLField(blank=True, null=True)

    address = models.CharField(max_length=255, unique=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "address"
    REQUIRED_FIELDS = []

    objects = WalletUserManager()

    def __str__(self):
        return self.address

    @property
    def full_name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip()

