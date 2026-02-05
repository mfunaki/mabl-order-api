# OpenAPI仕様書生成プロンプト

## 目的

server.js のコードを解析して OpenAPI 仕様ファイルを生成します。

## いつ使う

- すべてのテストがパスした後
- server.js にエンドポイントを追加・変更した後
- リクエスト/レスポンスの形式を変更した後

## 指示

server.js を読み取り、OpenAPI 3.0仕様に準拠したYAMLファイルを生成してください。

### ファイル命名規則

- `openapi.yaml` - 日本語版（デフォルト）
- `openapi_en.yaml` - 英語版

### 生成ルール

1. **基本情報**
   - OpenAPIバージョン: 3.0.0
   - タイトル: mabl-order-api
   - サーバーURL: http://localhost:3000

2. **レスポンス構造の正確な反映**

   `res.json({ order })` の場合：
   ```yaml
   type: object
   properties:
     order:
       $ref: '#/components/schemas/Order'
   ```

3. **スキーマ定義**
   - Order - 注文オブジェクト
   - OrderResponse - `{ order: Order }`
   - MessageResponse - `{ message: string }`
   - TokenResponse - `{ token: string }`
   - ErrorResponse - `{ message: string }`

4. **セキュリティ**
   - bearerAuth (JWT) を定義
   - `/api/orders` 以下に適用

5. **日本語版の追加要件**
   - タグによるグループ化（認証、データ管理、注文管理）
   - 詳細な説明（ステート遷移、エラー条件）

## 出力ファイル

- `openapi.yaml` （日本語版）
- `openapi_en.yaml` （英語版）

## 実行方法

```
server.js を読み取り、docs/prompts/5-generate-openapi.md の指示に従って
openapi.yaml と openapi_en.yaml を生成してください。
```
