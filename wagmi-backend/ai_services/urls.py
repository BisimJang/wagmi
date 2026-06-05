from django.urls import path
from .views import StudyBubbleView, CourseBuilderView, CourseIngestionView

urlpatterns = [
    path('study-bubble/', StudyBubbleView.as_view(), name='study-bubble'),
    path('course-builder/', CourseBuilderView.as_view(), name='course-builder'),
    path('ingest/', CourseIngestionView.as_view(), name='course-ingest'),
]
