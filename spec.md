# mabl-order-api 仕様書

> **English version:** For the English version of this document, please refer to [spec_en.md](spec_en.md).

## 1. プロジェクト概要

### 目的
mablのAPIテスト機能をデモするためのREST APIサーバー。意図的にステート遷移やエラーを含めており、mablのAPIテスト機能をデモするのに適しています。

### 技術スタック
- **Runtime:** Node.js
- **Framework:** Express
- **認証:** jsonwebtoken (JWT)
- **データストア:** インメモリ配列（データベース不使用）
- **ポート:** 3000

### 設定
- CORSを有効化（mablのクラウド実行環境からのアクセス対応）
- ボディーパーサー: `express.json()`

## 2. 認証方式

### 認証フロー
1. `POST /login` でJWTトークンを取得
2. 取得したトークンを `Authorization` ヘッダーに設定してAPIを呼び出す

### 認証情報
- **ユーザー名:** `demo`
- **パスワード:** `password`
- **秘密鍵:** `secret_key_demo`（ハードコード）
- **トークン有効期限:** 1時間

### 必要なヘッダー
```
Authorization: Bearer <token>
```

### 認証が必要なエンドポイント
- `/api/orders` 以下のすべてのルート

### 認証が不要なエンドポイント
- `POST /login`
- `POST /api/reset`
- `POST /api/seed`

## 3. エンドポイント一覧

### POST /login

ログインしてJWTトークンを取得します。

**リクエスト:**
```json
{
  "username": "demo",
  "password": "password"
}
```

**レスポンス（成功 - 200）:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**レスポンス（認証失敗 - 401）:**
```json
{
  "message": "認証に失敗しました"
}
```

---

### POST /api/reset

メモリ上の注文データを全て削除してリセットします。認証不要です。

**リクエスト:** なし

**レスポンス（成功 - 200）:**
```json
{
  "message": "Database reset"
}
```

---

### POST /api/seed

メモリ上のデータをリセットし、デモ用の初期データを1件作成します。認証不要です。

**リクエスト:** なし

**レスポンス（成功 - 200）:**
```json
{
  "order": {
    "id": "1",
    "item": "Sample Item",
    "status": "created",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### POST /api/orders

新規注文を作成します。初期ステータスは `created` です。**認証必要**

**リクエスト:**
```json
{
  "item": "商品名"
}
```

**レスポンス（成功 - 200）:**
```json
{
  "order": {
    "id": "1",
    "item": "商品名",
    "status": "created",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**レスポンス（認証エラー - 401）:**
```json
{
  "message": "認証が必要です"
}
```

---

### GET /api/orders/:id

指定IDの注文情報を取得します。**認証必要**

**パスパラメータ:**
- `id` - 注文ID

**レスポンス（成功 - 200）:**
```json
{
  "order": {
    "id": "1",
    "item": "商品名",
    "status": "created",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**レスポンス（注文が見つからない - 404）:**
```json
{
  "message": "注文が見つかりません"
}
```

---

### POST /api/orders/:id/pay

注文を支払い済み（`paid`）にします。**認証必要**

**パスパラメータ:**
- `id` - 注文ID

**成功条件:** 現在のステータスが `created` であること

**レスポンス（成功 - 200）:**
```json
{
  "order": {
    "id": "1",
    "item": "商品名",
    "status": "paid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**レスポンス（既に支払い済み - 400）:**
```json
{
  "message": "支払いは完了しています"
}
```

**レスポンス（注文が見つからない - 404）:**
```json
{
  "message": "注文が見つかりません"
}
```

---

### POST /api/orders/:id/ship

注文を発送済み（`shipped`）にします。**認証必要**

**パスパラメータ:**
- `id` - 注文ID

**成功条件:** 現在のステータスが `paid` であること

**レスポンス（成功 - 200）:**
```json
{
  "order": {
    "id": "1",
    "item": "商品名",
    "status": "shipped",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**レスポンス（未払い - 400）:**
```json
{
  "message": "支払いが完了していないため発送できません"
}
```

**レスポンス（注文が見つからない - 404）:**
```json
{
  "message": "注文が見つかりません"
}
```

## 4. ビジネスロジック

### 注文データ構造

```json
{
  "id": "string",
  "item": "string",
  "status": "string",
  "createdAt": "ISO 8601形式の日時文字列"
}
```

### ステート遷移

```
created --> paid --> shipped
```

| ステータス | 説明 |
|----------|------|
| `created` | 注文作成直後（未払い） |
| `paid` | 支払い完了 |
| `shipped` | 発送済み |

### 遷移ルール

| 現在のステータス | 許可されるアクション | 結果のステータス |
|----------------|---------------------|-----------------|
| `created` | pay | `paid` |
| `paid` | ship | `shipped` |
| `created` | ship | エラー（400） |
| `paid` | pay | エラー（400） |
| `shipped` | pay | エラー（400） |
| `shipped` | ship | `shipped`（変更なし） |

### エラー条件

| エンドポイント | 条件 | ステータスコード | メッセージ |
|--------------|------|-----------------|-----------|
| `/login` | 認証情報が不正 | 401 | 認証に失敗しました |
| `/api/orders/*` | Authorizationヘッダーなし | 401 | 認証が必要です |
| `/api/orders/*` | 無効なトークン | 401 | 無効なトークンです |
| `/api/orders/:id` | 注文が存在しない | 404 | 注文が見つかりません |
| `/api/orders/:id/pay` | 既に支払い済み | 400 | 支払いは完了しています |
| `/api/orders/:id/ship` | 未払い | 400 | 支払いが完了していないため発送できません |

## 5. HTTPステータスコード

| コード | 意味 | 使用場面 |
|-------|------|---------|
| 200 | 成功 | 正常にリクエストが処理された |
| 400 | 不正なリクエスト | ビジネスルール違反 |
| 401 | 認証エラー | 認証失敗、トークン無効 |
| 404 | 見つからない | 指定されたリソースが存在しない |
