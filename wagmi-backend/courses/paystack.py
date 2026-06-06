import requests
from django.conf import settings
from decimal import Decimal

def convert_sol_to_kobo(sol_amount):
    """
    Converts a SOL decimal amount to NGN Kobo.
    Assumes:
    1 SOL = $150 USD
    1 USD = 1500 NGN
    1 NGN = 100 Kobo
    """
    try:
        sol = Decimal(str(sol_amount))
        # 1 SOL = 150 * 1500 * 100 = 22,500,000 Kobo
        kobo_per_sol = Decimal('22500000')
        kobo = int(sol * kobo_per_sol)
        return kobo
    except:
        return 0

def initialize_paystack_transaction(email, amount_in_kobo, reference=None, callback_url=None):
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
    
    if reference:
        data["reference"] = reference
    if callback_url:
        data["callback_url"] = callback_url
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        return response.json()
    else:
        # Fallback for dev if API key fails or isn't set
        print("Paystack Init Failed:", response.text)
        return {
            "status": False,
            "message": response.text,
            "data": None
        }

def verify_paystack_transaction(reference):
    """
    Verifies a transaction status after checkout.
    """
    url = f"https://api.paystack.co/transaction/verify/{reference}"
    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {
            "status": False,
            "message": response.text,
            "data": None
        }
