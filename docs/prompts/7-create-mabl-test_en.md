# mabl Test Creation Prompt

## Purpose

Create API tests with mabl.

## When to Use

- When you want to create new API tests with mabl
- When adding success/failure pattern tests for APIs
- When integrating tests into CI/CD pipeline

## Test Content

Create the following API tests:

### 1. Setup
- Login (get JWT token for subsequent API calls)
- Reset demo environment
- Create seed data

### 2. Success Pattern
- Create order (item: "Success Product")
- Process payment (created → paid)
- Ship order (paid → shipped)

### 3. Failure Pattern
- Create order (item: "Failure Product")
- Attempt shipping before payment (skip paid → error)

## Assertions

- Verify status codes
- Verify response body structure
- Verify state transitions

## How to Execute

Create tests via mabl MCP server following this prompt.

```
Follow the instructions in docs/prompts/7-create-mabl-test_en.md to create mabl API tests.
```
