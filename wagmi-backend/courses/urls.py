from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseListCreateView,
    CourseDetailView,
    EnrollmentListCreateView,
    CertificateListCreateView,
    LessonProgressViewSet,
    enroll_in_course, 
    issue_certificate
)


router = DefaultRouter()
router.register(r'lesson-progress', LessonProgressViewSet, basename='lesson-progress')

urlpatterns = [
    path('', include(router.urls)),
    path("courses/", CourseListCreateView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("enrollments/", EnrollmentListCreateView.as_view(), name="enrollment-list"),
    path("courses/<int:course_id>/enroll/", enroll_in_course, name="course-enroll"),
    path("certificates/", CertificateListCreateView.as_view(), name="certificate-list"),
    path("courses/<int:course_id>/certificate/", issue_certificate, name="issue-certificate"),
]
