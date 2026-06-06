import os
import django
import sys

sys.path.append('c:\\Users\\Jason\\Desktop\\wagmi\\wagmi-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from authwallet.models import WalletUser

# Create test user
email = "teststudent@example.com"
password = "testpassword123"

user, created = WalletUser.objects.get_or_create(email=email)
if created:
    user.set_password(password)
    user.save()
    print(f"Created user {email}")
else:
    user.set_password(password)
    user.save()
    print(f"Updated user {email}")

import requests

url = "http://localhost:8000/api/auth/password/"
data = {
    "email": email,
    "password": password
}

response = requests.post(url, json=data)
print(response.status_code)
print(response.text)
