import os
import django
import random
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from courses.models import Course, Section, Lesson

User = get_user_model()

def run():
    print("MINTING NEW WEB3 FUNDAMENTALS COURSE...")

    # Create instructor
    instructor, created = User.objects.get_or_create(
        email="satoshi@example.com",
        defaults={
            "display_name": "SatoshiN",
            "is_staff": True
        }
    )
    if created:
        instructor.set_password('wagmi2024')
        instructor.save()
        print("Created new Instructor: SatoshiN")

    # Create main Course
    course, created = Course.objects.get_or_create(
        title="WEB3 FUNDAMENTALS",
        defaults={
            "description": "Understand the core architecture of the decentralized web. This course strips away the hype and focuses entirely on the technical realities of Wallets, Smart Contracts, Consensus Mechanisms, and Web3 frontend integration.",
            "instructor": instructor,
            "price": 0.05,
            "division": "builders",
            "category": "Blockchain Engineering",
            "image_url": "https://images.unsplash.com/photo-1639322537231-2f206e06af84?auto=format&fit=crop&q=80&w=1600"
        }
    )
    
    if not created:
        print("Course already exists. Updating...")
        course.description = "Understand the core architecture of the decentralized web. This course strips away the hype and focuses entirely on the technical realities of Wallets, Smart Contracts, Consensus Mechanisms, and Web3 frontend integration."
        course.image_url = "https://images.unsplash.com/photo-1639322537231-2f206e06af84?auto=format&fit=crop&q=80&w=1600"
        course.save()

    # Clear old sections just in case
    Section.objects.filter(course=course).delete()

    sections_data = [
        {
            "title": "SECTION 1: THE LEDGER & CONSENSUS",
            "order": 1,
            "lessons": [
                {
                    "title": "1.1 The Distributed State Machine",
                    "content": "At its core, a blockchain is simply a distributed state machine. It is a highly redundant database network that relies on cryptography to guarantee state transitions. We will cover block headers, Merkle roots, and how transactions are structured before being broadcasted to the mempool.",
                    "video_url": "https://www.youtube.com/embed/bBC-nXj3Ng4",
                    "image_url": "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=800",
                    "order": 1
                },
                {
                    "title": "1.2 Proof of Work vs. Proof of Stake",
                    "content": "Consensus mechanisms are how a trustless network agrees on the final state of the database. Proof of Work requires hardware to burn electricity (hashcash), while Proof of Stake requires software nodes to lock up capital (validators). We will examine the economic security guarantees of both.",
                    "video_url": "https://www.youtube.com/embed/bBC-nXj3Ng4",
                    "image_url": "",
                    "order": 2
                }
            ]
        },
        {
            "title": "SECTION 2: CRYPTOGRAPHY & WALLETS",
            "order": 2,
            "lessons": [
                {
                    "title": "2.1 Public Key Infrastructure",
                    "content": "Web3 identity is built entirely on Public Key Cryptography. Your 'Account' is just an Elliptic Curve pairing. The Private Key is a randomly generated 256-bit number. The Public Key is derived from it, and your Public Address is a hash of the Public Key. If you lose the Private Key, you lose write-access to the state machine forever.",
                    "video_url": "https://www.youtube.com/embed/bBC-nXj3Ng4",
                    "image_url": "https://images.unsplash.com/photo-1639803154854-8c886e08dd17?auto=format&fit=crop&q=80&w=800",
                    "order": 1
                },
                {
                    "title": "2.2 Seed Phrases (BIP-39)",
                    "content": "Nobody wants to memorize a 256-bit hexadecimal string. BIP-39 is a standard that translates that entropy into 12 or 24 human-readable words. From this seed phrase, Hierarchical Deterministic (HD) wallets can generate infinite child private keys.",
                    "video_url": "https://www.youtube.com/embed/bBC-nXj3Ng4",
                    "image_url": "",
                    "order": 2
                }
            ]
        },
        {
            "title": "SECTION 3: SMART CONTRACTS (EVM)",
            "order": 3,
            "lessons": [
                {
                    "title": "3.1 The Ethereum Virtual Machine",
                    "content": "The EVM is the runtime environment for smart contracts. It is a Turing-complete, stack-based machine. When you deploy a contract written in Solidity, it compiles down to EVM bytecodes. Every node in the network computes these opcodes to verify execution.",
                    "video_url": "https://www.youtube.com/embed/bBC-nXj3Ng4",
                    "image_url": "https://images.unsplash.com/photo-1644361566696-3d442b5b482a?auto=format&fit=crop&q=80&w=800",
                    "order": 1
                },
                {
                    "title": "3.2 Gas Economics",
                    "content": "Because the EVM is Turing-complete, it is vulnerable to infinite loops (the Halting Problem). To prevent the network from crashing, every opcode costs 'Gas'. If your transaction runs out of gas mid-execution, the transaction reverts, but the validator keeps the gas fee for the computational work expended.",
                    "video_url": "https://www.youtube.com/embed/bBC-nXj3Ng4",
                    "image_url": "",
                    "order": 2
                }
            ]
        }
    ]

    for section_data in sections_data:
        section = Section.objects.create(
            course=course,
            title=section_data["title"],
            order=section_data["order"]
        )
        print(f"Created {section.title}")

        for lesson_data in section_data["lessons"]:
            Lesson.objects.create(
                section=section,
                title=lesson_data["title"],
                content=lesson_data["content"],
                video_url=lesson_data["video_url"],
                image_url=lesson_data["image_url"],
                order=lesson_data["order"]
            )
            print(f"  -> Added Lesson: {lesson_data['title']}")

    print("========================================")
    print("SUCCESS: WEB3 FUNDAMENTALS COURSE SEEDED.")
    print("========================================")

if __name__ == "__main__":
    run()
