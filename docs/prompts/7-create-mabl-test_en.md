# mabl Test Creation Prompt

## Purpose

Create API tests with mabl.

## When to Use

- When you want to create new API tests with mabl
- When adding success/failure pattern tests for APIs
- When integrating tests into CI/CD pipeline

## Prerequisites

- mabl application and environment are configured
- Target API server is running (http://localhost:3000 or deployed URL)

## Test Case List

Comprehensive test cases based on openapi_en.yaml.

### 1. Authentication Tests (POST /login)

| Test Name | Condition | Expected Result |
|-----------|-----------|-----------------|
| Login Success | username: demo, password: password | 200, get token |
| Login Failure | username: demo, password: wrong | 401, error message |

### 2. Data Management Tests (No Authentication)

| Test Name | Endpoint | Expected Result |
|-----------|----------|-----------------|
| Data Reset | POST /api/reset | 200, message: "Database reset" |
| Create Initial Data | POST /api/seed | 200, order object returned |

### 3. Order Creation Tests (POST /api/orders)

| Test Name | Condition | Expected Result |
|-----------|-----------|-----------------|
| Create Order Success | Valid token, item: "Test Item" | 200, status: created |
| No Auth Header | No Authorization header | 401, message: "Authentication required" |
| Invalid Token | Authorization: Bearer invalid | 401, message: "Invalid token" |

### 4. Get Order Tests (GET /api/orders/{id})

| Test Name | Condition | Expected Result |
|-----------|-----------|-----------------|
| Get Order Success | Valid token, existing ID | 200, order object |
| Order Not Found | Valid token, non-existent ID | 404, message: "Order not found" |
| Auth Error | No Authorization header | 401, message: "Authentication required" |

### 5. Payment Tests (POST /api/orders/{id}/pay)

| Test Name | Condition | Expected Result |
|-----------|-----------|-----------------|
| Payment Success | Order with status: created | 200, status: paid |
| Already Paid | Order with status: paid | 400, message: "Payment has already been completed" |
| Pay Shipped Order | Order with status: shipped | 400, message: "Payment has already been completed" |
| Order Not Found | Non-existent ID | 404, message: "Order not found" |
| Auth Error | No Authorization header | 401, message: "Authentication required" |

### 6. Shipment Tests (POST /api/orders/{id}/ship)

| Test Name | Condition | Expected Result |
|-----------|-----------|-----------------|
| Shipment Success | Order with status: paid | 200, status: shipped |
| Ship Unpaid | Order with status: created | 400, message: "Cannot ship because payment has not been completed" |
| Order Not Found | Non-existent ID | 404, message: "Order not found" |
| Auth Error | No Authorization header | 401, message: "Authentication required" |

### 7. E2E Flow Tests

| Test Name | Flow | Expected Result |
|-----------|------|-----------------|
| Success Flow | login → reset → create order → pay → ship | Correct status at each step |
| Failure Flow | login → reset → create order → ship (skip pay) | 400 error |

## mabl Test Creation Steps

### Step 1: Setup
1. Login to get JWT token
2. Save token to variable (for use in subsequent APIs)

### Step 2: Success Pattern Test
1. Reset data (POST /api/reset)
2. Create order (POST /api/orders, item: "Success Test Item")
3. Save order ID to variable
4. Process payment (POST /api/orders/{id}/pay)
5. Verify status changed to paid
6. Ship order (POST /api/orders/{id}/ship)
7. Verify status changed to shipped

### Step 3: Failure Pattern Test
1. Reset data (POST /api/reset)
2. Create order (POST /api/orders, item: "Failure Test Item")
3. Save order ID to variable
4. Skip payment and ship (POST /api/orders/{id}/ship)
5. Verify 400 error and error message

### Step 4: Auth Error Test
1. Call POST /api/orders without Authorization header
2. Verify 401 error and error message

### Step 5: 404 Error Test
1. Call GET /api/orders/nonexistent with non-existent order ID
2. Verify 404 error and error message

## Assertions

Verify the following in each test:

- **Status Codes**: 200, 400, 401, 404
- **Response Body**:
  - Success: `order`, `message`, or `token` property exists
  - Error: `message` property contains appropriate error message
- **State Transitions**: `created` → `paid` → `shipped`

## How to Execute

Create tests via mabl MCP server following this prompt.

```
Follow the instructions in docs/prompts/7-create-mabl-test_en.md to create mabl API tests.
```
