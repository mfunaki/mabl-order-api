# プロンプト一覧

> **English version:** For the English version of this document, please refer to [README_en.md](README_en.md).

このディレクトリには、開発・テスト作業を支援するためのプロンプトが含まれています。

## ファイル命名規則

| 種類 | 日本語版 | 英語版 |
|------|---------|--------|
| プロンプト | `X-name.md` | `X-name_en.md` |
| OpenAPI仕様 | `openapi.yaml` | `openapi_en.yaml` |
| HTML仕様書 | `docs/api.html` | `docs/api_en.html` |

## 開発フロー

```
┌─────────────────────────────────────────────────────────────────┐
│  1. 仕様書を作成・更新                                           │
│     spec.md を編集                                               │
│     プロンプト: 1-update-spec.md                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. テストを作成・更新（TDD）                                    │
│     server.test.js を生成                                        │
│     プロンプト: 2-generate-test.md                               │
│     ※この時点でテストは失敗する                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. 実装                                                         │
│     server.js を実装                                             │
│     プロンプト: 3-implement.md                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. テスト実行                                                   │
│     npm test                                                     │
│     プロンプト: 4-run-test.md                                    │
│     ※すべてのテストがパスするまで 3→4 を繰り返す                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. OpenAPI仕様書を生成                                          │
│     openapi.yaml, openapi_en.yaml を生成                         │
│     プロンプト: 5-generate-openapi.md                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  6. HTML仕様書を生成                                             │
│     docs/api.html, docs/api_en.html を生成                       │
│     プロンプト: 6-generate-html-docs.md                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  7. mablテストを作成（オプション）                               │
│     mabl でAPIテストを作成                                       │
│     プロンプト: 7-create-mabl-test.md                            │
└─────────────────────────────────────────────────────────────────┘
```

## どの場面でどのプロンプトを使うか

| 変更内容 | 実行するプロンプト |
|---------|-------------------|
| 新しいAPIを設計 | 1 → 2 → 3 → 4 → 5 → 6 |
| 既存APIの仕様変更 | 1 → 2 → 3 → 4 → 5 → 6 |
| バグ修正（テストあり） | 3 → 4 |
| バグ修正（テストなし） | 2 → 3 → 4 → 5 → 6 |
| ドキュメントのみ更新 | 5 → 6 |
| mablテストを追加 | 7 |

## プロンプト詳細

### 1-update-spec.md / 1-update-spec_en.md

**目的**: 仕様書（spec.md）の作成・更新

**出力**: `spec.md`

---

### 2-generate-test.md / 2-generate-test_en.md

**目的**: TDDに基づくテストファイルの生成

**出力**: `server.test.js`

**注意**: この時点でテストは失敗することを確認

---

### 3-implement.md / 3-implement_en.md

**目的**: テストをパスする実装の作成

**出力**: `server.js`

---

### 4-run-test.md / 4-run-test_en.md

**目的**: テストの実行と確認

**コマンド**: `npm test`

---

### 5-generate-openapi.md / 5-generate-openapi_en.md

**目的**: OpenAPI仕様ファイルの生成

**出力**:
- `openapi.yaml` （日本語版）
- `openapi_en.yaml` （英語版）

---

### 6-generate-html-docs.md / 6-generate-html-docs_en.md

**目的**: HTML形式のAPI仕様書を生成

**コマンド**:
```bash
npx @redocly/cli build-docs openapi.yaml -o docs/api.html && \
npx @redocly/cli build-docs openapi_en.yaml -o docs/api_en.html
```

**出力**:
- `docs/api.html` （日本語版）
- `docs/api_en.html` （英語版）

---

### 7-create-mabl-test.md / 7-create-mabl-test_en.md

**目的**: mabl でAPIテストを作成

**実行方法**: mabl MCP サーバー経由

---

## クイックリファレンス

### 新しいAPIを追加する場合

```bash
# 1. spec.md を更新
# 2. テストを生成
# 「spec.md を読み取り、2-generate-test.md の指示に従って server.test.js を更新」

# 3. 実装
# 「3-implement.md の指示に従って server.js を実装」

# 4. テスト実行
npm test

# 5. OpenAPI仕様を生成
# 「5-generate-openapi.md の指示に従って openapi.yaml と openapi_en.yaml を生成」

# 6. HTML仕様書を生成
npx @redocly/cli build-docs openapi.yaml -o docs/api.html && \
npx @redocly/cli build-docs openapi_en.yaml -o docs/api_en.html
```
