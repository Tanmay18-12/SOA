from flask import Flask, request, jsonify

app = Flask(__name__)

# In-memory database for products
products = [
    {"id": 1, "name": "Laptop", "price": 999.99, "quantity": 10},
    {"id": 2, "name": "Smartphone", "price": 499.99, "quantity": 20},
    {"id": 3, "name": "Headphones", "price": 99.99, "quantity": 50},
]

# GET all products
@app.route('/products', methods=['GET'])
def get_products():
    return jsonify(products)

# GET single product
@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

# POST new product
@app.route('/products', methods=['POST'])
def add_product():
    if not request.json:
        return jsonify({"error": "Invalid request"}), 400
    
    product = {
        'id': max(p['id'] for p in products) + 1 if products else 1,
        'name': request.json.get('name', ''),
        'price': request.json.get('price', 0),
        'quantity': request.json.get('quantity', 0)
    }
    
    products.append(product)
    return jsonify(product), 201

# PUT update product
@app.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    if not request.json:
        return jsonify({"error": "Invalid request"}), 400
    
    product['name'] = request.json.get('name', product['name'])
    product['price'] = request.json.get('price', product['price'])
    product['quantity'] = request.json.get('quantity', product['quantity'])
    
    return jsonify(product)

# DELETE product
@app.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    global products
    product = next((p for p in products if p['id'] == product_id), None)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    products = [p for p in products if p['id'] != product_id]
    return jsonify({"message": f"Product {product_id} deleted"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)