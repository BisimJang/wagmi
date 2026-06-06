# Charles's AI Integration Guide (Gemini XPRIZE Hackathon)

Welcome to the Studyverse Hackathon Pivot! Our goal is to win the Gemini XPRIZE in the "Education & Human Potential" category.

## Your Role: AI Logic & Gemini Prompts
You are responsible for making this application "AI-Native". We are integrating the **Gemini API** into the Django backend to power the educational features.

### Core Objectives
1. **Study Bubbles (AI Course Builder):** We need scripts/functions that take any new concept a user wants to learn and use Gemini to generate a "Study Bubble"—a structured JSON draft course, including modules and quizzes.
2. **AI Course Ingestion (For Schools):** Schools can use the framework for their departments by uploading their existing curriculums (PDFs, Docs). We need a script that uses Gemini to ingest these documents and automatically convert them into our structured JSON course format.
3. **AI Tutor:** A conversational agent trained on the course material that can answer student questions accurately and keep them engaged.

### Where You Will Work
Jason and the AI Assistant will set up a new Django app called `ai_services`.
Your main playground will be:
`wagmi-backend/ai_services/services.py`

This file will contain the python functions that communicate with the Gemini API. We will handle wrapping your functions in API views so the frontend can hit them.

### To-Do List
- [ ] Review the `google-genai` Python SDK documentation, specifically for handling file uploads (PDFs) via the Gemini File API.
- [ ] Draft prompt templates for generating Study Bubbles (outputting structured JSON).
- [ ] Draft prompts for Course Ingestion (extracting curriculum from raw school documents).
- [ ] Draft system instructions for the AI Tutor to constrain its knowledge to specific course contexts.
- [ ] Drop your logic into the `services.py` shell once Jason has it set up.

Let's win this!
