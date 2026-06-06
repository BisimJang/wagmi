from rest_framework import generics, status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import json
from .models import Course, Section, Lesson, Enrollment, Certificate, LessonProgress, SovereignSchool, StudyBubble
from django.core.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (
    CourseSerializer,
    SectionSerializer,
    LessonSerializer,
    EnrollmentSerializer,
    CertificateSerializer,
    LessonProgressSerializer,
    UserProfileSerializer,
    CurriculumLessonSerializer,
    StudyBubbleSerializer,
)
import logging
from django.http import HttpResponse
from .dynamic_assets import generate_certificate_svg
from eth_account import Account
from eth_account.messages import encode_defunct
from web3 import Web3
from django.conf import settings

logger = logging.getLogger(__name__)


from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination

from django.db.models import Q

class CoursePagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 100

class CourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter]
    search_fields = ['title', 'description', 'school_name', 'school__name']
    pagination_class = CoursePagination

    def get_queryset(self):
        user = self.request.user
        base_qs = Course.objects.all().order_by('-created_at')
        if user.is_authenticated:
            # Show public courses OR private courses where user is a member of the school
            return base_qs.filter(
                Q(is_public=True) | Q(school__memberships__user=user)
            ).distinct()
        return base_qs.filter(is_public=True)

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
            raise PermissionDenied("You must be logged in to create a course.")
        
        # Ensure the user gets staff/instructor status
        if not user.is_staff:
            user.is_staff = True
            user.save()
            
        serializer.save(instructor=user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class SectionListCreateView(generics.ListCreateAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        if course.instructor != self.request.user:
            raise PermissionDenied("Only the instructor of this course can add sections.")
        serializer.save()


class LessonListCreateView(generics.ListCreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        section = serializer.validated_data.get('section')
        if section.course.instructor != self.request.user:
            raise PermissionDenied("Only the instructor of this course can add lessons.")
        serializer.save()

class SectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        section = self.get_object()
        if section.course.instructor != self.request.user:
            raise PermissionDenied("Only the instructor of this course can edit this section.")
        serializer.save()

class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        lesson = self.get_object()
        if lesson.section.course.instructor != self.request.user:
            raise PermissionDenied("Only the instructor of this course can edit this lesson.")
        serializer.save()


class EnrollmentListCreateView(generics.ListCreateAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer


@api_view(["POST"])
def enroll_in_course(request, course_id):
    """
    Record an enrollment after frontend confirms on-chain tx.
    Expects JSON: { "tx_hash": "0x...", "wallet_address": "0x..." }.
    """
    user = request.user

    # 1) Validate request body
    tx_hash = request.data.get("tx_hash")
    wallet_address = request.data.get("wallet_address") or getattr(user, "address", None)

    SENTINEL_HASHES = {'on-chain-verified', 'on-chain-sync'}
    if not tx_hash or not isinstance(tx_hash, str) or (not tx_hash.startswith("0x") and tx_hash not in SENTINEL_HASHES):
        return Response({"error": "tx_hash (hex string) is required"}, status=status.HTTP_400_BAD_REQUEST)

    if not wallet_address:
        return Response({"error": "wallet_address is required"}, status=status.HTTP_400_BAD_REQUEST)

    # 2) Load course
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

    # 3) Prevent reuse of the same tx_hash
    if Enrollment.objects.filter(tx_hash=tx_hash).exists():
        return Response({"error": "This transaction has already been used for enrollment."},
                        status=status.HTTP_400_BAD_REQUEST)

    # 4) Prevent duplicate enrollment for same course/user
    if Enrollment.objects.filter(user=user, course=course, status__in=['enrolled', 'completed']).exists():
        return Response({"error": "You are already enrolled in this course."},
                        status=status.HTTP_400_BAD_REQUEST)

    # 5) Enforce max 20 active enrollments (Lifted from 2 for Phase 2)
    active_count = Enrollment.objects.filter(user=user, status='enrolled').count()
    if active_count >= 20:
        return Response({"error": "Maximum of 20 active enrollments allowed."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Optional: verify tx on-chain here (recommended).
    try:
        w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URI))
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=2) # Short timeout as we expect it to be mined or close to it
        
        if receipt['status'] != 1:
            return Response({"error": "On-chain transaction failed. Please check your wallet balance/gas."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the contract address matches
        school_address = Web3.to_checksum_address(course.school_address)
        if Web3.to_checksum_address(receipt['to']) != school_address:
             return Response({"error": "Transaction was sent to the wrong contract."}, 
                            status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.warning(f"On-chain verification skipped or failed: {str(e)}")
        # We allow it to proceed if the RPC is down, but ideally we'd fail here.
        # For now, let's keep it robust but alert.

    try:
        enrollment = Enrollment.objects.create(
            user=user,
            course=course,
            wallet_address=wallet_address,
            tx_hash=tx_hash,
            status='enrolled'
        )
    except Exception as e:
        logger.exception("Failed to create enrollment")
        return Response({"error": f"Failed to create enrollment: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    serializer = EnrollmentSerializer(enrollment)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

from .paystack import initialize_paystack_transaction, verify_paystack_transaction, convert_sol_to_kobo
import uuid

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initialize_fiat_payment(request, course_id):
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if not user.email:
        return Response({"error": "You must have an email address to use Paystack."}, status=status.HTTP_400_BAD_REQUEST)

    # Check if already enrolled
    if Enrollment.objects.filter(user=user, course=course, status__in=['enrolled', 'completed']).exists():
        return Response({"error": "You are already enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)

    amount_in_kobo = convert_sol_to_kobo(course.price)
    if amount_in_kobo <= 0:
        return Response({"error": "Course is free or invalid price. Use standard enrollment."}, status=status.HTTP_400_BAD_REQUEST)

    reference = f"ps_{uuid.uuid4().hex}"
    callback_url = request.data.get('callback_url', f"{request.build_absolute_uri('/')[:-1]}/courses/")
    
    paystack_res = initialize_paystack_transaction(user.email, amount_in_kobo, reference, callback_url)
    
    if paystack_res.get('status'):
        # Pass the course_id to frontend through reference or store it in cache.
        # But we can just use the reference to verify later. We will create a pending enrollment.
        Enrollment.objects.create(
            user=user,
            course=course,
            wallet_address=getattr(user, "address", "paystack_user"),
            tx_hash=reference,
            status='pending' # Will use 'pending' as a custom status internally, though 'enrolled' is in choices
        )
        return Response(paystack_res['data'], status=status.HTTP_200_OK)
    else:
        return Response({"error": paystack_res.get('message', 'Failed to initialize payment')}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_fiat_payment(request):
    reference = request.data.get('reference')
    if not reference:
        return Response({"error": "Reference is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        enrollment = Enrollment.objects.get(tx_hash=reference, user=request.user)
    except Enrollment.DoesNotExist:
        return Response({"error": "Pending enrollment not found for this reference."}, status=status.HTTP_404_NOT_FOUND)

    if enrollment.status == 'enrolled':
        return Response({"message": "Payment already verified.", "enrolled": True}, status=status.HTTP_200_OK)

    paystack_res = verify_paystack_transaction(reference)
    if paystack_res.get('status') and paystack_res['data']['status'] == 'success':
        enrollment.status = 'enrolled'
        enrollment.save()
        return Response({"message": "Payment verified and enrolled.", "enrolled": True}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Payment verification failed or not successful."}, status=status.HTTP_400_BAD_REQUEST)

class CertificateListCreateView(generics.ListCreateAPIView):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def issue_certificate(request, course_id):
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
    
    is_instructor = course.instructor == request.user
    is_enrolled = Enrollment.objects.filter(course=course, user=request.user).exists()
    
    if not (is_instructor or is_enrolled):
        return Response(
            {"error": "You must be enrolled or be the instructor to get a certificate"},
            status=status.HTTP_403_FORBIDDEN
        )

    # Check if the user already has a certificate for this course
    certificate, created = Certificate.objects.get_or_create(
        course=course,
        user=request.user,
        defaults={
            "wallet_address": request.user.address,
            "status": "pending"
        }
    )

    # Base URL for metadata and image
    # Note: Using request.build_absolute_uri() is best for development
    base_url = request.build_absolute_uri('/')[:-1]
    
    certificate.image_uri = f"{base_url}/api/certificates/{certificate.id}/image/"
    certificate.metadata_uri = f"{base_url}/api/certificates/{certificate.id}/metadata/"
    
    # 🎯 NEW: Mint Solana NFT using Node.js script
    import subprocess
    import os
    from django.conf import settings
    import json
    
    script_path = os.path.join(settings.BASE_DIR, 'scripts', 'solana_minter.js')
    student_wallet = request.user.address
    
    if not student_wallet:
        return Response({"error": "You must link a Solana wallet address to your profile first!"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        # Call the Node script to perform the Anchor CPI
        result = subprocess.run([
            'node', script_path, 
            student_wallet, 
            str(course.id), 
            f"{course.title} Certificate", 
            "WAGMI", 
            certificate.metadata_uri
        ], capture_output=True, text=True, check=True)
        
        # Parse the JSON output from the script
        lines = result.stdout.strip().split('\n')
        output = json.loads(lines[-1]) # Grab the last line, which is our JSON
        
        if output.get('success'):
            certificate.tx_hash = output.get('tx_hash')
            certificate.token_id = output.get('mint')
            certificate.status = 'claimed' # Instantly claimed!
        else:
            logger.error(f"Solana Minting Failed: {output.get('error')}")
            certificate.status = 'failed'
            
    except subprocess.CalledProcessError as e:
        logger.error(f"Node script crashed: {e.stderr}")
        certificate.status = 'failed'
    
    certificate.save()

    if certificate.status == 'claimed':
        return Response({
            "message": "Certificate successfully minted to your Solana wallet!",
            "course": course.title,
            "certificate_id": certificate.id,
            "tx_hash": certificate.tx_hash,
            "mint": certificate.token_id,
            "status": certificate.status
        }, status=status.HTTP_201_CREATED)
    else:
        return Response({"error": "Failed to mint NFT on Solana network."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_certificate_image(request, cert_id):
    cert = get_object_or_404(Certificate, pk=cert_id)
    svg_data = generate_certificate_svg(
        student_name=cert.user.display_name or cert.user.full_name or cert.user.address[:10],
        course_title=cert.course.title,
        school_name=cert.course.school_name or "Studyverse Node"
    )
    return HttpResponse(svg_data, content_type="image/svg+xml")

@api_view(["GET"])
@permission_classes([AllowAny])
def get_certificate_metadata(request, cert_id):
    cert = get_object_or_404(Certificate, pk=cert_id)
    metadata = {
        "name": f"Certificate: {cert.course.title}",
        "description": f"Verified Course Completion Certificate for '{cert.course.title}' by {cert.course.instructor.display_name or 'Instructor'}.",
        "image": cert.image_uri,
        "external_url": f"https://studyverse.com/courses/{cert.course.id}",
        "attributes": [
            {"trait_type": "Course", "value": cert.course.title},
            {"trait_type": "Learner", "value": cert.user.display_name or cert.user.address},
            {"trait_type": "Status", "value": "Verified"},
            {"trait_type": "Issue Date", "value": cert.issued_at.strftime("%Y-%m-%d")}
        ]
    }
    return Response(metadata)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_claim_signature(request, cert_id):
    cert = get_object_or_404(Certificate, pk=cert_id)
    if cert.user != request.user:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
    
    private_key = getattr(settings, 'WEB3_OWNER_PRIVATE_KEY', None)
    if not private_key:
        # Fallback to a development key if not set
        private_key = "0x" + "a" * 64 
        
    account = Account.from_key(private_key)
    
    # Contract Expects: keccak256(abi.encodePacked(msg.sender, _courseId, _uri, address(this)))
    # We use web3.solidityKeccak for abi.encodePacked imitation
    course_id = cert.course.id
    student_address = Web3.to_checksum_address(cert.user.address)
    school_address = Web3.to_checksum_address(cert.course.school_address)
    metadata_uri = cert.metadata_uri
    
    chain_id = getattr(settings, 'WEB3_CHAIN_ID', 11155111)
    
    msg_hash = Web3.solidity_keccak(
        ['address', 'uint256', 'string', 'address', 'uint256'],
        [student_address, course_id, metadata_uri, school_address, chain_id]
    )
    
    message = encode_defunct(hexstr=msg_hash.hex())
    signed_message = account.sign_message(message)
    
    return Response({
        "signature": "0x" + signed_message.signature.hex(),
        "metadata_uri": metadata_uri,
        "school_address": school_address,
        "course_id": course_id,
        "signer": account.address
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def sync_claimed_cert(request, cert_id):
    cert = get_object_or_404(Certificate, pk=cert_id)
    tx_hash = request.data.get("tx_hash")
    token_id = request.data.get("token_id")
    
    if not tx_hash:
        return Response({"error": "tx_hash required"}, status=status.HTTP_400_BAD_REQUEST)
        
    cert.tx_hash = tx_hash
    cert.token_id = token_id
    cert.status = 'claimed'
    cert.save()
    
    return Response({"status": "success"})

class LessonProgressViewSet(viewsets.ModelViewSet):
    queryset = LessonProgress.objects.all()
    serializer_class = LessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return progress for the logged-in wallet
        return LessonProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user to the logged-in wallet
        serializer.save(user=self.request.user)

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == "GET":
        serializer = UserProfileSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    elif request.method == "PATCH":
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    

class LessonsAndProgressView(APIView):
    """
    Returns a flat list of lessons (with section metadata) and the user's progress map 
    for the specified course.
    """
    

    def get(self, request, course_id):
        user = request.user
        
        # 1. Fetch all lessons and related sections for the course
        all_lessons = Lesson.objects.filter(
            section__course_id=course_id
        ).select_related('section').order_by('section__order', 'order')

        # 2. Fetch LessonProgress for the current user and these lessons
        progress_queryset = LessonProgress.objects.filter(
            user=user,
            lesson__in=all_lessons
        )
        
        # Create a map of {lesson_id: progress_data} for quick lookup on the frontend
        progress_map = {
            lp.lesson_id: {
                "progress": lp.progress,
                "completed": lp.completed,
                # Add any other fields the frontend might use
            }
            for lp in progress_queryset
        }

        # 3. Serialize the flat list of lessons
        lesson_serializer = CurriculumLessonSerializer(all_lessons, many=True)
        
        # 4. Return the structured data
        return Response({
            "lessons": lesson_serializer.data,  # Flat list of lessons (with section FK data)
            "progress": progress_map             # Map of user progress
        })


# --- 2. complete_lesson (POST Lesson Completion) ---
# Maps to: /api/lessons/<lesson_id>/complete/
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_lesson(request, lesson_id):
    """
    Marks a specific lesson as completed for the authenticated user.
    Requires course_id in the request body for validation.
    """
    try:
        data = request.data
        course_id = data.get('course_id') 
        
        if course_id is None:
            return Response({"detail": "course_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            course_id = int(course_id)
        except (ValueError, TypeError):
            return Response({"detail": "Invalid course_id format."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Verify the Lesson and Course relationship
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        
        if lesson.section.course_id != course_id:
            return Response({"detail": "Lesson verification failed: Lesson does not belong to the specified course."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Create or Update LessonProgress
        lesson_progress, created = LessonProgress.objects.update_or_create(
            user=request.user,
            lesson=lesson,
            defaults={
                'progress': 100.0,
                'completed': True
            }
        )
        
        # 3. Success Response
        return Response(
            {"detail": "Lesson marked as completed successfully.", "id": lesson_progress.id}, 
            status=status.HTTP_200_OK
        )

    except Lesson.DoesNotExist:
        return Response({"detail": "Lesson not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.exception("Error marking lesson complete")
        return Response({"detail": f"An internal error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_mint(request, course_id):
    """
    Confirms that a course has been minted on the blockchain.
    Expects tx_hash and school_address in the request body.
    """
    try:
        course = Course.objects.get(id=course_id)
        
        # Only the instructor can confirm the mint
        if course.instructor != request.user:
            return Response({"error": "You are not the instructor of this course."}, status=status.HTTP_403_FORBIDDEN)
        
        tx_hash = request.data.get('tx_hash')
        school_address = request.data.get('school_address')
        school_name = request.data.get('school_name')
        
        if not tx_hash:
            return Response({"error": "Transaction hash is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        course.is_minted = True
        course.tx_hash = tx_hash
        course.school_address = school_address
        if school_name:
            course.school_name = school_name
            
        # Link to SovereignSchool object if it exists
        try:
            school_obj = SovereignSchool.objects.get(address=school_address)
            course.school = school_obj
        except SovereignSchool.DoesNotExist:
            pass
            
        course.save()
        
        return Response({
            "message": "Course mint confirmed!",
            "course_id": course.id,
            "tx_hash": tx_hash
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_school(request):
    """
    Registers a newly created sovereign school in the backend.
    """
    import uuid
    address = request.data.get('address')
    name = request.data.get('name')
    
    if not name:
        return Response({"error": "Name is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    if not address:
        # Generate a unique pseudo-address for Web2 schools
        address = f"0xschool_{uuid.uuid4().hex[:32]}"
        
    school, created = SovereignSchool.objects.get_or_create(
        address=address,
        defaults={
            'name': name,
            'instructor': request.user
        }
    )
    
    if not created:
        school.name = name  # Update name if changed
        school.save()
        
    return Response({
        "message": "School registered successfully!",
        "address": school.address,
        "name": school.name
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def school_list(request):
    """
    Returns a list of unique sovereign schools.
    """
    mine = request.query_params.get('mine') == 'true'
    schools = SovereignSchool.objects.all().select_related('instructor')
    if mine and request.user.is_authenticated:
        schools = schools.filter(instructor=request.user)
    
    return Response([
        {
            'address': s.address,
            'name': s.name,
            'instructor_name': s.instructor.display_name or s.instructor.address[:8],
            'instructor_address': s.instructor.address
        } for s in schools
    ], status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_image(request):
    """
    Handles image uploads and returns the URL.
    """
    if 'image' not in request.FILES:
        return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)
    
    image = request.FILES['image']
    
    # Save the file
    from django.core.files.storage import default_storage
    import uuid
    
    ext = image.name.split('.')[-1]
    filename = f"uploads/{uuid.uuid4()}.{ext}"
    
    path = default_storage.save(filename, image)
    url = request.build_absolute_uri(settings.MEDIA_URL + path)
    
    return Response({"url": url}, status=status.HTTP_201_CREATED)


from rest_framework.decorators import action

class StudyBubbleViewSet(viewsets.ModelViewSet):
    queryset = StudyBubble.objects.all()
    serializer_class = StudyBubbleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudyBubble.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='generate')
    def generate_bubble(self, request):
        """
        Synthesize a new Study Bubble using Vera AI.
        Expects: concept (str, optional), source_file (file, optional), learning_style (str, optional)
        """
        import requests
        user = request.user
        concept = request.data.get('concept', '')
        learning_style = request.data.get('learning_style', 'Mastery/Exploratory')
        source_file = request.FILES.get('source_file')
        
        # 0. Handle file extraction if provided
        file_content = ""
        if source_file:
            if source_file.name.endswith('.txt'):
                file_content = source_file.read().decode('utf-8')
            # Future: Add PDF extraction here
            
        if not concept and not file_content:
            return Response({"error": "Concept or source file is required for synthesis."}, status=status.HTTP_400_BAD_REQUEST)

        # Combine inputs
        combined_concept = f"{concept}\n\n[FILE CONTENT]:\n{file_content}" if file_content else concept

        # 1. Create the placeholder bubble
        bubble = StudyBubble.objects.create(
            user=user,
            title=f"Synthesizing: {(concept or source_file.name)[:30]}...",
            concept=combined_concept,
            source_file=source_file,
            status='processing'
        )

        # 2. Formulate the prompt for Vera AI
        prompt = f"""
        [SYSTEM: VERA AI MASTERY ENGINE]
        [ACTION: KNOWLEDGE SYNTHESIS]
        [CONCEPT: {combined_concept[:5000]}]  # Cap input for safety
        [MASTERY GOAL: {learning_style}]

        Your task is to synthesize the provided concept into a 'Study Bubble'. 
        This is for Studyverse, a platform centered on Mastery and Learner Agency.

        Please provide the output STRICTLY in JSON format with the following keys:
        1. "title": A concise, engaging title for the bubble.
        2. "summary": A high-level summary of the concept.
        3. "nodes": A list of objects, each with "title", "body", and "mastery_challenge" (a specific task or thought experiment to verify understanding).
        4. "video_refs": A list of objects with "title" and "url" to relevant educational videos.
        5. "audio_script": A short script (1-2 paragraphs) for a technical synthesis voiceover.

        Ensure the tone is analytical, precise, and supports high-performance learning.
        """

        try:
            # 3. Call AI Engine (Port 8001)
            ai_response = requests.post('http://localhost:8001/v1/chat', json={
                'project_id': 'study_verse',
                'query': prompt,
                'user_context': {
                    'user_name': user.display_name or "Learner",
                    'role': "Knowledge Architect"
                }
            }, timeout=30)

            if ai_response.status_code == 200:
                data = ai_response.json()
                response_text = data.get('response_text', '')
                
                # Attempt to extract JSON from the AI response
                try:
                    import re
                    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                    if json_match:
                        synthesis = json.loads(json_match.group())
                        
                        bubble.title = synthesis.get('title', bubble.title)
                        bubble.summary = synthesis.get('summary', '')
                        bubble.content = synthesis.get('nodes', [])
                        bubble.video_refs = synthesis.get('video_refs', [])
                        # We store the script for now; actual audio gen could be a second step
                        bubble.notes = synthesis.get('audio_script', '') 
                        bubble.status = 'completed'
                    else:
                        raise ValueError("No JSON found in AI response")
                except Exception as e:
                    logger.error(f"Failed to parse AI synthesis: {str(e)}")
                    bubble.status = 'failed'
                    bubble.summary = f"Synthesis failed: Could not parse AI response. Raw: {response_text[:200]}"
            else:
                bubble.status = 'failed'
                bubble.summary = f"AI Engine error: {ai_response.status_code}"
                
        except Exception as e:
            logger.error(f"AI Synthesis Exception: {str(e)}")
            bubble.status = 'failed'
            bubble.summary = f"System error during synthesis: {str(e)}"

        bubble.save()
        return Response(StudyBubbleSerializer(bubble).data, status=status.HTTP_200_OK)
