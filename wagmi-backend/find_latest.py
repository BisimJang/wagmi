# wagmi-backend/find_latest.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course

try:
    latest = Course.objects.filter(is_minted=True).latest('id')
    print(f"ID: {latest.id}")
    print(f"Title: {latest.title}")
    print(f"Contract: {latest.school_address}")
except Course.DoesNotExist:
    print("No minted courses found.")
