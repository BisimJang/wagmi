from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, Section, Lesson, Enrollment, Certificate, LessonProgress, StudyBubble

User = get_user_model()

class LessonSerializer(serializers.ModelSerializer):
    section = serializers.PrimaryKeyRelatedField(queryset=Section.objects.all(), write_only=True)

    class Meta:
        model = Lesson
        fields = ["id", "section", "title", "content", "video_url", "image_url", "order"]


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.ReadOnlyField(source="lesson.title")

    class Meta:
        model = LessonProgress
        fields = ['id', 'lesson', 'lesson_title', 'progress', 'completed', 'updated_at']
        read_only_fields = ['updated_at', 'user', 'lesson_title']


class SectionSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), write_only=True)

    class Meta:
        model = Section
        fields = ["id", "course", "title", "order", "lessons"]


class CourseSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    instructor = serializers.StringRelatedField(read_only=True)
    instructor_address = serializers.ReadOnlyField(source='instructor.address')
    name = serializers.CharField(source='title', read_only=True)
    imageUrl = serializers.SerializerMethodField()
    is_instructor = serializers.SerializerMethodField()
    
    # Enable writing to these fields
    price = serializers.DecimalField(max_digits=20, decimal_places=8, required=False)
    fiat_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    title = serializers.CharField()
    image_url = serializers.URLField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Course
        fields = [
            "id", "title", "name", "description", "instructor", "instructor_address", "price", "fiat_price",
            "created_at", "sections", "imageUrl", "image_url", 
            "is_minted", "tx_hash", "school_address", "school_name",
            "is_instructor", "tags", "is_public"
        ]

    def get_imageUrl(self, obj):
        """
        Returns the course image_url if present, else falls back to a placeholder.
        """
        return obj.image_url if obj.image_url else f"https://picsum.photos/seed/{obj.id}/300/200"

    def get_is_instructor(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.instructor == request.user
        return False

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
            "bio",
            "twitter_handle",
            "github_handle",
            "is_wallet_linked",
            "google_id",
            "full_name",
            "enrollments",
            "certificates",
            "is_institution",
            "org_name",
            "org_type",
            "org_size",
            "must_change_password"
        ]
        read_only_fields = ["id", "address", "full_name", "enrollments", "certificates", "google_id", "is_institution"]
        
    def get_enrollments(self, obj):
        # 📚 Courses the user has explicitly enrolled in
        enrolled = Enrollment.objects.filter(user=obj)
        enrolled_list = []
        for e in enrolled:
            total_lessons = Lesson.objects.filter(section__course=e.course).count()
            completed_lessons = LessonProgress.objects.filter(user=obj, lesson__section__course=e.course, completed=True).count()
            progress_pct = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0.0

            enrolled_list.append({
                "course": e.course.title,
                "course_id": e.course.id,
                "enrolled_at": e.enrolled_at,
                "tx_hash": e.tx_hash,
                "role": "student",
                "progress": round(progress_pct, 1),
                "description": e.course.description,
                "imageUrl": e.course.image_url if e.course.image_url else f"https://picsum.photos/seed/{e.course.id}/300/200",
                "fiat_price": e.course.fiat_price,
                "is_minted": e.course.is_minted,
                "name": e.course.title
            })
        
        # 🎓 Courses the user is an instructor for (they are implicitly enrolled as the Master)
        teaching = Course.objects.filter(instructor=obj)
        teaching_list = []
        for c in teaching:
            if not enrolled.filter(course=c).exists():
                teaching_list.append({
                    "course": c.title,
                    "course_id": c.id,
                    "enrolled_at": c.created_at,
                    "tx_hash": c.tx_hash,
                    "role": "instructor",
                    "progress": 100.0,
                    "description": c.description,
                    "imageUrl": c.image_url if c.image_url else f"https://picsum.photos/seed/{c.id}/300/200",
                    "fiat_price": c.fiat_price,
                    "is_minted": c.is_minted,
                    "name": c.title
                })
        
        return enrolled_list + teaching_list

    def get_certificates(self, obj):
        return [
            {
                "id": c.id,
                "course": c.course.title,
                "course_id": c.course.id,
                "issued_at": c.issued_at,
                "token_id": c.token_id,
                "tx_hash": c.tx_hash,
                "status": c.status,
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


class StudyBubbleSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyBubble
        fields = [
            'id', 'title', 'concept', 'source_file', 'summary', 
            'content', 'video_refs', 'audio_url', 'status', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'summary', 'content', 'video_refs', 'audio_url', 'status', 'created_at', 'updated_at']
