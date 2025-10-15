from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets, permissions
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
)



class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only instructors can create courses.")
        serializer.save(instructor=self.request.user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class EnrollmentListCreateView(generics.ListCreateAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def enroll_in_course(request, course_id):
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check if already enrolled
    enrollment, created = Enrollment.objects.get_or_create(
        course=course,
        user=request.user,
        defaults={
            "wallet_address": request.user.address,
            "tx_hash": f"0xmocktx{course_id}{request.user.id}"
        }
    )

    if not created:
        return Response({"message": "Already enrolled"}, status=status.HTTP_200_OK)

    return Response({
        "message": "Enrolled successfully",
        "course": course.title,
        "user": str(request.user)
    }, status=status.HTTP_201_CREATED)

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
