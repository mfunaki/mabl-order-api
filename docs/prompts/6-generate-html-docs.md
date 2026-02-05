# HTML API仕様書生成プロンプト

## 目的

OpenAPI仕様ファイルからHTML形式のAPI仕様書を生成します。

## いつ使う

- OpenAPI仕様（YAML）を更新した後
- APIドキュメントを最新化したい時

## ファイル命名規則

- `docs/api.html` - 日本語版（デフォルト）
- `docs/api_en.html` - 英語版

## 生成コマンド

### 日本語版のみ生成

```bash
npx @redocly/cli build-docs openapi.yaml -o docs/api.html
```

### 英語版のみ生成

```bash
npx @redocly/cli build-docs openapi_en.yaml -o docs/api_en.html
```

### 両方を生成

```bash
npx @redocly/cli build-docs openapi.yaml -o docs/api.html && \
npx @redocly/cli build-docs openapi_en.yaml -o docs/api_en.html
```

## 出力ファイル

- `docs/api.html` - 日本語版API仕様書
- `docs/api_en.html` - 英語版API仕様書

## 確認方法

```bash
# macOS
open docs/api.html

# Linux
xdg-open docs/api.html

# Windows
start docs/api.html
```

## 実行方法

```
docs/prompts/6-generate-html-docs.md の指示に従って、HTML API仕様書を生成してください。
```
