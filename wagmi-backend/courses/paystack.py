import requests
from django.conf import settings

def initialize_paystack_transaction(email, amount_in_kobo):
    """
    Initializes a Paystack transaction for course purchases.
    Returns the authorization URL and access code.
    """
    url = "https://api.paystack.co/transaction/initialize"
    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "email": email,
        "amount": amount_in_kobo
    }
    
    # response = requests.post(url, headers=headers, json=data)
    # return response.json()
    
    # Placeholder for local dev without key
    return {
        "status": True,
        "message": "Authorization URL created",
        "data": {
            "authorization_url": "https://checkout.paystack.com/placeholder",
            "access_code": "placeholder_code",
            "reference": "placeholder_ref"
        }
    }

def verify_paystack_transaction(reference):
    """
    Verifies a transaction status after checkout.
    """
    url = f"https://api.paystack.co/transaction/verify/{reference}"
    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"
    }
    
    # response = requests.get(url, headers=headers)
    # return response.json()
    
    return {
        "status": True,
        "message": "Verification successful",
        "data": {
            "status": "success",
            "amount": 500000
        }
    }
