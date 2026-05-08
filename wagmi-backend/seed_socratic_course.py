import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from courses.models import Course, Section, Lesson

User = get_user_model()

def run():
    print("MINTING THE SOCRATIC DIALOGUE MASTER CHRONICLE...")

    # Create/Get instructor
    instructor, created = User.objects.get_or_create(
        email="socrates@athens.edu",
        defaults={
            "display_name": "Socrates",
            "is_staff": True
        }
    )
    if created:
        instructor.set_password('wagmi2024')
        instructor.save()

    # Create Course
    course, created = Course.objects.get_or_create(
        title="The Socratic Dialogue",
        defaults={
            "description": "A deep exploration of the Socratic method, intellectual sovereignty, and the uncompromising pursuit of truth. Learn to unexamine the examined life and master the art of the question.",
            "instructor": instructor,
            "price": 0.001,
            "division": "both",
            "category": "Philosophy & Mastery",
            "image_url": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=1600"
        }
    )
    
    # Clear old sections
    Section.objects.filter(course=course).delete()

    sections_data = [
        {
            "title": "SECTION 1: THE TRIAL & SOVEREIGNTY",
            "order": 1,
            "lessons": [
                {
                    "title": "Death Over Conformity: The Trial of 399 BC",
                    "content": "Socrates was brought to trial for 'corrupting the youth' and 'impiety'. In his defense, he refused to stop practicing philosophy, even when faced with the death penalty. He believed that to obey people he considered less wise than the pursuit of truth was a betrayal of his soul. He chose the hemlock over silence.",
                    "video_url": "https://www.youtube.com/embed/k2K_p8XzB3k",
                    "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                    "order": 1
                }
            ]
        },
        {
            "title": "SECTION 2: THE SOCRATIC METHOD",
            "order": 2,
            "lessons": [
                {
                    "title": "The Art of Elenchus",
                    "content": "Elenchus is the central technique of the Socratic method. It is a form of cooperative argumentative dialogue between individuals, based on asking and answering questions to stimulate critical thinking and to draw out ideas and underlying presuppositions.",
                    "video_url": "https://www.youtube.com/embed/H7m9_5H29S4",
                    "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                    "order": 1
                },
                {
                    "title": "Socratic Irony",
                    "content": "Socratic irony is a technique where the teacher pretends to be ignorant of a subject in order to lure the student into revealing their own ignorance or illogical thinking. By taking the position of the 'learner', Socrates forced his interlocutors to justify their positions from the ground up.",
                    "video_url": "https://www.youtube.com/embed/H7m9_5H29S4",
                    "order": 2
                }
            ]
        },
        {
            "title": "SECTION 3: ETHICS & VIRTUE",
            "order": 3,
            "lessons": [
                {
                    "title": "Virtue as Knowledge",
                    "content": "Socrates famously claimed that 'virtue is knowledge'. This implies that if one knows what is good, one will inevitably do what is good. Therefore, all wrongdoing is a result of ignorance. We will examine the implications of this theory on modern ethics and personal accountability.",
                    "video_url": "https://www.youtube.com/embed/H7m9_5H29S4",
                    "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                    "order": 1
                }
            ]
        }
    ]

    for s_data in sections_data:
        section = Section.objects.create(
            course=course,
            title=s_data["title"],
            order=s_data["order"]
        )
        for l_data in s_data["lessons"]:
            Lesson.objects.create(
                section=section,
                title=l_data["title"],
                content=l_data["content"],
                video_url=l_data.get("video_url", ""),
                audio_url=l_data.get("audio_url", ""),
                order=l_data["order"]
            )
    
    print("========================================")
    print("SUCCESS: THE SOCRATIC DIALOGUE SEEDED.")
    print("========================================")

if __name__ == "__main__":
    run()
