# Prompt List

> **日本語版:** 日本語版のドキュメントは [README.md](README.md) をご覧ください。

This directory contains prompts to support development and testing tasks.

## File Naming Convention

| Type | Japanese | English |
|------|---------|--------|
| Prompt | `X-name.md` | `X-name_en.md` |
| OpenAPI Spec | `openapi.yaml` | `openapi_en.yaml` |
| HTML Docs | `docs/api.html` | `docs/api_en.html` |

## Development Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Create/Update Specification                                  │
│     Edit spec_en.md                                              │
│     Prompt: 1-update-spec_en.md                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. Create/Update Tests (TDD)                                    │
│     Generate server.test.js                                      │
│     Prompt: 2-generate-test_en.md                                │
│     *Tests should fail at this point                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. Implement                                                    │
│     Implement server.js                                          │
│     Prompt: 3-implement_en.md                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. Run Tests                                                    │
│     npm test                                                     │
│     Prompt: 4-run-test_en.md                                     │
│     *Repeat 3→4 until all tests pass                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. Generate OpenAPI Specification                               │
│     Generate openapi.yaml, openapi_en.yaml                       │
│     Prompt: 5-generate-openapi_en.md                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  6. Generate HTML Documentation                                  │
│     Generate docs/api.html, docs/api_en.html                     │
│     Prompt: 6-generate-html-docs_en.md                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  7. Create mabl Tests (Optional)                                 │
│     Create API tests with mabl                                   │
│     Prompt: 7-create-mabl-test_en.md                             │
└─────────────────────────────────────────────────────────────────┘
```

## When to Use Which Prompt

| Change Type | Prompts to Execute |
|-------------|-------------------|
| Design new API | 1 → 2 → 3 → 4 → 5 → 6 |
| Change existing API spec | 1 → 2 → 3 → 4 → 5 → 6 |
| Bug fix (with tests) | 3 → 4 |
| Bug fix (without tests) | 2 → 3 → 4 → 5 → 6 |
| Documentation only | 5 → 6 |
| Add mabl tests | 7 |

## Quick Reference

### Adding a New API

```bash
# 1. Update spec_en.md
# 2. Generate tests
# "Read spec_en.md and follow 2-generate-test_en.md to update server.test.js"

# 3. Implement
# "Follow 3-implement_en.md to implement server.js"

# 4. Run tests
npm test

# 5. Generate OpenAPI spec
# "Follow 5-generate-openapi_en.md to generate openapi.yaml and openapi_en.yaml"

# 6. Generate HTML docs
npx @redocly/cli build-docs openapi.yaml -o docs/api.html && \
npx @redocly/cli build-docs openapi_en.yaml -o docs/api_en.html
```
