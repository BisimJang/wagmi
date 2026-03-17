from rest_framework import generics, status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import json
from .models import Course, Section, Lesson, Enrollment, Certificate, LessonProgress
from django.core.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (
    CourseSerializer,
    SectionSerializer,
    LessonSerializer,
    EnrollmentSerializer,
    CertificateSerializer,
    LessonProgressSerializer,
    UserProfileSerializer,
    CurriculumLessonSerializer,
)
import logging
logger = logging.getLogger(__name__)


class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
            raise PermissionDenied("You must be logged in to create a course.")
        
        # Ensure the user gets staff/instructor status
        if not user.is_staff:
            user.is_staff = True
            user.save()
            
        serializer.save(instructor=user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class SectionListCreateView(generics.ListCreateAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
            raise PermissionDenied("You must be logged in to create a section.")
        
        # Ensure the course instructor matches the requesting user
        course_id = self.request.data.get('course')
        course = get_object_or_404(Course, id=course_id)
        if course.instructor != user:
             raise PermissionDenied("Only the instructor of this course can add sections.")
             
        serializer.save(course=course)


class LessonListCreateView(generics.ListCreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
            raise PermissionDenied("You must be logged in to create a lesson.")
        
        # Verify ownership via Section -> Course
        section_id = self.request.data.get('section')
        section = get_object_or_404(Section, id=section_id)
        if section.course.instructor != user:
             raise PermissionDenied("Only the instructor of this course can add lessons.")
             
        serializer.save(section=section)


class EnrollmentListCreateView(generics.ListCreateAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer


@api_view(["POST"])

def enroll_in_course(request, course_id):
    """
    Record an enrollment after frontend confirms on-chain tx.
    Expects JSON: { "tx_hash": "0x...", "wallet_address": "0x..." }.
    """
    user = request.user

    # 1) Validate request body
    tx_hash = request.data.get("tx_hash")
    wallet_address = request.data.get("wallet_address") or getattr(user, "address", None)

    if not tx_hash or not isinstance(tx_hash, str) or not tx_hash.startswith("0x"):
        return Response({"error": "tx_hash (hex string) is required"}, status=status.HTTP_400_BAD_REQUEST)

    if not wallet_address:
        return Response({"error": "wallet_address is required"}, status=status.HTTP_400_BAD_REQUEST)

    # 2) Load course
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

    # 3) Prevent reuse of the same tx_hash
    if Enrollment.objects.filter(tx_hash=tx_hash).exists():
        return Response({"error": "This transaction has already been used for enrollment."},
                        status=status.HTTP_400_BAD_REQUEST)

    # 4) Prevent duplicate enrollment for same course/user
    if Enrollment.objects.filter(user=user, course=course, status__in=['enrolled', 'completed']).exists():
        return Response({"error": "You are already enrolled in this course."},
                        status=status.HTTP_400_BAD_REQUEST)

    # 5) Enforce max 2 active enrollments
    active_count = Enrollment.objects.filter(user=user, status='enrolled').count()
    if active_count >= 2:
        return Response({"error": "Maximum of 2 active enrollments allowed."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Optional: verify tx on-chain here (recommended). If you have web3 configured, verify tx_hash
    try:
        enrollment = Enrollment.objects.create(
            user=user,
            course=course,
            wallet_address=wallet_address,
            tx_hash=tx_hash,
            status='enrolled'
        )
    except Exception as e:
        logger.exception("Failed to create enrollment")
        return Response({"error": f"Failed to create enrollment: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    serializer = EnrollmentSerializer(enrollment)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

class CertificateListCreateView(generics.ListCreateAPIView):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def issue_certificate(request, course_id):
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if not Enrollment.objects.filter(course=course, user=request.user).exists():
        return Response(
        {"error": "You must be enrolled in the course to get a certificate"},
        status=status.HTTP_403_FORBIDDEN
        )

    # Check if the user already has a certificate for this course
    certificate, created = Certificate.objects.get_or_create(
        course=course,
        user=request.user,
        defaults={
            "wallet_address": request.user.address,
            "token_id": f"NFT{course_id}{request.user.id}",
            "tx_hash": "0xmockcerttx123456789"
        }
    )

    if not created:
        return Response({"message": "Certificate already issued"}, status=status.HTTP_200_OK)

    # Here you can later integrate NFT minting / blockchain tx
    # For now, simulate a transaction hash
    certificate.tx_hash = "0xmockcerttx123456789"
    certificate.save()

    return Response({
        "message": "Certificate issued successfully",
        "course": course.title,
        "user": str(request.user),
        "tx_hash": certificate.tx_hash
    }, status=status.HTTP_201_CREATED)

class LessonProgressViewSet(viewsets.ModelViewSet):
    queryset = LessonProgress.objects.all()
    serializer_class = LessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return progress for the logged-in wallet
        return LessonProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user to the logged-in wallet
        serializer.save(user=self.request.user)

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == "GET":
        serializer = UserProfileSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    elif request.method == "PATCH":
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    

class LessonsAndProgressView(APIView):
    """
    Returns a flat list of lessons (with section metadata) and the user's progress map 
    for the specified course.
    """
    

    def get(self, request, course_id):
        user = request.user
        
        # 1. Fetch all lessons and related sections for the course
        all_lessons = Lesson.objects.filter(
            section__course_id=course_id
        ).select_related('section').order_by('section__order', 'order')

        # 2. Fetch LessonProgress for the current user and these lessons
        progress_queryset = LessonProgress.objects.filter(
            user=user,
            lesson__in=all_lessons
        )
        
        # Create a map of {lesson_id: progress_data} for quick lookup on the frontend
        progress_map = {
            lp.lesson_id: {
                "progress": lp.progress,
                "completed": lp.completed,
                # Add any other fields the frontend might use
            }
            for lp in progress_queryset
        }

        # 3. Serialize the flat list of lessons
        lesson_serializer = CurriculumLessonSerializer(all_lessons, many=True)
        
        # 4. Return the structured data
        return Response({
            "lessons": lesson_serializer.data,  # Flat list of lessons (with section FK data)
            "progress": progress_map             # Map of user progress
        })


# --- 2. complete_lesson (POST Lesson Completion) ---
# Maps to: /api/lessons/<lesson_id>/complete/
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_lesson(request, lesson_id):
    """
    Marks a specific lesson as completed for the authenticated user.
    Requires course_id in the request body for validation.
    """
    try:
        # Assuming request.data is already parsed by DRF, but using json.loads 
        # is safer if APIView isn't used. STICKING TO DRF request.data.
        data = request.data
        course_id = data.get('course_id') 
        
        # 1. Verify the Lesson and Course relationship
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        
        if lesson.section.course_id != course_id:
            # Although the frontend sends course_id, we should verify the relationship
            return Response({"detail": "Lesson verification failed: Lesson does not belong to the specified course."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Create or Update LessonProgress
        # update_or_create handles both creation (first time) and updating (re-marking complete)
        lesson_progress, created = LessonProgress.objects.update_or_create(
            user=request.user,
            lesson=lesson,
            defaults={
                'progress': 100.0,
                'completed': True
            }
        )
        
        # 3. Success Response
        return Response(
            {"detail": "Lesson marked as completed successfully.", "id": lesson_progress.id}, 
            status=status.HTTP_200_OK
        )

    except Lesson.DoesNotExist:
        return Response({"detail": "Lesson not found."}, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        print(f"Error marking lesson complete: {e}")
        return Response({"detail": "An internal error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)