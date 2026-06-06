# 'Tuam's Frontend Guide (Gemini XPRIZE Hackathon)

Welcome to the Studyverse Hackathon Pivot! Our goal is to win the Gemini XPRIZE in the "Education & Human Potential" category.

## Your Role: Frontend UI & UX
You are responsible for making this application look amazing and interact seamlessly with our new AI features. We need an interface that wows the judges.

### Core Objectives
1. **Enhance the BubbleGenesisModal:** Jason has already built the foundational `BubbleGenesisModal.jsx`. Your job is to upgrade the file upload section into a fully functional "Drag-and-Drop" zone for Course Ingestion (allowing schools to drop their PDFs/Docs).
2. **AI Tutor Chat UI ("Study Bubbles"):** Jason has already built the `StudyBubbleView.jsx` dashboard. Students need a chat interface built directly into this view (e.g., a slide-out panel on the right) where they can interact with the AI tutor about their current lesson node.

### Where You Will Work
Your main playground will be in the React/Vite app:
`wagmi-dapp/src/`

Specifically, you will be creating and styling new components like `StudyBubble.jsx` and `AICourseBuilder.jsx`. 

### To-Do List
- [ ] Review Jason's existing `BubbleGenesisModal.jsx`. Upgrade the standard file input into a sleek Drag-and-Drop file uploader component.
- [ ] Review Jason's existing `StudyBubbleView.jsx`. Design and integrate the Chat Interface for the AI Tutor into this view. It should look modern and feel native to the Studyverse dashboard.
- [ ] Coordinate with Jason on the API endpoints. He will provide you with the Django REST endpoints (e.g., `/api/ai/bubble/` and `/api/ai/ingest/`) that you will `POST` to.

Let's make this look premium and win this hackathon!
