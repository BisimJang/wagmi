from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseListCreateView,
    CourseDetailView,
    EnrollmentListCreateView,
    CertificateListCreateView,
    LessonProgressViewSet,
    enroll_in_course, 
    issue_certificate,
    me
)

# Router for viewsets (only lesson progress for now)
router = DefaultRouter()
router.register(r'lesson-progress', LessonProgressViewSet, basename='lesson-progress')

urlpatterns = [
    path('', include(router.urls)),

    # Courses
    path("courses/", CourseListCreateView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("courses/<int:course_id>/enroll/", enroll_in_course, name="course-enroll"),
    path("courses/<int:course_id>/certificate/", issue_certificate, name="issue-certificate"),

    # Enrollments & Certificates
    path("enrollments/", EnrollmentListCreateView.as_view(), name="enrollment-list"),
    path("certificates/", CertificateListCreateView.as_view(), name="certificate-list"),

    #user profile
    path("me/", me, name="user-profile"),
]
