# HTML API Documentation Generation Prompt

## Purpose

Generate HTML API documentation from OpenAPI specification files.

## When to Use

- After updating OpenAPI specification (YAML)
- When you want to refresh API documentation

## File Naming Convention

- `docs/api.html` - Japanese version (default)
- `docs/api_en.html` - English version

## Generation Commands

### Generate Japanese version only

```bash
npx @redocly/cli build-docs openapi.yaml -o docs/api.html
```

### Generate English version only

```bash
npx @redocly/cli build-docs openapi_en.yaml -o docs/api_en.html
```

### Generate both

```bash
npx @redocly/cli build-docs openapi.yaml -o docs/api.html && \
npx @redocly/cli build-docs openapi_en.yaml -o docs/api_en.html
```

## Output Files

- `docs/api.html` - Japanese API documentation
- `docs/api_en.html` - English API documentation

## Verification

```bash
# macOS
open docs/api.html

# Linux
xdg-open docs/api.html

# Windows
start docs/api.html
```

## How to Execute

```
Follow the instructions in docs/prompts/6-generate-html-docs_en.md to generate HTML API documentation.
```
