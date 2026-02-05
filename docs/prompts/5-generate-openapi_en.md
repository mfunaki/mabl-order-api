# OpenAPI Specification Generation Prompt

## Purpose

Generate OpenAPI specification files by analyzing server.js code.

## When to Use

- After all tests pass
- After adding or changing endpoints in server.js
- After modifying request/response formats

## Instructions

Read server.js and generate YAML files compliant with OpenAPI 3.0 specification.

### File Naming Convention

- `openapi.yaml` - Japanese version (default)
- `openapi_en.yaml` - English version

### Generation Rules

1. **Basic Information**
   - OpenAPI version: 3.0.0
   - Title: mabl-order-api
   - Server URL: http://localhost:3000

2. **Accurate Response Structure**

   For `res.json({ order })`:
   ```yaml
   type: object
   properties:
     order:
       $ref: '#/components/schemas/Order'
   ```

3. **Schema Definitions**
   - Order - Order object
   - OrderResponse - `{ order: Order }`
   - MessageResponse - `{ message: string }`
   - TokenResponse - `{ token: string }`
   - ErrorResponse - `{ message: string }`

4. **Security**
   - Define bearerAuth (JWT)
   - Apply to routes under `/api/orders`

5. **English Version Requirements**
   - Group by tags (Authentication, Data Management, Order Management)
   - Detailed descriptions (state transitions, error conditions)

## Output Files

- `openapi.yaml` (Japanese version)
- `openapi_en.yaml` (English version)

## How to Execute

```
Read server.js and follow the instructions in docs/prompts/5-generate-openapi_en.md
to generate openapi.yaml and openapi_en.yaml.
```
