# プロンプト一覧

このディレクトリには、開発・テスト作業を支援するためのプロンプトが含まれています。

## プロンプト適用フロー

```
┌─────────────────────────────────────────────────────────────────┐
│                      server.js を変更                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  1-generate-openapi.md    OpenAPI仕様（YAML）を再生成            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2-generate-html-docs.md  HTML仕様書を再生成                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3-testcreation-api-mabl.md  mablでAPIテストを作成               │
└─────────────────────────────────────────────────────────────────┘
```

## どの場面でどのプロンプトを使うか

| 変更内容 | 実行するプロンプト |
|---------|-------------------|
| server.js のエンドポイント追加・変更 | 1 → 2 |
| server.js のレスポンス形式変更 | 1 → 2 |
| OpenAPI仕様（YAML）のみ手動修正 | 2 のみ |
| 新しいAPIテストを作成したい | 3 のみ |
| server.js 変更後にmablテストも更新したい | 1 → 2 → 3 |

## プロンプト詳細

### 1-generate-openapi.md

**目的**: server.js のコードを解析して OpenAPI 仕様ファイルを生成

**いつ使う**:
- server.js にエンドポイントを追加した時
- リクエスト/レスポンスの形式を変更した時
- エラーハンドリングを追加・変更した時

**出力ファイル**:
- `openapi.yaml` （英語版）
- `openapi-ja.yaml` （日本語版）

**実行方法**:
```
server.js を読み取り、docs/prompts/1-generate-openapi.md の指示に従って
openapi.yaml と openapi-ja.yaml を生成してください。
```

---

### 2-generate-html-docs.md

**目的**: OpenAPI 仕様ファイルから HTML 形式の API 仕様書を生成

**いつ使う**:
- OpenAPI 仕様（YAML）を更新した後
- API ドキュメントを最新化したい時

**出力ファイル**:
- `docs/api.html` （英語版）
- `docs/api-ja.html` （日本語版）

**実行方法**:
```bash
npx @redocly/cli build-docs openapi-ja.yaml -o docs/api-ja.html && \
npx @redocly/cli build-docs openapi.yaml -o docs/api.html
```

---

### 3-testcreation-api-mabl.md

**目的**: mabl で API テストを作成するための指示

**いつ使う**:
- 新しい API テストを mabl で作成したい時
- API の正常系・異常系テストを追加したい時

**実行方法**:
mabl MCP サーバー経由で、このプロンプトの内容に従ってテストを作成

---

## クイックリファレンス

### server.js 変更後の一括更新

```bash
# 1. Claude Code で OpenAPI 仕様を更新
# 「server.js を読み取り、1-generate-openapi.md の指示に従って YAML を更新」

# 2. HTML 仕様書を再生成
npx @redocly/cli build-docs openapi-ja.yaml -o docs/api-ja.html && \
npx @redocly/cli build-docs openapi.yaml -o docs/api.html
```
