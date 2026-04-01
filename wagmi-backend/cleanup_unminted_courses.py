"""
Cleanup script: deletes all courses that are NOT minted on-chain.
Run with: python manage.py shell < cleanup_unminted_courses.py

Courses kept:  is_minted=True  (have a CA + tx_hash)
Courses removed: is_minted=False (test data, seed data, incomplete)
"""

from courses.models import Course, Section, Lesson, Enrollment

# Preview what will be deleted
to_delete = Course.objects.filter(is_minted=False)
to_keep   = Course.objects.filter(is_minted=True)

print("=" * 60)
print(f"COURSES TO KEEP ({to_keep.count()}):")
for c in to_keep:
    print(f"  [{c.id}] {c.title} — CA: {c.school_address} — {c.price} ETH")

print()
print(f"COURSES TO DELETE ({to_delete.count()}):")
for c in to_delete:
    print(f"  [{c.id}] {c.title} — {c.instructor} — {c.price} ETH")

print()
confirm = input("Proceed with deletion? (yes/no): ").strip().lower()

if confirm == "yes":
    # Cascades will handle sections, lessons, enrollments (ON DELETE CASCADE in models)
    deleted_count, breakdown = to_delete.delete()
    print(f"\n✅ Deleted {deleted_count} objects: {breakdown}")
else:
    print("Aborted. No changes made.")
