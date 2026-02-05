# Implementation Prompt

## Purpose

Create or update server implementation (server.js) based on specification (spec.md) and tests (server.test.js).

## When to Use

- After tests have been created
- When implementing to make failing tests pass

## Instructions

Read spec.md and server.test.js, then implement code that passes all tests.

### Implementation Rules

1. **Keep It Simple**
   - Keep everything in a single file (server.js)
   - Implement with minimal code

2. **Response Format**
   - Success: Wrapper format like `{ order }`, `{ token }`, `{ message }`
   - Error: `{ message: "Error message" }`

3. **Error Handling**
   - Return appropriate HTTP status codes
   - Include descriptive error messages

4. **Authentication**
   - Use JWT
   - Protect routes under `/api/orders`

### Basic Structure
```javascript
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
// ... implementation
module.exports = app;
```

## Output File

- `server.js`

## How to Execute

```
Read spec.md and server.test.js,
follow the instructions in docs/prompts/3-implement_en.md to implement server.js.
Confirm that all tests pass.
```
