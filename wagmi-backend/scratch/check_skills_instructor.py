
import os
import django
import sys

# Setup Django environment
sys.path.append('c:/Users/Jason/Desktop/wagmi/wagmi-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course

courses = Course.objects.filter(title__icontains="skills")
for c in courses:
    print(f"Course: {c.title} (ID: {c.id})")
    print(f"Instructor: {c.instructor.display_name} ({c.instructor.address})")
    print(f"Minted: {c.is_minted}")
