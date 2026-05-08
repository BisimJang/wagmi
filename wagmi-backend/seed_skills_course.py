import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course, Section, Lesson

def run():
    print("POPULATING 'WHAT ARE SKILLS' COURSE...")

    # Find the specific course
    try:
        course = Course.objects.get(title="WHAT ARE  SKILLS>\\?")
    except Course.DoesNotExist:
        print("Course not found by exact title. Searching for similar title...")
        course = Course.objects.filter(title__icontains="SKILLS").first()
        if not course:
            print("ERROR: Could not find the course.")
            return

    print(f"Found course: {course.title} (ID: {course.id})")

    # Clear old sections
    Section.objects.filter(course=course).delete()

    sections_data = [
        {
            "title": "1. THE TEA MODEL",
            "order": 1,
            "lessons": [
                {
                    "title": "A Better Way to Think About Skills",
                    "content": """## What Are Skills? (A Better Way to Think About Them)

I’ve been thinking about skills differently lately.

Not as titles. Not as labels like “developer” or “designer.”
But as something more fluid—something measurable.

Using what I call the **TEA model**, a skill is simply:

> The **Time**, **Energy**, and **Action** invested into increasing the value of something.

Value can take many forms—money, knowledge, emotion, utility—anything people inherently care about.

### Why “TEA”?

Honestly? I like tea.

But it fits better than expected.

Tea isn’t just tea. It varies:

* Flavor
* Strength
* Quality
* Brew time
* Preparation method

Two people can start with the same leaves and end up with completely different results.

Skills work the same way.

* **Time** determines depth
* **Energy** determines intensity
* **Action** determines effectiveness

And just like tea, the outcome depends on *how well* you manage all three.""",
                    "order": 1
                }
            ]
        },
        {
            "title": "2. THE MULTIDISCIPLINARY PROBLEM",
            "order": 2,
            "lessons": [
                {
                    "title": "The Problem With Having “Many Skills”",
                    "content": """This whole line of thinking started with a simple issue:

People would ask me what I do, and I couldn’t answer clearly.

Not because I lacked skills—but because I had *too many across different areas*.

I wasn’t one thing.

And that’s where confusion starts.

When your abilities span multiple domains, you stop fitting into clean labels. You’re not just:

* a developer
* an engineer
* a designer

You’re a combination.

So the real problem isn’t a lack of skill.

It’s **lack of clarity in how those skills connect**.""",
                    "order": 1
                }
            ]
        },
        {
            "title": "3. GROUPING VS NAMING",
            "order": 3,
            "lessons": [
                {
                    "title": "Grouping Skills Instead of Naming Yourself",
                    "content": """Instead of forcing a title, it makes more sense to group skills into categories and look at intersections.

For example:

### 1. Builder Skills
Execution-heavy: Engineering, Software development, Systems creation.

### 2. Thinking Skills
How you process problems: Systems thinking, Problem-solving, Abstraction.

### 3. Creative Skills
How you shape outputs: Design, Storytelling, Concept development.

### 4. Leverage Skills
How you extract value: Communication, Product thinking, Market awareness.

Individually, these are just ingredients. But when combined, they form something more powerful.""",
                    "order": 1
                }
            ]
        },
        {
            "title": "4. IDENTITY AT THE INTERSECTION",
            "order": 4,
            "lessons": [
                {
                    "title": "Identity Isn’t a Skill—It’s an Intersection",
                    "content": """The better question isn’t: “What do I do?”
It’s: “What problems can I solve with the combination of my skills?”

That’s where identity actually forms. At the intersection.

* Tech + Design → Product Builder
* Tech + Community → Ecosystem Builder
* Systems + Creativity → Concept Designer

You’re not one lane. You’re a junction.""",
                    "order": 1
                }
            ]
        },
        {
            "title": "5. THE ECONOMICS OF SKILL",
            "order": 5,
            "lessons": [
                {
                    "title": "What Actually Makes Money?",
                    "content": """Here’s where things get real. Skills alone don’t generate income.

What does is:
> **Skills × Demand × Leverage**

You need:
* Something you can do
* Something people want
* A way to scale or repeat it

Without demand, skills are hobbies. Without leverage, they don’t grow.""",
                    "order": 1
                }
            ]
        },
        {
            "title": "6. WINNING COMBINATIONS",
            "order": 6,
            "lessons": [
                {
                    "title": "Skill Combinations That Work",
                    "content": """Certain combinations consistently produce value:

* **Technical + Distribution**: Build something and know how to get it in front of people.
* **Technical + Business Thinking**: Solve real problems people are willing to pay for.
* **Creative + Technical**: Hard to replicate, high differentiation.
* **Systems Thinking + Execution**: Not just doing work, but designing how work gets done.

These are the blends that “brew money.”""",
                    "order": 1
                }
            ]
        },
        {
            "title": "7. THE JOY/INCOME TENSION",
            "order": 7,
            "lessons": [
                {
                    "title": "Joy vs Income",
                    "content": """There’s also a tension people don’t talk about enough. Not everything you enjoy makes money.

Think of it in three zones:
* **Joy Zone** — what you like
* **Value Zone** — what people pay for
* **Strength Zone** — what you’re good at

The goal is the overlap. 
* Joy without value → hobby
* Value without joy → burnout
* Strength without both → wasted potential""",
                    "order": 1
                }
            ]
        },
        {
            "title": "8. POSITIONING FOR VALUE",
            "order": 8,
            "lessons": [
                {
                    "title": "Defining Your Value",
                    "content": """It’s not about having too many skills. It’s about **not positioning them properly**.

If you can’t explain what you do, it’s usually because:
* Your skills aren’t grouped
* Your output isn’t defined
* Your value isn’t tied to a clear problem""",
                    "order": 1
                }
            ]
        },
        {
            "title": "9. BREWING THE FINAL PRODUCT",
            "order": 9,
            "lessons": [
                {
                    "title": "Brewing Something That Matters",
                    "content": """Going back to the tea analogy:
* Skills are ingredients
* The market is the taste
* Money is someone choosing to drink what you made

You don’t get rewarded for having ingredients. You get rewarded for brewing something people actually want.

### Final Thought
You don’t need fewer skills. You need better combinations.
And more importantly—you need to apply them toward something real.
Because at the end of the day, skill isn’t what you have. It’s what you can **consistently turn into value**.""",
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
                order=l_data["order"]
            )
    
    print("========================================")
    print(f"SUCCESS: '{course.title}' POPULATED.")
    print("========================================")

if __name__ == "__main__":
    run()
