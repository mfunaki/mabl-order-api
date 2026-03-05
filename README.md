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

#### GET /api/orders
全注文一覧を取得します。

```bash
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
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

**1. 環境変数の設定**

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

**2. サーバー起動**

```bash
node -r dotenv/config server.js
# または dotenv をインストール済みの場合
node server.js
```

**3. Cognito トークンの取得と利用**

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

### Postman でのトークン取得と検証

#### Pre-request Script（トークン取得）

コレクションまたはリクエストの「Pre-request Script」タブに記述します：

```javascript
var region       = pm.variables.get('aws_region');
var clientId     = pm.variables.get('cognito_client_id');
var clientSecret = pm.variables.get('cognito_client_secret');
var username     = pm.variables.get('api.credentials.username');
var password     = pm.variables.get('api.credentials.password');

// SECRET_HASH = Base64( HMAC-SHA256( clientSecret, username + clientId ) )
var secretHash = CryptoJS.enc.Base64.stringify(
  CryptoJS.HmacSHA256(username + clientId, clientSecret)
);

pm.sendRequest({
  url: 'https://cognito-idp.' + region + '.amazonaws.com/',
  method: 'POST',
  header: {
    'Content-Type': 'application/x-amz-json-1.1',
    'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
  },
  body: {
    mode: 'raw',
    raw: JSON.stringify({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    }),
  },
}, function(err, response) {
  if (err) {
    console.error('Cognito 認証エラー:', err);
    return;
  }

  var data = response.json();

  if (data.AuthenticationResult) {
    pm.environment.set('token', data.AuthenticationResult.AccessToken);
    console.info('Cognito トークン取得成功');
  } else {
    console.warn('Cognito 認証失敗:', JSON.stringify(data));
  }
});
```

取得したトークンは環境変数 `token` に保存されます。各リクエストの Authorization ヘッダーに `Bearer {{token}}` と指定してください。

#### Tests（レスポンス検証）

「Tests」タブに記述します。各エンドポイントに応じて使い分けます：

**POST /api/orders（注文作成）**

```javascript
pm.test('ステータスコードが200', function() {
  pm.expect(pm.response.code).to.equal(200);
});

pm.test('注文が作成され order_id が返る', function() {
  var data = pm.response.json();
  pm.expect(data.order).to.have.property('id');
  pm.expect(data.order.status).to.equal('created');
  pm.environment.set('order_id', data.order.id);
  console.log('作成された注文ID:', data.order.id);
});
```

**POST /api/orders/:id/ship（未払いで発送 → 400 確認）**

```javascript
pm.test('未払い注文の発送で400エラー', function() {
  pm.expect(pm.response.code).to.equal(400);
  var data = pm.response.json();
  pm.expect(data.message).to.include('支払い');
  console.warn('期待通り400エラー:', data.message);
});
```

**POST /api/orders/:id/pay（支払い）**

```javascript
pm.test('支払い後のステータスが paid', function() {
  var data = pm.response.json();
  pm.expect(data.order.status).to.equal('paid');
  console.info('支払い完了: status =', data.order.status);
});
```

**POST /api/orders/:id/ship（発送）**

```javascript
pm.test('発送後のステータスが shipped', function() {
  var data = pm.response.json();
  pm.expect(data.order.status).to.equal('shipped');
  console.info('発送完了: status =', data.order.status);
});
```

#### Postman Environment 変数

| 変数名 | 値の例 |
|---|---|
| `aws_region` | `ap-northeast-1` |
| `cognito_client_id` | `1a2b3c4d5e...` |
| `cognito_client_secret` | `（シークレット）` |
| `api.credentials.username` | `user@example.com` |
| `api.credentials.password` | `（シークレット）` |
| `token` | Pre-request Script により自動設定 |
| `order_id` | Tests により自動設定 |

> **`cognito_client_secret` の確認方法:** AWS コンソール → Cognito → ユーザープール → 「アプリの統合」→ アプリクライアント → 「クライアントのシークレットを表示」

```
① Pre-request Script  →  pm.environment.set('token', AccessToken)
② POST /api/orders    →  Authorization: Bearer {{token}}
                          Tests: pm.environment.set('order_id', ...)
③ POST /api/orders/{{order_id}}/ship  →  Tests: 400 を確認
④ POST /api/orders/{{order_id}}/pay  →  Tests: status = paid を確認
⑤ POST /api/orders/{{order_id}}/ship →  Tests: status = shipped を確認
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
