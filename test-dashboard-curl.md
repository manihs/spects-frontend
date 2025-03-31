# Testing Customer Dashboard API with cURL

This guide shows how to test the customer dashboard API using cURL commands from the terminal.

## 1. Login to get an authentication token

First, you need to log in as a customer to get an authentication token:

```bash
curl -X POST http://localhost:3000/api/customers/login \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@example.com", "password": "password123"}'
```

The response will include a token:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "YOUR_AUTH_TOKEN",
  "customer": { /* customer data */ }
}
```

Copy the `token` value to use in the next step.

## 2. Test the customer dashboard API

Use the token in the Authorization header to call the dashboard API:

```bash
curl -X GET http://localhost:3000/api/reports/customer-dashboard \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

The response should include customer dashboard metrics including order counts, amounts, recent orders, and payment statistics.

For retailers, it will also include additional data like credit utilization, upcoming payments, and top categories.

## 3. Save response to a file for inspection

To save the response to a file for easier inspection:

```bash
curl -X GET http://localhost:3000/api/reports/customer-dashboard \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -o dashboard-response.json
```

Then you can open the `dashboard-response.json` file to examine the full response.

## Expected Response Format

The API returns data in this format:

```json
{
  "success": true,
  "message": "Dashboard metrics retrieved successfully",
  "data": {
    "customer": {
      "id": 1,
      "name": "John Doe",
      "companyName": "John's Company",
      "isRetailer": true,
      "retailerStatus": "approved",
      "trusted": true,
      "creditLimit": 5000
    },
    "orderStats": {
      "totalOrders": 10,
      "totalOrderAmount": 5000,
      "totalPaidAmount": 3000,
      "totalDueAmount": 2000
    },
    "recentOrders": [...],
    "recentPayments": [...],
    "paymentsByMethod": [...],
    "monthlyOrderTrend": [...],
    "retailerData": {
      "creditData": {...},
      "upcomingPayments": [...],
      "topCategories": [...]
    }
  }
}
```

The `retailerData` section will only be present if the customer has `isRetailer: true`. 