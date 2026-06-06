import requests

BASE_URL = "http://localhost:8000/api"

def test_baas():
    print("Testing BaaS...")
    
    # We need a staff token to provision. But wait, I can just create a test school and test student using django shell, then test the login endpoint via requests.
    print("Run this through django shell instead.")

if __name__ == "__main__":
    test_baas()
