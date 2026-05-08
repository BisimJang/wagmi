# wagmi-backend/seed_mastery_backend.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course, Section, Lesson, SovereignSchool
from django.contrib.auth import get_user_model

User = get_user_model()

def seed_mastery_backend():
    # 1. Get or Create Instructor
    instructor, _ = User.objects.get_or_create(
        address='0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        defaults={'display_name': 'THE_ARCHITECT'}
    )

    # 2. Get or Create School (Using a VALID hex address now)
    school, _ = SovereignSchool.objects.get_or_create(
        address='0x642f23EC359f2bF0a9C1891d1DEeb41B8A084e4c',
        defaults={'name': 'CODE CULTURE: ENGINEERING', 'instructor': instructor}
    )

    # 3. Create the Mastery Course
    course, created = Course.objects.update_or_create(
        title="Backend Engineering Mastery",
        defaults={
            'description': "A comprehensive, node-based curriculum for building industrial-grade backend systems. Master the architectural patterns, data consistency models, and performance optimizations used in world-class infrastructure.",
            'instructor': instructor,
            'price': 0.05,
            'division': 'builders',
            'category': 'Engineering',
            'school': school,
            'school_name': school.name,
            'school_address': school.address,
            'image_url': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=1000'
        }
    )

    if created:
        print(f"Created Course: {course.title}")
    else:
        print(f"Updated Course: {course.title}")

    # Clear existing nodes to start fresh
    course.sections.all().delete()

    # 4. Define Knowledge Nodes (Enriched Content)
    nodes_data = [
        {
            'title': 'Node A: Identity & Access Systems',
            'lessons': [
                {
                    'title': 'JWT & Session Management', 
                    'content': "<h3>Designing Secure Authentication</h3><p>In modern backend engineering, choosing between stateless JWTs and stateful sessions is a critical architectural decision.</p>",
                    'video_url': 'https://www.youtube.com/watch?v=7Q17ubqL6Us'
                },
                {
                    'title': 'OAuth2 & Third-Party Integration', 
                    'content': "<h3>The Standardized Authorization Flow</h3><p>OAuth2 is the industry standard for granting third-party access without sharing credentials.</p>",
                    'video_url': 'https://www.youtube.com/watch?v=CPbvxxvl248'
                }
            ]
        },
        {
            'title': 'Node B: High-Performance Data Persistence',
            'lessons': [
                {
                    'title': 'Relational Database Optimization', 
                    'content': "<h3>Scaling the Source of Truth</h3><p>A backend is only as fast as its database. For relational systems like PostgreSQL, optimization starts at the index level.</p>",
                    'video_url': 'https://www.youtube.com/watch?v=HwbS8ZcQ2XU'
                }
            ]
        }
    ]

    for idx, node in enumerate(nodes_data):
        section = Section.objects.create(
            course=course,
            title=node['title'],
            order=idx
        )
        print(f"  Created Node: {section.title}")
        
        for l_idx, lesson_data in enumerate(node['lessons']):
            Lesson.objects.create(
                section=section,
                title=lesson_data['title'],
                content=lesson_data['content'],
                video_url=lesson_data.get('video_url', ''),
                order=l_idx
            )
            print(f"    Added Lesson: {lesson_data['title']}")

    print("\nMastery Seeding Complete.")

if __name__ == "__main__":
    seed_mastery_backend()
