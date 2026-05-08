# wagmi-backend/rebrand_course.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course, Section, Lesson

def rebrand_course_19():
    try:
        course = Course.objects.get(id=19)
        course.title = "Backend Engineering Mastery"
        course.description = "A comprehensive, node-based curriculum for building industrial-grade backend systems. Master the architectural patterns, data consistency models, and performance optimizations used in world-class infrastructure."
        course.division = "builders"
        course.category = "Engineering"
        course.save()
        
        print(f"Rebranded Course {course.id}: {course.title}")

        # Clear existing sections
        course.sections.all().delete()
        print("Cleared old sections.")

        # Add Knowledge Nodes
        nodes_data = [
            {
                'title': 'Node A: Identity & Access Systems',
                'lessons': [
                    {'title': 'JWT & Session Management', 'content': 'Designing secure, stateless and stateful authentication systems.'},
                    {'title': 'OAuth2 & Third-Party Integration', 'content': 'Implementing standardized authorization flows for modern applications.'},
                    {'title': 'Granular Permission Architectures', 'content': 'Building robust RBAC and ABAC systems for complex user hierarchies.'}
                ]
            },
            {
                'title': 'Node B: High-Performance Data Persistence',
                'lessons': [
                    {'title': 'Relational Database Optimization', 'content': 'Advanced PostgreSQL techniques: Indexing, Partitioning, and Query Tuning.'},
                    {'title': 'Distributed Caching Strategies', 'content': 'Leveraging Redis and Memcached for low-latency data retrieval.'},
                    {'title': 'Data Consistency Models', 'content': 'Navigating the CAP theorem: ACID vs. BASE in modern distributed systems.'}
                ]
            },
            {
                'title': 'Node C: API Engines & Concurrency',
                'lessons': [
                    {'title': 'High-Performance API Design', 'content': 'Building type-safe, asynchronous API engines with Python and Node.js.'},
                    {'title': 'Background Processing & Task Queues', 'content': 'Implementing reliable task orchestration with Celery and RabbitMQ.'},
                    {'title': 'Real-time Event Streaming', 'content': 'Designing event-driven architectures with Websockets and Pub/Sub patterns.'}
                ]
            },
            {
                'title': 'Node D: Infrastructure & Observability',
                'lessons': [
                    {'title': 'Containerization & Orchestration', 'content': 'Standardizing environments with Docker and Kubernetes.'},
                    {'title': 'Continuous Integration & Delivery', 'content': 'Automating the engineering pipeline from local commit to production deployment.'},
                    {'title': 'Telemetry & Performance Monitoring', 'content': 'Instrumenting systems with Prometheus, Grafana, and ELK stacks.'}
                ]
            }
        ]

        for idx, node in enumerate(nodes_data):
            section = Section.objects.create(
                course=course,
                title=node['title'],
                order=idx
            )
            print(f"  Added Node: {section.title}")
            
            for l_idx, lesson_data in enumerate(node['lessons']):
                Lesson.objects.create(
                    section=section,
                    title=lesson_data['title'],
                    content=lesson_data['content'],
                    order=l_idx
                )
                print(f"    Added Lesson: {lesson_data['title']}")

        print("\nRebranding and Expansion Complete.")

    except Course.DoesNotExist:
        print("Course 19 not found.")

if __name__ == "__main__":
    rebrand_course_19()
