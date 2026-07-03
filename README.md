# Studyverse

Welcome to Studyverse! 

Studyverse is a decentralized educational ecosystem powered by AI. Beyond acting as a public marketplace for courses and verifiable on-chain certificates, Studyverse serves as an **AI-Native Headless Learning Management System (LMS) Framework** that organizations and schools can use to host their own private curriculums.

## Features

- **Study Bubbles (AI Course Builder):** Users can input any concept they want to learn, and the system dynamically generates a structured "Study Bubble" (a draft course) with modules and quizzes using the Gemini API.
- **AI Course Ingestion:** Schools can drag-and-drop their existing PDFs and documents, and Gemini automatically structures them into Studyverse courses.
- **AI Tutor:** A conversational agent integrated into the learning dashboard that helps students master their current modules.
- **Multi-Tenant B2B Architecture:** Enables organizations to manage their own students, data, and courses securely.
- **Hybrid Logins:** Supports both traditional Email/Password logins and Web3 wallets.

## Project Structure

- `wagmi-dapp/`: The React + Vite frontend application.
- `wagmi-backend/`: The Django REST API backend handling AI integration (`ai_services`), multi-tenant B2B logic (`organizations`), and data persistence.
- `studyverse-contracts/`: Smart contracts for the Solana blockchain.
- `solana-programs/`: Additional Solana programs.

## Developer Guides

Check out the specific guides in the root directory:
- `CHARLES_README.md`: AI Integration Guide (Gemini API logic, prompting).
- `TUAM_README.md`: Frontend UI & UX Guide (React components, design).
- `STUDYVERSE_FRAMEWORK.md`: Detailed framework architecture documentation.

## Getting Started

To get started with local development, you can run the provided scripts from the project root:

**Windows:**
```bat
start_dev.bat
```

**Linux/Mac:**
```bash
./start_dev.sh
```
