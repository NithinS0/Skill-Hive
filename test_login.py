import requests
import json

# Test login with hardcoded admin credentials
url = "http://localhost:5000/api/login"
headers = {"Content-Type": "application/json"}

# Test data
test_data = {
    "username": "nithin",
    "password": "123456789",
    "role": "Admin"
}

print("Testing login with hardcoded admin credentials...")
print(f"URL: {url}")
print(f"Data: {test_data}")

try:
    response = requests.post(url, headers=headers, data=json.dumps(test_data))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")