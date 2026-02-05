# Test Generation Prompt

## Purpose

Create or update test file (server.test.js) based on specification (spec.md).
Following the TDD (Test-Driven Development) approach, create tests before implementation.

## When to Use

- Before implementing a new API
- After changing existing API specifications
- After updating spec.md

## Instructions

Read spec.md and create tests following these requirements:

### Test Framework
- Use Jest + supertest

### Test Structure
```javascript
const request = require('supertest');
const app = require('./server');

describe('API Name', () => {
  // Setup before each test
  beforeEach(async () => {
    await request(app).post('/api/reset');
  });

  describe('Endpoint', () => {
    it('should handle success case', async () => {
      // Test code
    });

    it('should handle error case', async () => {
      // Test code
    });
  });
});
```

### Test Items
1. **Success Cases**
   - Expected status code
   - Expected response format

2. **Error Cases**
   - Authentication error (401)
   - Validation error (400)
   - Resource not found (404)

3. **State Transition Tests**
   - Valid transitions
   - Invalid transitions

## Output File

- `server.test.js`

## How to Execute

```
Read spec.md and follow the instructions in docs/prompts/2-generate-test_en.md
to create or update server.test.js.
Confirm that tests fail at this point.
```
