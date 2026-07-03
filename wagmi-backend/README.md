# Studyverse Backend

This is the backend service for **Studyverse**, built with Django and Django REST Framework.

## Core Applications

- `ai_services/`: Handles integration with the Gemini API to power "Study Bubbles" (AI course generation) and course ingestion (parsing PDFs/Docs into courses).
- `organizations/`: Manages the multi-tenant architecture, allowing schools and organizations to manage their own users and private curriculums.
- `authwallet/`: Manages user authentication, supporting both Web3 wallets and traditional Email/Password logins.
- `courses/`: Core LMS logic for storing courses, modules, and tracking student progress.

## Setup & Running

It is recommended to use a Python virtual environment.
To start the backend server for local development:

```bash
# Activate your virtual environment
# e.g., on Windows:
# .\.venv\Scripts\activate

pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver
```

For more details on the overall project structure, please see the `README.md` at the root of the workspace.
