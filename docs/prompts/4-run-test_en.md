# Test Execution Prompt

## Purpose

Test the implemented server.js with server.test.js and confirm all tests pass.

## When to Use

- After implementing server.js
- After modifying server.js

## Instructions

Execute tests with the following commands and verify the results.

### Test Commands

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run specific test
npm test -- server.test.js -t "test name"
```

### Verification

1. **All tests should pass**
   - If any fail, modify server.js

2. **Check coverage** (optional)
   ```bash
   npm test -- --coverage
   ```

### Handling Test Failures

1. Identify the failing test
2. Compare expected behavior with actual behavior
3. Modify server.js
4. Re-run tests

## How to Execute

```bash
npm test
```

Once all tests pass, proceed to the next step (OpenAPI specification generation).
