from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, Section, Lesson, Enrollment, Certificate, LessonProgress

User = get_user_model()

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "video_url", "image_url", "order"]


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.ReadOnlyField(source="lesson.title")

    class Meta:
        model = LessonProgress
        fields = ['id', 'lesson', 'lesson_title', 'progress', 'completed', 'updated_at']
        read_only_fields = ['updated_at', 'user', 'lesson_title']


class SectionSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ["id", "title", "order", "lessons"]


class CourseSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    instructor = serializers.StringRelatedField(read_only=True)
    name = serializers.CharField(source='title', read_only=True)
    imageUrl = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ["id", "name", "description", "instructor", "price", "created_at", "sections", "imageUrl"]

    def get_price(self, obj):
        """
        ensures price is formatted as a string with 18 decimal places
        to match the ethereum standard (1 eth = 10^18 wei), prventing precision errors.
        """
        return "{:.8f}".format(obj.price)

    def get_imageUrl(self, obj):
        """
        Returns the course image_url if present, else falls back to a placeholder.
        """
        return obj.image_url if obj.image_url else f"https://picsum.photos/seed/{obj.id}/300/200"

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source="course.title")

    class Meta:
        model = Enrollment
        fields = ["id", "course", "course_title", "wallet_address", "tx_hash", "enrolled_at"]
        read_only_fields = ["user", "enrolled_at", "course_title"]


class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source="course.title")

    class Meta:
        model = Certificate
        fields = ["id", "course", "course_title", "wallet_address", "token_id", "tx_hash", "issued_at"]
        read_only_fields = ["user", "issued_at", "course_title"]


class UserProfileSerializer(serializers.ModelSerializer):
    enrollments = serializers.SerializerMethodField()
    certificates = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "address",
            "first_name",
            "last_name",
            "display_name",
            "email",
            "profile_image",
            "full_name",
            "enrollments",
            "certificates",
        ]
        read_only_fields = ["id", "address", "full_name", "enrollments", "certificates"]
        
    def get_enrollments(self, obj):
        return [
            {
                "course": e.course.title,
                "course_id": e.course.id,
                "enrolled_at": e.enrolled_at,
                "tx_hash": e.tx_hash,
            }
            for e in Enrollment.objects.filter(user=obj)
        ]

    def get_certificates(self, obj):
        return [
            {
                "course": c.course.title,
                "course_id": c.course.id,
                "issued_at": c.issued_at,
                "token_id": c.token_id,
                "tx_hash": c.tx_hash,
            }
            for c in Certificate.objects.filter(user=obj)
        ]
    
class CurriculumLessonSerializer(serializers.ModelSerializer):
    """
    Serializes Lesson data, including necessary Section fields for frontend grouping.
    These fields are critical for the React frontend's 'groupLessonsBySection' logic.
    """
    # Flattens Section ForeignKey fields onto the Lesson object
    section_id = serializers.ReadOnlyField(source='section.id')
    section_title = serializers.ReadOnlyField(source='section.title')
    section_order = serializers.ReadOnlyField(source='section.order')
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'content', 'video_url', 'image_url', 'order',
            'section_id', 'section_title', 'section_order'
        ]

class LessonProgressSerializer(serializers.ModelSerializer):
    """Serializes a user's progress for a single lesson."""
    class Meta:
        model = LessonProgress
        fields = ['lesson', 'progress', 'completed']
        read_only_fields = ['lesson', 'user']
