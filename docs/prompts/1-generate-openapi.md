# OpenAPI仕様書生成プロンプト

このプロンプトは、server.jsのコードを解析してOpenAPI仕様書（openapi.yamlとopenapi-ja.yaml）を生成するためのものです。

## 指示

以下のserver.jsのコードを解析し、OpenAPI 3.0仕様に準拠したYAMLファイルを2つ生成してください：

1. `openapi.yaml` - 英語版
2. `openapi-ja.yaml` - 日本語版

## 生成ルール

### 基本情報
- OpenAPIバージョン: 3.0.0
- タイトル: mabl-order-api
- サーバーURL: http://localhost:3000

### レスポンス構造の正確な反映

**重要**: server.jsの実際のレスポンス構造を正確に反映してください。

例えば、`res.json({ order })` の場合、レスポンススキーマは：
```yaml
type: object
properties:
  order:
    $ref: '#/components/schemas/Order'
```

`res.json({ token })` の場合：
```yaml
type: object
properties:
  token:
    type: string
```

`res.json({ message: '...' })` の場合：
```yaml
type: object
properties:
  message:
    type: string
```

### 日本語版の要件
- description、summary をすべて日本語化
- タグ（認証、データ管理、注文管理など）を使用してエンドポイントをグループ化
- エラー条件やステート遷移の説明を詳細に記述

### スキーマ定義

以下のスキーマをcomponentsセクションに定義：

1. **Order** - 注文オブジェクト
   - id: string
   - item: string
   - status: string (enum: created, paid, shipped)
   - createdAt: string (date-time format)

2. **Error** - エラーレスポンス
   - message: string

3. **OrderResponse** - 注文を含むレスポンス
   - order: Order

4. **MessageResponse** - メッセージを含むレスポンス
   - message: string

5. **TokenResponse** - トークンを含むレスポンス
   - token: string

### セキュリティ
- bearerAuth (JWT) を定義
- `/api/orders` 以下のエンドポイントに適用

## 解析対象コード

```javascript
// server.js の内容をここに貼り付けて解析してもらう
```

## 出力

1. openapi.yaml の完全な内容
2. openapi-ja.yaml の完全な内容

## 実行方法

Claude Code で以下のように実行：

```
server.js を読み取り、docs/prompts/generate-openapi.md の指示に従って openapi.yaml と openapi-ja.yaml を生成してください。
```
