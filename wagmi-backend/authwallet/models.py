from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class WalletUserManager(BaseUserManager):
    def create_user(self, address=None, email=None, password=None, **extra_fields):
        if not address and not email:
            raise ValueError("Either Address or Email must be set")
        
        if address:
            address = address.lower()
        
        if email:
            email = self.normalize_email(email)
            
        user = self.model(address=address, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, address, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(address=address, password=password, **extra_fields)


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
    email = models.EmailField(blank=True, null=True, unique=True)
    profile_image = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    twitter_handle = models.CharField(max_length=100, blank=True, null=True)
    github_handle = models.CharField(max_length=100, blank=True, null=True)
    
    address = models.CharField(max_length=255, unique=True, null=True, blank=True)
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    is_wallet_linked = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "address"
    REQUIRED_FIELDS = []

    # Fallback if address is missing
    def get_username(self):
        return self.address or self.email or str(self.id)

    objects = WalletUserManager()

    def __str__(self):
        return self.address or self.email or str(self.id)

    @property
    def full_name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip()

