# mabl-order-api

mablの自動テストデモ用に作成された、注文管理REST APIサーバーです。
意図的にステート遷移やエラーを含めており、mablのAPIテスト機能をデモするのに適しています。

## 起動方法

```bash
npm install
node server.js
```

サーバーは `http://localhost:3000` で起動します。

## エンドポイント一覧

### 認証

#### POST /login
ログインしてJWTトークンを取得します。

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "password"}'
```

レスポンス例:
```json
{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

### ユーティリティ（認証不要）

#### POST /api/reset
全データを削除してリセットします。

```bash
curl -X POST http://localhost:3000/api/reset
```

#### POST /api/seed
デモ用の初期データ（ID: 1, status: created）を作成します。

```bash
curl -X POST http://localhost:3000/api/seed
```

### 注文管理（要認証）

以下のエンドポイントは `Authorization: Bearer <token>` ヘッダーが必要です。

#### POST /api/orders
新規注文を作成します（初期ステータス: `created`）。

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"item": "商品名"}'
```

#### GET /api/orders/:id
指定IDの注文情報を取得します。

```bash
curl http://localhost:3000/api/orders/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /api/orders/:id/pay
注文を支払い済み（`paid`）にします。

- 成功条件: 現在のステータスが `created`
- エラー: 既に `paid` または `shipped` の場合は 400 エラー

```bash
curl -X POST http://localhost:3000/api/orders/1/pay \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /api/orders/:id/ship
注文を発送済み（`shipped`）にします。

- 成功条件: 現在のステータスが `paid`
- エラー: `created`（未払い）の場合は 400 エラー

```bash
curl -X POST http://localhost:3000/api/orders/1/ship \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ステート遷移

```
created --> paid --> shipped
```

- `created`: 注文作成直後
- `paid`: 支払い完了
- `shipped`: 発送済み

## 開発経緯

このプロジェクトはTDD（テスト駆動開発）で開発されました。

1. **仕様策定**: [spec.md](spec.md) に自然言語でAPI仕様を記述
2. **テスト作成**: [server.test.js](server.test.js) にテストケースを実装（この時点では全テスト失敗）
3. **実装**: [server.js](server.js) を実装し、全テストをパス
4. **API仕様書作成**: [openapi.yaml](openapi.yaml) / [openapi-ja.yaml](openapi-ja.yaml) にOpenAPI形式で仕様をドキュメント化

## API仕様書

HTMLフォーマットのAPI仕様書を生成するには：

```bash
npx @redocly/cli build-docs openapi-ja.yaml -o docs/api-ja.html
```

生成されたHTMLは [docs/api-ja.html](docs/api-ja.html) で確認できます。
