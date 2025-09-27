from django.contrib import admin
from .models import Course, Lesson, Enrollment  # whatever models you have

admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(Enrollment)

