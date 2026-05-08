# wagmi-backend/seed_architecture_course.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course, Section, Lesson, SovereignSchool
from django.contrib.auth import get_user_model

User = get_user_model()

def seed_architecture_course():
    # 1. Get or Create Instructor
    instructor, _ = User.objects.get_or_create(
        address='0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        defaults={'display_name': 'THE_ARCHITECT'}
    )

    # 2. Get or Create School
    school, _ = SovereignSchool.objects.get_or_create(
        address='0x642f23EC359f2bF0a9C1891d1DEeb41B8A084e4c',
        defaults={'name': 'STUDYVERSE: ACADEMY', 'instructor': instructor}
    )

    # 3. Create the Architecture Course
    course, created = Course.objects.update_or_create(
        title="Web3 Architecture: EVM vs. Solana",
        defaults={
            'description': "A deep-dive into the two most dominant architectural patterns in blockchain. Understand why Ethereum chose sequential execution and why Solana is built for parallel performance.",
            'instructor': instructor,
            'price': 0.01,
            'division': 'builders',
            'category': 'Architecture',
            'school': school,
            'school_name': school.name,
            'school_address': school.address,
            'image_url': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1000'
        }
    )

    # Clear existing nodes to start fresh
    course.sections.all().delete()

    nodes_data = [
        {
            'title': 'Node 1: The Account Models',
            'lessons': [
                {
                    'title': 'EVM: State and Logic Monoliths', 
                    'content': "<h3>The Account Model</h3><p>In the EVM, your smart contract holds its own state and its own code. This makes development simple but limits parallel scaling.</p>",
                    'video_url': 'https://www.youtube.com/watch?v=7Q17ubqL6Us'
                },
                {
                    'title': 'Solana: Stateless Programs', 
                    'content': "<h3>The Program Model</h3><p>On Solana, code is immutable and stateless. All data is stored in separate 'Data Accounts', allowing the Sealevel engine to process thousands of transactions in parallel.</p>",
                    'video_url': 'https://www.youtube.com/watch?v=f_VvD_65TjU'
                }
            ]
        },
        {
            'title': 'Node 2: Execution Engines',
            'lessons': [
                {
                    'title': 'The Global Lock (Ethereum)', 
                    'content': "<h3>Sequential Integrity</h3><p>Ethereum ensures security by processing transactions in a single line. This prevents double-spending but creates bottlenecks during high demand.</p>",
                    'video_url': 'https://www.youtube.com/watch?v=CPbvxxvl248'
                },
                {
                    'title': 'Parallel Pipelines (Solana)', 
                    'content': "<h3>High-Throughput Engineering</h3><p>Learn how Solana uses Pipelining and Gulf Stream to predict and process transactions before they are even added to a block.</p>",
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
        for l_idx, lesson_data in enumerate(node['lessons']):
            Lesson.objects.create(
                section=section,
                title=lesson_data['title'],
                content=lesson_data['content'],
                video_url=lesson_data.get('video_url', ''),
                order=l_idx
            )

    print("\nArchitecture Course Seeding Complete.")

if __name__ == "__main__":
    seed_architecture_course()
