from django.db import models
from django.conf import settings

# alias for readability
User = settings.AUTH_USER_MODEL


class SovereignSchool(models.Model):
    address = models.CharField(max_length=42, unique=True)
    name = models.CharField(max_length=200)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_schools")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class SchoolMembership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="school_memberships")
    school = models.ForeignKey(SovereignSchool, on_delete=models.CASCADE, related_name="memberships")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'school')

    def __str__(self):
        return f"{self.user} - {self.school.name}"


class Course(models.Model):
    DIVISION_CHOICES = [
        ('builders', 'Builders Division'),
        ('creatives', 'Creatives Division'),
        ('both', 'Both (Builders & Creatives)'),
        ('neither', 'Neither (General/Core)'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    instructor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="instructed_courses"
    )
    price = models.DecimalField(max_digits=20, decimal_places=8, default=0.00)
    image_url = models.URLField(blank=True, null=True)
    division = models.CharField(max_length=20, choices=DIVISION_CHOICES, default='neither')
    category = models.CharField(max_length=100, blank=True, null=True) # e.g. "Software Architecture", "Generative Art"
    is_minted = models.BooleanField(default=False)
    tx_hash = models.CharField(max_length=66, blank=True, null=True)
    school = models.ForeignKey(SovereignSchool, on_delete=models.SET_NULL, null=True, blank=True, related_name="courses")
    school_address = models.CharField(max_length=42, blank=True, null=True)
    school_name = models.CharField(max_length=200, blank=True, null=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Section(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="sections")
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    audio_url = models.URLField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.section.title} - {self.title}"
    

class LessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey("Lesson", on_delete=models.CASCADE)
    progress = models.FloatField(default=0.0)  # percentage: 0 - 100
    completed = models.BooleanField(default=False)
    layout_config = models.JSONField(blank=True, default=dict)
    notes = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f"{self.user.address} - {self.lesson.title} ({self.progress}%)"



class Enrollment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Fiat Payment'),
        ('enrolled', 'Enrolled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    wallet_address = models.CharField(max_length=42)
    tx_hash = models.CharField(max_length=66, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user} - {self.course.title} ({self.status})"


class Certificate(models.Model):
    CLAIM_STATUS = [
        ('pending', 'Pending'),
        ('issued', 'Issued'),
        ('claimed', 'Claimed On-Chain'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="certificates")
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="certificates"
    )
    wallet_address = models.CharField(max_length=255)
    token_id = models.CharField(max_length=200, blank=True, null=True)
    tx_hash = models.CharField(max_length=200, blank=True, null=True)
    
    # NFT Metadata fields
    metadata_uri = models.TextField(blank=True, null=True)
    image_uri = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=CLAIM_STATUS, default='pending')
    issued_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Certificate for {self.user} - {self.course.title} ({self.status})"


class StudyBubble(models.Model):
    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="study_bubbles")
    title = models.CharField(max_length=255)
    concept = models.TextField()
    source_file = models.FileField(upload_to='study_bubbles/sources/', null=True, blank=True)
    summary = models.TextField(blank=True, null=True)
    content = models.JSONField(default=list, blank=True) # List of knowledge nodes
    video_refs = models.JSONField(default=list, blank=True) # List of video URLs/metadata
    audio_url = models.URLField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Bubble: {self.title} ({self.user.address[:8]})"
