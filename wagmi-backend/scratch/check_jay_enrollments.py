
import os
import django
import sys

# Setup Django environment
sys.path.append('c:/Users/Jason/Desktop/wagmi/wagmi-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course, Enrollment

jay_address = "0xb54147444ac655e2a2e68b325caa9b1cbee34d30"
enrollments = Enrollment.objects.filter(wallet_address__iexact=jay_address)

print(f"--- Enrollments for JAy ---")
for e in enrollments:
    print(f"Course: {e.course.title} (ID: {e.course.id})")
    print(f"  TX Hash: {e.tx_hash}")
    print(f"  Status: {e.status}")
