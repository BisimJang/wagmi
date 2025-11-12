from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, Section, Lesson, Enrollment, Certificate, LessonProgress

User = get_user_model()

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "video_url", "order"]


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

    class Meta:
        model = Course
        fields = ["id", "name", "description", "instructor", "price", "created_at", "sections", "imageUrl"]

    def get_imageUrl(self, obj):
        """
        Placeholder method to provide the course image URL.
        Replace this logic with your actual image field access.
        """
        return f"https://picsum.photos/seed/{obj.id}/300/200"

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