# mabl-order-api

> **日本語版:** 日本語版のドキュメントは [README.md](README.md) をご覧ください。

A REST API server for order management, created for demonstrating mabl's automated testing capabilities.
It intentionally includes state transitions and errors, making it suitable for demonstrating mabl's API testing features.

## How to Start

```bash
npm install
node server.js
```

The server starts at `http://localhost:3000`.

## Endpoints

### Authentication

#### POST /login
Log in to obtain a JWT token.

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "password"}'
```

Response example:
```json
{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

### Utilities (No Authentication Required)

#### POST /api/reset
Deletes all data to reset the environment.

```bash
curl -X POST http://localhost:3000/api/reset
```

#### POST /api/seed
Creates initial demo data (ID: 1, status: created).

```bash
curl -X POST http://localhost:3000/api/seed
```

### Order Management (Authentication Required)

The following endpoints require the `Authorization: Bearer <token>` header.

#### POST /api/orders
Creates a new order (Initial status: `created`).

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"item": "Item Name"}'
```

#### GET /api/orders/:id
Retrieves order information for the specified ID.

```bash
curl http://localhost:3000/api/orders/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /api/orders/:id/pay
Updates the order status to paid (`paid`).

- Success Condition: Current status is `created`.
- Error: Returns a 400 error if already `paid` or `shipped`.

```bash
curl -X POST http://localhost:3000/api/orders/1/pay \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /api/orders/:id/ship
Updates the order status to shipped (`shipped`).

- Success Condition: Current status is `paid`.
- Error: Returns a 400 error if `created` (unpaid).

```bash
curl -X POST http://localhost:3000/api/orders/1/ship \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## State Transitions

```
created --> paid --> shipped
```

- `created`: Immediately after order creation
- `paid`: Payment completed
- `shipped`: Shipped

## Development History

This project was developed using TDD (Test-Driven Development).

1. **Specification**: Described API specifications in natural language in [spec_en.md](spec_en.md)
2. **Test Creation**: Implemented test cases in [server.test.js](server.test.js) (all tests fail at this point)
3. **Implementation**: Implemented [server.js](server.js) to pass all tests
4. **API Documentation**: Documented specifications in OpenAPI format in [openapi.yaml](openapi.yaml) / [openapi_en.yaml](openapi_en.yaml)

For detailed development flow, please refer to [docs/prompts/README_en.md](docs/prompts/README_en.md).

## API Documentation

### File Naming Convention

| Type | Japanese | English |
|------|----------|---------|
| OpenAPI Spec | `openapi.yaml` | `openapi_en.yaml` |
| HTML Docs | `docs/api.html` | `docs/api_en.html` |

### Generating HTML API Documentation

```bash
# Generate both Japanese and English versions
npx @redocly/cli build-docs openapi.yaml -o docs/api.html && \
npx @redocly/cli build-docs openapi_en.yaml -o docs/api_en.html
```

Generated HTML can be viewed at:
- Japanese: [docs/api.html](docs/api.html)
- English: [docs/api_en.html](docs/api_en.html)
