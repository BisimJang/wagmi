from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import generate_study_bubble_response, generate_course_content

class StudyBubbleView(APIView):
    def post(self, request):
        user_message = request.data.get("message")
        course_context = request.data.get("course_context", {})
        
        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Call Charles's function
        ai_response = generate_study_bubble_response(course_context, user_message)
        
        return Response({"reply": ai_response})

class CourseBuilderView(APIView):
    def post(self, request):
        prompt = request.data.get("prompt")
        
        if not prompt:
            return Response({"error": "Prompt is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Call Charles's function
        course_data = generate_course_content(prompt)
        
        return Response(course_data)

class CourseIngestionView(APIView):
    def post(self, request):
        uploaded_file = request.FILES.get('file')
        
        if not uploaded_file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Call Charles's ingestion function
        from .services import ingest_course_document
        course_data = ingest_course_document(uploaded_file)
        
        return Response(course_data)

