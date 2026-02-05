Implement a REST API server using Node.js and Express for demonstrating mabl's API testing capabilities.
Use an in-memory array for data management instead of a database for simplicity.

## 1. Project Configuration
- **Project name (package.json name):** `mabl-order-api`
- Run on port `3000`.
- Enable CORS (for access from mabl's cloud execution environment).
- Use `express.json()` as body parser.
- Implement error handling and return appropriate HTTP status codes (200, 400, 401, 404).

## 2. Authentication (JWT)
- Use the `jsonwebtoken` library.
- Secret key can be hardcoded (e.g., "secret_key_demo").
- **POST /login**
    - Request: `{ "username": "demo", "password": "password" }` (only this combination succeeds)
    - Response: `{ "token": "..." }`
- **Authentication Middleware**
    - Protect all routes under `/api/orders`.
    - Validate the header `Authorization: Bearer <token>`.

## 3. Utilities (Demo Environment Reset)
- **POST /api/reset**
    - Delete all order data from memory and empty it.
    - No authentication required (for easy demo setup).
    - Response: `{ "message": "Database reset" }`
- **POST /api/seed**
    - Reset memory data and create initial demo data (e.g., one order with ID "1", status "created").
    - No authentication required.

## 4. Business Logic (Order State Machine)
Order data structure: `{ id: string, item: string, status: string, createdAt: date }`
Possible status transitions: `created` -> `paid` -> `shipped`

- **POST /api/orders**
    - Create a new order. Initial status is `created`.
    - Include the created order object in the response.
- **GET /api/orders/:id**
    - Return order information for the specified ID.
- **POST /api/orders/:id/pay**
    - Update status to `paid`.
    - **[Important: Success Case]** Succeeds only when current status is `created` (200 OK).
    - **[Important: Error Case]** If already `paid` or `shipped`, return **400 Bad Request** with error message "Payment has already been completed".
- **POST /api/orders/:id/ship**
    - Update status to `shipped`.
    - **[Important: Success Case]** Succeeds only when current status is `paid` (200 OK).
    - **[Important: Error Case]** If status is `created` (unpaid), return **400 Bad Request** with error message "Cannot ship because payment has not been completed".

## Output Requirements
Generate code to create the following files:
1. **package.json**
    - name should be `mabl-order-api`.
    - Dependencies: express, jsonwebtoken, cors, body-parser
2. **server.js**
    - Implementation code satisfying all above requirements.
3. **README.md**
    - Project overview.
    - How to start (`npm install` -> `node server.js`).
    - Specifications for each endpoint and sample `curl` commands for verification (especially examples of getting a token with `/login` and using it to call `/orders`).
