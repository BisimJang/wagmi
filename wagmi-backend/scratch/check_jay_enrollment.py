
import os
import django
import sys

# Setup Django environment
sys.path.append('c:/Users/Jason/Desktop/wagmi/wagmi-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from courses.models import Course, Enrollment, Certificate, Lesson, LessonProgress

User = get_user_model()
address = "0xb54147444ac655E2A2E68B325CaA9b1CBEE34D30"

try:
    user = User.objects.get(address__iexact=address)
    print(f"User: {user.display_name}")
    
    enrollments = Enrollment.objects.filter(user=user)
    print(f"\nEnrollments ({enrollments.count()}):")
    for e in enrollments:
        print(f"- {e.course.title} (ID: {e.course.id})")
        # Check progress
        total_lessons = Lesson.objects.filter(section__course=e.course).count()
        completed_lessons = LessonProgress.objects.filter(user=user, lesson__section__course=e.course, completed=True).count()
        print(f"  Progress: {completed_lessons}/{total_lessons}")
        
        # Check certificate
        cert = Certificate.objects.filter(user=user, course=e.course).first()
        if cert:
            print(f"  Certificate: {cert.status} (Token ID: {cert.token_id})")
        else:
            print(f"  Certificate: NOT CREATED")

except Exception as e:
    print(f"Error: {e}")
