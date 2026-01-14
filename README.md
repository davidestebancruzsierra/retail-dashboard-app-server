# retail-dashboard-app-server

📦 Product API Documentation
📖 Description

This API allows you to manage products, reviews, search, shopping cart checkout, and general website statistics. It is designed for an e-commerce platform.

🌐 Base URL
/api
📌 Endpoints
🛍️ Products
Get all products
GET /api/products

Returns a list of all products along with their average rating.

Get product by ID
GET /api/products/:id

Returns detailed information for a specific product.

Create a new product
POST /api/products

Creates a new product in the system.

Update a product
POST /api/products/:id

Updates an existing product.

Delete a product
DELETE /api/products/:id

Deletes a product by its ID.

⭐ Reviews
Add a review to a product
POST /api/products/:id/reviews

Adds a review to a specific product.

🗂️ Categories
Get products by category
GET /api/products/category/:group

Returns all products from a specific category.

🔍 Search
Search products
GET /api/search?q=query

Allows filtering and searching products by text.

🛒 Cart
Cart checkout
POST /api/cart/checkout

Processes the purchase of the products added to the cart.

📊 Dashboard
Website statistics
GET /api/dashboard/stats

Retrieves general statistics for the website.

✅ Notes

All endpoints return responses in JSON format.

Some endpoints may require authentication depending on the implementation.

🚀 API ready to be integrated with frontend or external applications.
