import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import WalletUser

class BillingPlansView(APIView):
    def get(self, request):
        if not settings.ADISANLO_API_KEY:
            return Response({"error": "Adi-Sanlo API Key not configured"}, status=500)
            
        url = f"{settings.ADISANLO_API_URL.rstrip('/')}/v1/plans"
        headers = {"Authorization": f"Bearer {settings.ADISANLO_API_KEY}"}
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return Response(response.json())
        except requests.exceptions.RequestException as e:
            return Response({"error": f"Failed to fetch plans: {str(e)}"}, status=502)

class BillingSubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        callback_url = request.data.get("callback_url")
        
        if not plan_id or not callback_url:
            return Response({"error": "plan_id and callback_url are required"}, status=400)
            
        if not settings.ADISANLO_API_KEY:
            return Response({"error": "Adi-Sanlo API Key not configured"}, status=500)
            
        user = request.user
        customer_email = user.email or f"{user.address}@studyverse.com"
        customer_name = user.full_name or user.address or "Studyverse User"
        
        url = f"{settings.ADISANLO_API_URL.rstrip('/')}/v1/subscriptions"
        headers = {
            "Authorization": f"Bearer {settings.ADISANLO_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "plan_id": plan_id,
            "customer_email": customer_email,
            "customer_name": customer_name,
            "callback_url": callback_url
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            # Save subscription ID locally
            user.adisanlo_subscription_id = data.get("subscription_id")
            user.subscription_status = "incomplete"
            user.save()
            
            return Response(data)
        except requests.exceptions.RequestException as e:
            return Response({"error": f"Failed to create subscription: {str(e)}"}, status=502)

class BillingStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if not user.adisanlo_subscription_id:
            return Response({"status": user.subscription_status, "is_premium": user.is_premium})
            
        if not settings.ADISANLO_API_KEY:
            return Response({"error": "Adi-Sanlo API Key not configured"}, status=500)
            
        url = f"{settings.ADISANLO_API_URL.rstrip('/')}/v1/subscriptions"
        headers = {"Authorization": f"Bearer {settings.ADISANLO_API_KEY}"}
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            subscriptions = response.json()
            
            # Find the user's subscription
            sub = next((s for s in subscriptions if s.get("id") == user.adisanlo_subscription_id), None)
            
            if sub:
                sub_status = sub.get("status")
                user.subscription_status = sub_status
                user.is_premium = (sub_status == "active")
                user.save()
                
            return Response({"status": user.subscription_status, "is_premium": user.is_premium})
            
        except requests.exceptions.RequestException as e:
            return Response({"error": f"Failed to fetch subscription status: {str(e)}"}, status=502)
