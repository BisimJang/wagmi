from rest_framework import generics, status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import json
from .models import Course, Section, Lesson, Enrollment, Certificate, LessonProgress, SovereignSchool
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


from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination

class CoursePagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 100

class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter]
    search_fields = ['title', 'description', 'school_name', 'school__name']
    pagination_class = CoursePagination

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
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        if course.instructor != self.request.user:
            raise PermissionDenied("Only the instructor of this course can add sections.")
        serializer.save()


class LessonListCreateView(generics.ListCreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        section = serializer.validated_data.get('section')
        if section.course.instructor != self.request.user:
            raise PermissionDenied("Only the instructor of this course can add lessons.")
        serializer.save()

class SectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        section = self.get_object()
        if section.course.instructor != self.request.user:
            raise PermissionDenied("Only the instructor of this course can edit this section.")
        serializer.save()

class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        lesson = self.get_object()
        if lesson.section.course.instructor != self.request.user:
            raise PermissionDenied("Only the instructor of this course can edit this lesson.")
        serializer.save()


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

    SENTINEL_HASHES = {'on-chain-verified', 'on-chain-sync'}
    if not tx_hash or not isinstance(tx_hash, str) or (not tx_hash.startswith("0x") and tx_hash not in SENTINEL_HASHES):
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

    # 5) Enforce max 20 active enrollments (Lifted from 2 for Phase 2)
    active_count = Enrollment.objects.filter(user=user, status='enrolled').count()
    if active_count >= 20:
        return Response({"error": "Maximum of 20 active enrollments allowed."},
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
        data = request.data
        course_id = data.get('course_id') 
        
        if course_id is None:
            return Response({"detail": "course_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            course_id = int(course_id)
        except (ValueError, TypeError):
            return Response({"detail": "Invalid course_id format."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Verify the Lesson and Course relationship
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        
        if lesson.section.course_id != course_id:
            return Response({"detail": "Lesson verification failed: Lesson does not belong to the specified course."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Create or Update LessonProgress
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
        logger.exception("Error marking lesson complete")
        return Response({"detail": f"An internal error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_mint(request, course_id):
    """
    Confirms that a course has been minted on the blockchain.
    Expects tx_hash and school_address in the request body.
    """
    try:
        course = Course.objects.get(id=course_id)
        
        # Only the instructor can confirm the mint
        if course.instructor != request.user:
            return Response({"error": "You are not the instructor of this course."}, status=status.HTTP_403_FORBIDDEN)
        
        tx_hash = request.data.get('tx_hash')
        school_address = request.data.get('school_address')
        school_name = request.data.get('school_name')
        
        if not tx_hash:
            return Response({"error": "Transaction hash is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        course.is_minted = True
        course.tx_hash = tx_hash
        course.school_address = school_address
        if school_name:
            course.school_name = school_name
            
        # Link to SovereignSchool object if it exists
        try:
            school_obj = SovereignSchool.objects.get(address=school_address)
            course.school = school_obj
        except SovereignSchool.DoesNotExist:
            pass
            
        course.save()
        
        return Response({
            "message": "Course mint confirmed!",
            "course_id": course.id,
            "tx_hash": tx_hash
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_school(request):
    """
    Registers a newly deployed sovereign school in the backend.
    """
    address = request.data.get('address')
    name = request.data.get('name')
    
    if not address or not name:
        return Response({"error": "Address and name are required."}, status=status.HTTP_400_BAD_REQUEST)
        
    school, created = SovereignSchool.objects.get_or_create(
        address=address,
        defaults={
            'name': name,
            'instructor': request.user
        }
    )
    
    if not created:
        school.name = name  # Update name if changed
        school.save()
        
    return Response({
        "message": "School registered successfully!",
        "address": school.address,
        "name": school.name
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def school_list(request):
    """
    Returns a list of unique sovereign schools.
    """
    schools = SovereignSchool.objects.all().select_related('instructor')
    
    return Response([
        {
            'address': s.address,
            'name': s.name,
            'instructor_name': s.instructor.display_name or s.instructor.address[:8],
            'instructor_address': s.instructor.address
        } for s in schools
    ], status=status.HTTP_200_OK)

