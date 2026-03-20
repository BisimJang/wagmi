from django.contrib import admin
from .models import Course, Lesson, Enrollment, Section, SovereignSchool, Certificate

@admin.register(SovereignSchool)
class SovereignSchoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'instructor', 'created_at')
    search_fields = ('name', 'address', 'instructor__address')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'price', 'is_minted', 'school_name')
    list_filter = ('is_minted',)
    search_fields = ('title', 'school_name', 'school_address')

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'order')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'status', 'enrolled_at')
    list_filter = ('status',)

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('token_id', 'user', 'course', 'issued_at')

