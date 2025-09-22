from rest_framework import serializers
from .models import Course, Section, Lesson, Enrollment, Certificate, LessonProgress


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "video_url", "order"]


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ['id', 'user', 'lesson', 'progress', 'completed', 'updated_at']
        read_only_fields = ['updated_at', 'user']


class SectionSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ["id", "title", "order", "lessons"]


class CourseSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    instructor = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Course
        fields = ["id", "title", "description", "instructor", "price", "created_at", "sections"]


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ["id", "course", "user", "wallet_address", "tx_hash", "enrolled_at"]


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = ["id", "course", "user", "wallet_address", "token_id", "tx_hash", "issued_at"]
