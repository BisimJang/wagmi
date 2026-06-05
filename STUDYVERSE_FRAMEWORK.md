# The Studyverse Framework

Studyverse is a decentralized educational ecosystem powered by AI. Beyond acting as a public marketplace for courses and verifiable on-chain certificates, Studyverse serves as an **AI-Native Headless Learning Management System (LMS) Framework** that organizations and schools can use to host their own private curriculums.

## AI Integration (Gemini)

Studyverse heavily leverages the Gemini API to provide an adaptive learning experience:
1. **Study Bubbles (AI Course Builder):** Users can input any concept they want to learn, and the system dynamically generates a structured "Study Bubble" (a draft course) with modules and quizzes.
2. **AI Course Ingestion:** Schools can drag-and-drop their existing PDFs and documents, and Gemini automatically structures them into Studyverse courses.
3. **AI Tutor:** A conversational agent integrated into the learning dashboard that helps students master their current modules.

## Organizational Structure (B2B Multi-Tenant)

The framework is designed to allow external organizations to manage their own students, data, and courses securely, while still leveraging the Studyverse engine.

### 1. The `organizations` Application
At the core of the multi-tenant architecture is a dedicated backend service that separates organizational management from the public marketplace.

- **Organizations:** Represent a school or entity. Organizations are managed by an administrator or instructor.
- **Organization Memberships:** A linkage that connects a `WalletUser` (Student) to an `Organization`.

### 2. Private Course Visibility
Organizations can create courses using the Studyverse builder tools.
- **Public Courses:** Visible on the general Studyverse "Explore" page and accessible to any public user.
- **Private Courses:** Handled via an `is_public` toggle. Private courses are completely hidden from the public API and are only returned if the requesting user has an active `OrganizationMembership` for the school that owns the course.

### 3. Student Provisioning & Traditional Auth
While Studyverse heavily utilizes Web3 wallet authentication, organizations often need to onboard students who do not yet have crypto wallets.
- **Admin Provisioning:** The framework provides APIs for School Administrators to manually add student data (Name, Email, Password).
- **Hybrid Logins:** The system automatically generates a traditional login for these students. They can log in via Email/Password to access their private curriculum, bypassing the need for a wallet until they are ready to claim their on-chain certificates.

### 4. Integration & Extensibility
Because the architecture is strictly headless (Django REST API separated from the React client), organizations can:
1. **Use the Studyverse Client:** Organizations can instruct their students to log into the main Studyverse frontend, where their private courses will seamlessly appear in their dashboard.
2. **Build Custom Clients:** Organizations can hit the Studyverse API from their *own* external websites to fetch their private courses and student progress data, using Studyverse purely as a backend content engine.

## Next Steps for Implementation (Gemini XPRIZE Scope)
- Generate the `ai_services` Django app for Gemini integration (Study Bubbles and Course Ingestion).
- Deploy the Django backend to Google Cloud Run.
- Integrate Paystack for fiat monetization of standard courses.
- Build the Drag-and-Drop Course Ingestion UI for instructors.
- Expand the `StudyBubbleView` dashboard with an integrated AI Chat Tutor.
- Expand the frontend authentication modal to support the generated Email/Password logins.
