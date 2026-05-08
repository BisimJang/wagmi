
import os
import django
import sys

# Setup Django environment
sys.path.append('c:/Users/Jason/Desktop/wagmi/wagmi-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from courses.models import Course, Enrollment, Certificate

User = get_user_model()
address = "0xb54147444ac655E2A2E68B325CaA9b1CBEE34D30"

try:
    user = User.objects.get(address__iexact=address)
    print(f"User Found: {user.display_name} ({user.address})")
    
    created_courses = Course.objects.filter(instructor=user)
    minted_courses = created_courses.filter(is_minted=True)
    enrollments = Enrollment.objects.filter(user=user)
    certificates = Certificate.objects.filter(user=user)
    
    print(f"Created: {created_courses.count()}")
    print(f"Minted: {minted_courses.count()}")
    print(f"Enrolled In: {enrollments.count()}")
    print(f"Completed (Certificates): {certificates.count()}")
    
    if created_courses.exists():
        print("\nCreated Courses:")
        for c in created_courses:
            status = "[MINTED]" if c.is_minted else "[DRAFT]"
            print(f"- {c.title} {status}")
            
except User.DoesNotExist:
    print(f"No user found with address {address}")
