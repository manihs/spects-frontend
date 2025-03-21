# API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Products](#products)
3. [Orders](#orders)
4. [Payments](#payments)
5. [Cart](#cart)
6. [Categories](#categories)
7. [Customers](#customers)
8. [Tax](#tax)
9. [Shipping](#shipping)
10. [Coupons](#coupons)

## Authentication

### Login
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticate user and get access token
- **Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "string",
    "customer": {
      "id": "number",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "isRetailer": "boolean",
      "retailerStatus": "string"
    }
  }
}
```

### Register
- **Endpoint**: `POST /api/auth/register`
- **Description**: Register a new customer
- **Request Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "isRetailer": "boolean"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "number",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "isRetailer": "boolean",
    "retailerStatus": "string"
  }
}
```

## Products

### Create Product
- **Endpoint**: `POST /api/product`
- **Description**: Create a new product
- **Headers**: 
  - `Authorization`: Bearer token
- **Request Body**:
```json
{
  "name": "string",
  "sku": "string",
  "categoryId": "number",
  "taxId": "number",
  "description": "string",
  "images": ["file"],
  "variants": [
    {
      "sku": "string",
      "price": "number",
      "offerPrice": "number",
      "quantity": "number",
      "weight": "number",
      "attributes": [
        {
          "attributeId": "number",
          "value": "string"
        }
      ]
    }
  ]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "number",
    "name": "string",
    "sku": "string",
    "categoryId": "number",
    "taxId": "number",
    "description": "string",
    "images": ["string"],
    "variants": [
      {
        "id": "number",
        "sku": "string",
        "price": "number",
        "offerPrice": "number",
        "quantity": "number",
        "weight": "number",
        "attributes": [
          {
            "attributeId": "number",
            "value": "string"
          }
        ]
      }
    ]
  }
}
```

### Get Products
- **Endpoint**: `GET /api/product`
- **Description**: Get list of products with pagination and filters
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `categoryId`: Filter by category
  - `search`: Search by name or SKU
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `sortBy`: Sort field (name, price, createdAt)
  - `sortOrder`: Sort order (asc, desc)
- **Response**:
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": {
    "products": [
      {
        "id": "number",
        "name": "string",
        "sku": "string",
        "categoryId": "number",
        "taxId": "number",
        "description": "string",
        "images": ["string"],
        "variants": [
          {
            "id": "number",
            "sku": "string",
            "price": "number",
            "offerPrice": "number",
            "quantity": "number",
            "weight": "number",
            "attributes": [
              {
                "attributeId": "number",
                "value": "string"
              }
            ]
          }
        ]
      }
    ],
    "pagination": {
      "totalItems": "number",
      "totalPages": "number",
      "currentPage": "number",
      "itemsPerPage": "number"
    }
  }
}
```

### Get Product Details
- **Endpoint**: `GET /api/product/:id`
- **Description**: Get detailed information about a specific product
- **Response**:
```json
{
  "success": true,
  "message": "Product details fetched successfully",
  "data": {
    "id": "number",
    "name": "string",
    "sku": "string",
    "categoryId": "number",
    "taxId": "number",
    "description": "string",
    "images": ["string"],
    "variants": [
      {
        "id": "number",
        "sku": "string",
        "price": "number",
        "offerPrice": "number",
        "quantity": "number",
        "weight": "number",
        "attributes": [
          {
            "attributeId": "number",
            "value": "string"
          }
        ]
      }
    ],
    "category": {
      "id": "number",
      "name": "string"
    },
    "tax": {
      "id": "number",
      "rate": "number"
    }
  }
}
```

## Orders

### Create Order
- **Endpoint**: `POST /api/order`
- **Description**: Create a new order
- **Headers**: 
  - `Authorization`: Bearer token
- **Request Body**:
```json
{
  "shippingAddressId": "number",
  "billingAddressId": "number",
  "items": [
    {
      "productId": "number",
      "variantId": "number",
      "quantity": "number"
    }
  ],
  "couponCode": "string"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "number",
    "orderNumber": "string",
    "customerId": "number",
    "status": "string",
    "shippingAddressId": "number",
    "billingAddressId": "number",
    "subtotal": "number",
    "shippingAmount": "number",
    "taxAmount": "number",
    "discountAmount": "number",
    "totalAmount": "number",
    "paymentStatus": "string",
    "items": [
      {
        "id": "number",
        "productId": "number",
        "variantId": "number",
        "quantity": "number",
        "price": "number",
        "subtotal": "number"
      }
    ]
  }
}
```

### Get Orders
- **Endpoint**: `GET /api/order`
- **Description**: Get list of orders for the authenticated customer
- **Headers**: 
  - `Authorization`: Bearer token
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `status`: Filter by order status
  - `startDate`: Filter by start date
  - `endDate`: Filter by end date
- **Response**:
```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": {
    "orders": [
      {
        "id": "number",
        "orderNumber": "string",
        "status": "string",
        "totalAmount": "number",
        "paymentStatus": "string",
        "createdAt": "string",
        "items": [
          {
            "id": "number",
            "productId": "number",
            "variantId": "number",
            "quantity": "number",
            "price": "number",
            "subtotal": "number"
          }
        ]
      }
    ],
    "pagination": {
      "totalItems": "number",
      "totalPages": "number",
      "currentPage": "number",
      "itemsPerPage": "number"
    },
    "statistics": {
      "summary": {
        "totalOrders": "number",
        "totalSpent": "number",
        "averageOrderValue": "number"
      },
      "statusDistribution": [
        {
          "status": "string",
          "count": "number"
        }
      ],
      "paymentStatusDistribution": [
        {
          "paymentStatus": "string",
          "count": "number"
        }
      ]
    }
  }
}
```

### Get Order Details
- **Endpoint**: `GET /api/order/:id`
- **Description**: Get detailed information about a specific order
- **Headers**: 
  - `Authorization`: Bearer token
- **Response**:
```json
{
  "success": true,
  "message": "Order details fetched successfully",
  "data": {
    "id": "number",
    "orderNumber": "string",
    "status": "string",
    "shippingAddress": {
      "id": "number",
      "address": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "pincode": "string"
    },
    "billingAddress": {
      "id": "number",
      "address": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "pincode": "string"
    },
    "items": [
      {
        "id": "number",
        "productId": "number",
        "variantId": "number",
        "quantity": "number",
        "price": "number",
        "subtotal": "number",
        "product": {
          "name": "string",
          "images": ["string"]
        },
        "variant": {
          "sku": "string",
          "attributes": [
            {
              "attributeId": "number",
              "value": "string"
            }
          ]
        }
      }
    ],
    "subtotal": "number",
    "shippingAmount": "number",
    "taxAmount": "number",
    "discountAmount": "number",
    "totalAmount": "number",
    "paymentStatus": "string",
    "amountPaid": "number",
    "balanceDue": "number",
    "createdAt": "string",
    "updatedAt": "string",
    "activities": [
      {
        "id": "number",
        "activity": "string",
        "status": "string",
        "note": "string",
        "createdAt": "string"
      }
    ]
  }
}
```

## Payments

### Create Razorpay Order
- **Endpoint**: `POST /api/payment/create-order`
- **Description**: Create a Razorpay order for payment
- **Headers**: 
  - `Authorization`: Bearer token
- **Request Body**:
```json
{
  "orderId": "number",
  "amount": "number"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Razorpay order created successfully",
  "data": {
    "paymentId": "number",
    "razorpayOrderId": "string",
    "amount": "number",
    "currency": "string",
    "key": "string",
    "prefillData": {
      "name": "string",
      "email": "string",
      "contact": "string"
    },
    "notes": {
      "orderId": "number",
      "orderNumber": "string"
    }
  }
}
```

### Verify Payment
- **Endpoint**: `POST /api/payment/verify`
- **Description**: Verify and complete a Razorpay payment
- **Headers**: 
  - `Authorization`: Bearer token
- **Request Body**:
```json
{
  "razorpayOrderId": "string",
  "razorpayPaymentId": "string",
  "razorpaySignature": "string"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Payment verified and completed successfully",
  "data": {
    "paymentId": "number",
    "orderId": "number",
    "orderNumber": "string",
    "amount": "number",
    "remainingBalance": "number",
    "paymentStatus": "string"
  }
}
```

### Get Order Payments
- **Endpoint**: `GET /api/payment/order/:orderId`
- **Description**: Get payment history for a specific order
- **Headers**: 
  - `Authorization`: Bearer token
- **Response**:
```json
{
  "success": true,
  "message": "Order payments retrieved successfully",
  "data": {
    "order": {
      "id": "number",
      "orderNumber": "string",
      "totalAmount": "number",
      "amountPaid": "number",
      "balanceDue": "number",
      "paymentStatus": "string"
    },
    "payments": [
      {
        "id": "number",
        "amount": "number",
        "status": "string",
        "paymentMethod": "string",
        "createdAt": "string",
        "metadata": {}
      }
    ]
  }
}
```

### Get Payment Details
- **Endpoint**: `GET /api/payment/:id`
- **Description**: Get detailed information about a specific payment
- **Headers**: 
  - `Authorization`: Bearer token
- **Response**:
```json
{
  "success": true,
  "message": "Payment details retrieved successfully",
  "data": {
    "id": "number",
    "orderId": "number",
    "customerId": "number",
    "amount": "number",
    "status": "string",
    "paymentMethod": "string",
    "isPartialPayment": "boolean",
    "createdAt": "string",
    "metadata": {}
  }
}
```

### Get Customer Payments
- **Endpoint**: `GET /api/payment/customer`
- **Description**: Get payment history for the authenticated customer
- **Headers**: 
  - `Authorization`: Bearer token
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**:
```json
{
  "success": true,
  "message": "Customer payments retrieved successfully",
  "data": {
    "payments": [
      {
        "id": "number",
        "orderId": "number",
        "amount": "number",
        "status": "string",
        "paymentMethod": "string",
        "createdAt": "string",
        "order": {
          "id": "number",
          "orderNumber": "string",
          "totalAmount": "number",
          "paymentStatus": "string"
        }
      }
    ],
    "pagination": {
      "totalItems": "number",
      "totalPages": "number",
      "currentPage": "number",
      "itemsPerPage": "number"
    }
  }
}
```

## Cart

### Get Cart
- **Endpoint**: `GET /api/cart`
- **Description**: Get the current cart for the authenticated customer
- **Headers**: 
  - `Authorization`: Bearer token
- **Response**:
```json
{
  "success": true,
  "message": "Cart fetched successfully",
  "data": {
    "id": "number",
    "items": [
      {
        "id": "number",
        "productId": "number",
        "variantId": "number",
        "quantity": "number",
        "price": "number",
        "subtotal": "number",
        "product": {
          "name": "string",
          "images": ["string"],
          "status": "string"
        },
        "variant": {
          "name": "string",
          "status": "string",
          "price": "number",
          "quantity": "number"
        }
      }
    ],
    "subtotal": "number",
    "taxAmount": "number",
    "discountAmount": "number",
    "totalAmount": "number"
  }
}
```

### Add Item to Cart
- **Endpoint**: `POST /api/cart/items`
- **Description**: Add an item to the cart
- **Headers**: 
  - `Authorization`: Bearer token
- **Request Body**:
```json
{
  "productId": "number",
  "variantId": "number",
  "quantity": "number"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "id": "number",
    "items": [
      {
        "id": "number",
        "productId": "number",
        "variantId": "number",
        "quantity": "number",
        "price": "number",
        "subtotal": "number",
        "product": {
          "name": "string",
          "images": ["string"],
          "status": "string"
        },
        "variant": {
          "name": "string",
          "status": "string",
          "price": "number",
          "quantity": "number"
        }
      }
    ],
    "subtotal": "number",
    "taxAmount": "number",
    "discountAmount": "number",
    "totalAmount": "number"
  }
}
```

### Update Cart Item
- **Endpoint**: `PUT /api/cart/items/:id`
- **Description**: Update quantity of an item in the cart
- **Headers**: 
  - `Authorization`: Bearer token
- **Request Body**:
```json
{
  "quantity": "number"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "id": "number",
    "items": [
      {
        "id": "number",
        "productId": "number",
        "variantId": "number",
        "quantity": "number",
        "price": "number",
        "subtotal": "number",
        "product": {
          "name": "string",
          "images": ["string"],
          "status": "string"
        },
        "variant": {
          "name": "string",
          "status": "string",
          "price": "number",
          "quantity": "number"
        }
      }
    ],
    "subtotal": "number",
    "taxAmount": "number",
    "discountAmount": "number",
    "totalAmount": "number"
  }
}
```

### Remove Cart Item
- **Endpoint**: `DELETE /api/cart/items/:id`
- **Description**: Remove an item from the cart
- **Headers**: 
  - `Authorization`: Bearer token
- **Response**:
```json
{
  "success": true,
  "message": "Cart item removed successfully",
  "data": {
    "id": "number",
    "items": [
      {
        "id": "number",
        "productId": "number",
        "variantId": "number",
        "quantity": "number",
        "price": "number",
        "subtotal": "number",
        "product": {
          "name": "string",
          "images": ["string"],
          "status": "string"
        },
        "variant": {
          "name": "string",
          "status": "string",
          "price": "number",
          "quantity": "number"
        }
      }
    ],
    "subtotal": "number",
    "taxAmount": "number",
    "discountAmount": "number",
    "totalAmount": "number"
  }
}
```

### Clear Cart
- **Endpoint**: `DELETE /api/cart/clear`
- **Description**: Remove all items from the cart
- **Headers**: 
  - `Authorization`: Bearer token
- **Response**:
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": {
    "id": "number",
    "items": [],
    "subtotal": 0,
    "taxAmount": 0,
    "discountAmount": 0,
    "totalAmount": 0
  }
}
```

## Categories

### Get Categories
- **Endpoint**: `GET /api/category`
- **Description**: Get list of all categories
- **Response**:
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [
    {
      "id": "number",
      "name": "string",
      "description": "string",
      "parentId": "number",
      "level": "number",
      "path": "string",
      "isActive": "boolean"
    }
  ]
}
```

### Get Category Details
- **Endpoint**: `GET /api/category/:id`
- **Description**: Get detailed information about a specific category
- **Response**:
```json
{
  "success": true,
  "message": "Category details fetched successfully",
  "data": {
    "id": "number",
    "name": "string",
    "description": "string",
    "parentId": "number",
    "level": "number",
    "path": "string",
    "isActive": "boolean",
    "parent": {
      "id": "number",
      "name": "string"
    },
    "children": [
      {
        "id": "number",
        "name": "string",
        "description": "string",
        "parentId": "number",
        "level": "number",
        "path": "string",
        "isActive": "boolean"
      }
    ]
  }
}
```

## Customers

### Get Customer Profile
- **Endpoint**: `GET /api/customer/profile`
- **Description**: Get profile information for the authenticated customer
- **Headers**: 
  - `Authorization`: Bearer token
- **Response**:
```json
{
  "success": true,
  "message": "Customer profile fetched successfully",
  "data": {
    "id": "number",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "isRetailer": "boolean",
    "retailerStatus": "string",
    "allowPartialPayment": "boolean",
    "addresses": [
      {
        "id": "number",
        "type": "string",
        "address": "string",
        "city": "string",
        "state": "string",
        "country": "string",
        "pincode": "string",
        "isDefault": "boolean"
      }
    ]
  }
}
```

### Update Customer Profile
- **Endpoint**: `PUT /api/customer/profile`
- **Description**: Update profile information for the authenticated customer
- **Headers**: 
  - `Authorization`: Bearer token
- **Request Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Customer profile updated successfully",
  "data": {
    "id": "number",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "isRetailer": "boolean",
    "retailerStatus": "string",
    "allowPartialPayment": "boolean"
  }
}
```

### Add Address
- **Endpoint**: `POST /api/customer/address`
- **Description**: Add a new address for the authenticated customer
- **Headers**: 
  - `Authorization`: Bearer token
- **Request Body**:
```json
{
  "type": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "pincode": "string",
  "isDefault": "boolean"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "id": "number",
    "type": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "pincode": "string",
    "isDefault": "boolean"
  }
}
```

### Update Address
- **Endpoint**: `PUT /api/customer/address/:id`
- **Description**: Update an existing address for the authenticated customer
- **Headers**: 
  - `Authorization`: Bearer token
- **Request Body**:
```json
{
  "type": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "pincode": "string",
  "isDefault": "boolean"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "id": "number",
    "type": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "pincode": "string",
    "isDefault": "boolean"
  }
}
```

### Delete Address
- **Endpoint**: `DELETE /api/customer/address/:id`
- **Description**: Delete an address for the authenticated customer
- **Headers**: 
  - `Authorization`: Bearer token
- **Response**:
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

## Tax

### Get Tax Rates
- **Endpoint**: `GET /api/tax`
- **Description**: Get list of all tax rates
- **Response**:
```json
{
  "success": true,
  "message": "Tax rates fetched successfully",
  "data": [
    {
      "id": "number",
      "name": "string",
      "rate": "number",
      "isActive": "boolean"
    }
  ]
}
```

### Get Tax Rate Details
- **Endpoint**: `GET /api/tax/:id`
- **Description**: Get detailed information about a specific tax rate
- **Response**:
```json
{
  "success": true,
  "message": "Tax rate details fetched successfully",
  "data": {
    "id": "number",
    "name": "string",
    "rate": "number",
    "isActive": "boolean"
  }
}
```

## Shipping

### Get Shipping Rates
- **Endpoint**: `GET /api/shipping/rates`
- **Description**: Get shipping rates based on address and items
- **Query Parameters**:
  - `addressId`: ID of the shipping address
  - `items`: Array of item IDs and quantities
- **Response**:
```json
{
  "success": true,
  "message": "Shipping rates fetched successfully",
  "data": [
    {
      "id": "number",
      "name": "string",
      "description": "string",
      "rate": "number",
      "estimatedDays": "number"
    }
  ]
}
```

### Calculate Shipping
- **Endpoint**: `POST /api/shipping/calculate`
- **Description**: Calculate shipping cost for an order
- **Request Body**:
```json
{
  "addressId": "number",
  "items": [
    {
      "productId": "number",
      "variantId": "number",
      "quantity": "number"
    }
  ]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Shipping cost calculated successfully",
  "data": {
    "shippingAmount": "number",
    "estimatedDays": "number"
  }
}
```

## Coupons

### Apply Coupon
- **Endpoint**: `POST /api/coupon/apply`
- **Description**: Apply a coupon code to the cart
- **Headers**: 
  - `Authorization`: Bearer token
- **Request Body**:
```json
{
  "couponCode": "string"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "id": "number",
    "items": [
      {
        "id": "number",
        "productId": "number",
        "variantId": "number",
        "quantity": "number",
        "price": "number",
        "subtotal": "number",
        "product": {
          "name": "string",
          "images": ["string"],
          "status": "string"
        },
        "variant": {
          "name": "string",
          "status": "string",
          "price": "number",
          "quantity": "number"
        }
      }
    ],
    "subtotal": "number",
    "taxAmount": "number",
    "discountAmount": "number",
    "totalAmount": "number"
  }
}
```

### Remove Coupon
- **Endpoint**: `POST /api/coupon/remove`
- **Description**: Remove applied coupon from the cart
- **Headers**: 
  - `Authorization`: Bearer token
- **Response**:
```json
{
  "success": true,
  "message": "Coupon removed successfully",
  "data": {
    "id": "number",
    "items": [
      {
        "id": "number",
        "productId": "number",
        "variantId": "number",
        "quantity": "number",
        "price": "number",
        "subtotal": "number",
        "product": {
          "name": "string",
          "images": ["string"],
          "status": "string"
        },
        "variant": {
          "name": "string",
          "status": "string",
          "price": "number",
          "quantity": "number"
        }
      }
    ],
    "subtotal": "number",
    "taxAmount": "number",
    "discountAmount": "number",
    "totalAmount": "number"
  }
}
```