from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseListCreateView,
    CourseDetailView,
    SectionListCreateView,
    LessonListCreateView,
    EnrollmentListCreateView,
    CertificateListCreateView,
    LessonProgressViewSet,
    enroll_in_course, 
    issue_certificate,
    me,
    LessonsAndProgressView, 
    complete_lesson
)

# Router for viewsets (only lesson progress for now)
router = DefaultRouter()
# router.register(r'lesson-progress', LessonProgressViewSet, basename='lesson-progress')

urlpatterns = [
    path('', include(router.urls)),
    path("courses/<int:course_id>/lessons_and_progress/", LessonsAndProgressView.as_view(), name="course-lessons-progress"),
    # Courses
    path("courses/", CourseListCreateView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("courses/<int:course_id>/enroll/", enroll_in_course, name="course-enroll"),
    path("courses/<int:course_id>/certificate/", issue_certificate, name="issue-certificate"),
    
    # Sections & Lessons
    path("sections/", SectionListCreateView.as_view(), name="section-list-create"),
    path("lessons/", LessonListCreateView.as_view(), name="lesson-list-create"),

    # Enrollments & Certificates
    path("enrollments/", EnrollmentListCreateView.as_view(), name="enrollment-list"),
    path("certificates/", CertificateListCreateView.as_view(), name="certificate-list"),

    path("lessons/<int:lesson_id>/complete/", complete_lesson, name="lesson-complete"), # Needed for markLessonCompleted in frontend hook
    
    #user profile
    path("me/", me, name="user-profile"),
]
