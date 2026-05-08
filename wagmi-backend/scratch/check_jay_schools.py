
import os
import django
import sys

# Setup Django environment
sys.path.append('c:/Users/Jason/Desktop/wagmi/wagmi-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course, SovereignSchool

jay_address = "0xb54147444ac655e2a2e68b325caa9b1cbee34d30"
courses = Course.objects.filter(instructor__address__iexact=jay_address)

print(f"--- Courses for JAy ({jay_address}) ---")
for c in courses:
    print(f"Course: {c.title} (ID: {c.id})")
    print(f"  School Address: {c.school_address}")
    print(f"  Minted: {c.is_minted}")

schools = SovereignSchool.objects.filter(instructor__address__iexact=jay_address)
print(f"\n--- Schools for JAy ---")
for s in schools:
    print(f"School: {s.name} ({s.address})")
