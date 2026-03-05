# mabl-order-api

> **English version:** For the English version of this document, please refer to [README_en.md](README_en.md).

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

## Amazon Cognito 認証の設定

デフォルトでは組み込みのローカルJWT認証（`demo` / `password`）を使用します。
Amazon Cognitoによる認証に切り替えるには以下の手順で設定してください。

### 前提条件

- AWS アカウントおよび Cognito ユーザープールが作成済みであること

### 手順

**1. パッケージのインストール**

```bash
npm install aws-jwt-verify
```

**2. 環境変数の設定**

`.env.example` をコピーして `.env` を作成し、値を設定します。

```bash
cp .env.example .env
```

`.env` を編集:

```env
AUTH_MODE=cognito
COGNITO_USER_POOL_ID=ap-northeast-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
AWS_REGION=ap-northeast-1
```

| 変数名 | 説明 | 例 |
|--------|------|----|
| `AUTH_MODE` | 認証モード（`local` または `cognito`） | `cognito` |
| `COGNITO_USER_POOL_ID` | Cognito ユーザープール ID | `ap-northeast-1_AbCdEf123` |
| `COGNITO_CLIENT_ID` | Cognito アプリクライアント ID | `1a2b3c4d5e...` |
| `AWS_REGION` | AWS リージョン | `ap-northeast-1` |

**Cognito ユーザープール ID・クライアント ID の確認方法:**

AWS マネジメントコンソール → Cognito → ユーザープール → 対象プールを選択
- ユーザープール ID: 概要ページに表示
- クライアント ID: 「アプリの統合」タブ → 「アプリクライアント」に表示

**3. サーバー起動**

```bash
node -r dotenv/config server.js
# または dotenv をインストール済みの場合
node server.js
```

**4. Cognito トークンの取得と利用**

Cognito で認証してアクセストークンを取得し、`Authorization: Bearer <token>` ヘッダーに指定します。

```bash
# AWS CLI でトークン取得
TOKEN=$(aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id YOUR_CLIENT_ID \
  --auth-parameters USERNAME=user@example.com,PASSWORD=yourpassword \
  --region ap-northeast-1 \
  --query 'AuthenticationResult.AccessToken' \
  --output text)

# API 呼び出し
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN"
```

> **注意:** `AUTH_MODE=local`（デフォルト）の場合、Cognito 設定は不要です。ローカルの `POST /login` エンドポイントで取得したトークンが引き続き使用できます。

## 開発経緯

このプロジェクトはTDD（テスト駆動開発）で開発されました。

1. **仕様策定**: [spec.md](spec.md) に自然言語でAPI仕様を記述
2. **テスト作成**: [server.test.js](server.test.js) にテストケースを実装（この時点では全テスト失敗）
3. **実装**: [server.js](server.js) を実装し、全テストをパス
4. **API仕様書作成**: [openapi.yaml](openapi.yaml) / [openapi_en.yaml](openapi_en.yaml) にOpenAPI形式で仕様をドキュメント化

詳細な開発フローは [docs/prompts/README.md](docs/prompts/README.md) を参照してください。

## API仕様書

### ファイル命名規則

| 種類 | 日本語版 | 英語版 |
|------|---------|--------|
| OpenAPI仕様 | `openapi.yaml` | `openapi_en.yaml` |
| HTML仕様書 | `docs/api.html` | `docs/api_en.html` |

### HTMLフォーマットのAPI仕様書を生成するには

```bash
# 日本語版と英語版を生成
npx @redocly/cli build-docs openapi.yaml -o docs/api.html && \
npx @redocly/cli build-docs openapi_en.yaml -o docs/api_en.html
```

生成されたHTMLは以下で確認できます：
- 日本語版: [docs/api.html](docs/api.html)
- 英語版: [docs/api_en.html](docs/api_en.html)
