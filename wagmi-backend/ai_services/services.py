# Charles: This is where your AI logic goes!
# You'll use the google-genai SDK to interact with Gemini.
# Example: from google import genai

def generate_study_bubble_response(course_context, user_message):
    """
    Called when a student sends a message to their Study Bubble.
    course_context: dict containing current module details.
    user_message: str containing the student's question.
    """
    # TODO (Charles): Implement Gemini API call here
    # 1. Construct system prompt using course_context
    # 2. Call Gemini
    # 3. Return the response text
    
    # Placeholder return:
    return f"This is a placeholder response from your Study Bubble. You asked: {user_message}"

def generate_course_content(prompt):
    """
    Called when an instructor wants to automatically generate a course.
    prompt: str, e.g. "Create a 5-module course on Solana"
    """
    # TODO (Charles): Implement Gemini API call here
    # 1. Ask Gemini to generate JSON structured output for a course
    # 2. Return the parsed JSON
    
    # Placeholder return:
    return {
        "title": "AI Generated Course",
        "description": f"Based on: {prompt}",
        "modules": []
    }

def ingest_course_document(file_obj):
    """
    Called when a school uploads an existing PDF/Doc curriculum.
    file_obj: The uploaded file.
    """
    # TODO (Charles): Implement Gemini File API call here
    # 1. Upload the document to Gemini using the File API
    # 2. Prompt Gemini to extract the syllabus and modules into structured JSON
    # 3. Return the parsed JSON
    
    return {
        "title": "Ingested Course",
        "description": "Extracted from uploaded document",
        "modules": []
    }

