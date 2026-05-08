# wagmi-backend/cleanup_ghost_courses.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course

def cleanup():
    # Find courses that are not minted or have no school address
    ghosts = Course.objects.filter(is_minted=False) | Course.objects.filter(school_address__isnull=True)
    
    count = ghosts.count()
    print(f"Found {count} ghost courses (unminted/no address).")
    
    for course in ghosts:
        print(f"  Deleting: {course.title} (ID: {course.id})")
        course.delete()
        
    print("\nPurge complete. Only on-chain mastery nodes remain.")

if __name__ == "__main__":
    cleanup()
