# HTML API仕様書生成プロンプト

このプロンプトは、OpenAPI仕様ファイルからHTML形式のAPI仕様書を生成するためのものです。

## 前提条件

- `openapi.yaml`（英語版）と `openapi-ja.yaml`（日本語版）が最新の状態であること
- Node.js がインストールされていること

## 生成コマンド

### 日本語版のみ生成

```bash
npx @redocly/cli build-docs openapi-ja.yaml -o docs/api-ja.html
```

### 英語版のみ生成

```bash
npx @redocly/cli build-docs openapi.yaml -o docs/api.html
```

### 両方を生成

```bash
npx @redocly/cli build-docs openapi-ja.yaml -o docs/api-ja.html && npx @redocly/cli build-docs openapi.yaml -o docs/api.html
```

## 出力ファイル

| ファイル | 説明 |
|---------|------|
| `docs/api-ja.html` | 日本語版API仕様書 |
| `docs/api.html` | 英語版API仕様書 |

## 確認方法

生成後、ブラウザで開いて確認：

```bash
# macOS
open docs/api-ja.html

# Linux
xdg-open docs/api-ja.html

# Windows
start docs/api-ja.html
```

## 注意事項

- OpenAPI仕様ファイルを更新した場合は、必ずHTMLも再生成してください
- server.js を変更した場合は、先に `generate-openapi.md` の手順でOpenAPI仕様を更新してから、このプロンプトでHTMLを生成してください

## 実行方法

Claude Code で以下のように実行：

```
docs/prompts/generate-html-docs.md の指示に従って、HTML API仕様書を生成してください。
```

## ワンライナー（OpenAPI生成からHTML生成まで）

server.js を変更した場合、以下の手順で一括更新できます：

1. OpenAPI仕様を更新（Claude Codeで実行）
2. HTMLを再生成：

```bash
npx @redocly/cli build-docs openapi-ja.yaml -o docs/api-ja.html && npx @redocly/cli build-docs openapi.yaml -o docs/api.html
```
