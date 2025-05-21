import requests
import json

BASE_URL = "http://localhost:5000"

def print_response(response):
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)

# GET all products
print("Getting all products:")
response = requests.get(f"{BASE_URL}/products")
print_response(response)

# POST a new product
print("Creating a new product:")
new_product = {
    "name": "Smartwatch",
    "price": 199.99,
    "quantity": 30
}
response = requests.post(f"{BASE_URL}/products", json=new_product)
print_response(response)

# Get the ID of the newly created product
new_product_id = response.json()["id"]

# GET the specific product
print(f"Getting product with ID {new_product_id}:")
response = requests.get(f"{BASE_URL}/products/{new_product_id}")
print_response(response)

# PUT (update) the product
print(f"Updating product with ID {new_product_id}:")
updated_product = {
    "price": 179.99,
    "quantity": 40
}
response = requests.put(f"{BASE_URL}/products/{new_product_id}", json=updated_product)
print_response(response)

# DELETE the product
print(f"Deleting product with ID {new_product_id}:")
response = requests.delete(f"{BASE_URL}/products/{new_product_id}")
print_response(response)

# Verify deletion by getting all products again
print("Getting all products after deletion:")
response = requests.get(f"{BASE_URL}/products")
print_response(response)