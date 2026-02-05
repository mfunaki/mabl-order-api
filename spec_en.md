# mabl-order-api Specification

> **Japanese version:** For the Japanese version of this document, please refer to [spec.md](spec.md).

## 1. Project Overview

### Purpose
A REST API server for demonstrating mabl's API testing capabilities. It intentionally includes state transitions and errors, making it suitable for demonstrating mabl's API testing features.

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express
- **Authentication:** jsonwebtoken (JWT)
- **Data Store:** In-memory array (no database)
- **Port:** 3000

### Configuration
- CORS enabled (for access from mabl's cloud execution environment)
- Body parser: `express.json()`

## 2. Authentication

### Authentication Flow
1. Obtain JWT token via `POST /login`
2. Call APIs with the obtained token in the `Authorization` header

### Credentials
- **Username:** `demo`
- **Password:** `password`
- **Secret key:** `secret_key_demo` (hardcoded)
- **Token expiration:** 1 hour

### Required Headers
```
Authorization: Bearer <token>
```

### Endpoints Requiring Authentication
- All routes under `/api/orders`

### Endpoints Not Requiring Authentication
- `POST /login`
- `POST /api/reset`
- `POST /api/seed`

## 3. Endpoint List

### POST /login

Login to obtain a JWT token.

**Request:**
```json
{
  "username": "demo",
  "password": "password"
}
```

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Authentication Failed - 401):**
```json
{
  "message": "Authentication failed"
}
```

---

### POST /api/reset

Delete all order data from memory and reset. No authentication required.

**Request:** None

**Response (Success - 200):**
```json
{
  "message": "Database reset"
}
```

---

### POST /api/seed

Reset memory data and create initial demo data (one order). No authentication required.

**Request:** None

**Response (Success - 200):**
```json
{
  "order": {
    "id": "1",
    "item": "Sample Item",
    "status": "created",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### POST /api/orders

Create a new order. Initial status is `created`. **Authentication required**

**Request:**
```json
{
  "item": "Item Name"
}
```

**Response (Success - 200):**
```json
{
  "order": {
    "id": "1",
    "item": "Item Name",
    "status": "created",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Authentication Error - 401):**
```json
{
  "message": "Authentication required"
}
```

---

### GET /api/orders/:id

Retrieve order information for the specified ID. **Authentication required**

**Path Parameters:**
- `id` - Order ID

**Response (Success - 200):**
```json
{
  "order": {
    "id": "1",
    "item": "Item Name",
    "status": "created",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Order Not Found - 404):**
```json
{
  "message": "Order not found"
}
```

---

### POST /api/orders/:id/pay

Update order status to paid (`paid`). **Authentication required**

**Path Parameters:**
- `id` - Order ID

**Success Condition:** Current status must be `created`

**Response (Success - 200):**
```json
{
  "order": {
    "id": "1",
    "item": "Item Name",
    "status": "paid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Already Paid - 400):**
```json
{
  "message": "Payment has already been completed"
}
```

**Response (Order Not Found - 404):**
```json
{
  "message": "Order not found"
}
```

---

### POST /api/orders/:id/ship

Update order status to shipped (`shipped`). **Authentication required**

**Path Parameters:**
- `id` - Order ID

**Success Condition:** Current status must be `paid`

**Response (Success - 200):**
```json
{
  "order": {
    "id": "1",
    "item": "Item Name",
    "status": "shipped",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Unpaid - 400):**
```json
{
  "message": "Cannot ship because payment has not been completed"
}
```

**Response (Order Not Found - 404):**
```json
{
  "message": "Order not found"
}
```

## 4. Business Logic

### Order Data Structure

```json
{
  "id": "string",
  "item": "string",
  "status": "string",
  "createdAt": "ISO 8601 format datetime string"
}
```

### State Transitions

```
created --> paid --> shipped
```

| Status | Description |
|--------|-------------|
| `created` | Immediately after order creation (unpaid) |
| `paid` | Payment completed |
| `shipped` | Shipped |

### Transition Rules

| Current Status | Allowed Action | Resulting Status |
|---------------|----------------|------------------|
| `created` | pay | `paid` |
| `paid` | ship | `shipped` |
| `created` | ship | Error (400) |
| `paid` | pay | Error (400) |
| `shipped` | pay | Error (400) |
| `shipped` | ship | `shipped` (no change) |

### Error Conditions

| Endpoint | Condition | Status Code | Message |
|----------|-----------|-------------|---------|
| `/login` | Invalid credentials | 401 | Authentication failed |
| `/api/orders/*` | No Authorization header | 401 | Authentication required |
| `/api/orders/*` | Invalid token | 401 | Invalid token |
| `/api/orders/:id` | Order does not exist | 404 | Order not found |
| `/api/orders/:id/pay` | Already paid | 400 | Payment has already been completed |
| `/api/orders/:id/ship` | Unpaid | 400 | Cannot ship because payment has not been completed |

## 5. HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Business rule violation |
| 401 | Unauthorized | Authentication failure, invalid token |
| 404 | Not Found | Specified resource does not exist |
