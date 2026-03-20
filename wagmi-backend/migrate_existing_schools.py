import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course, SovereignSchool

def migrate_schools():
    courses_with_schools = Course.objects.filter(is_minted=True, school_address__isnull=False)
    count = 0
    for course in courses_with_schools:
        school, created = SovereignSchool.objects.get_or_create(
            address=course.school_address,
            defaults={
                'name': course.school_name or f"{course.instructor.address[:8]}'s Academy",
                'instructor': course.instructor
            }
        )
        if not course.school:
            course.school = school
            course.save()
            count += 1
    
    print(f"Successfully migrated {count} courses to SovereignSchool relations.")

if __name__ == "__main__":
    migrate_schools()
