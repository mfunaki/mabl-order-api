mablのAPIテスト機能をデモするための、REST APIサーバーをNode.jsとExpressで実装してください。
データベースは使用せず、メモリ上の配列でデータを管理する簡易的な仕様でお願いします。

## 1. プロジェクト設定
- **プロジェクト名(package.jsonのname):** `mabl-order-api`
- ポートは `3000` で起動すること。
- CORSを許可すること（mablのクラウド実行環境からアクセスするため）。
- ボディーパーサーとして `express.json()` を使用すること。
- エラーハンドリングを行い、適切なHTTPステータスコード（200, 400, 401, 404）を返すこと。

## 2. 認証 (JWT)
- ライブラリ `jsonwebtoken` を使用すること。
- 秘密鍵はハードコードで可（例: "secret_key_demo"）。
- **POST /login**
    - リクエスト: `{ "username": "demo", "password": "password" }` （この組み合わせのみ成功）
    - レスポンス: `{ "token": "..." }`
- **認証ミドルウェア**
    - `/api/orders` 以下のすべてのルートを保護する。
    - ヘッダー `Authorization: Bearer <token>` を検証する。

## 3. ユーティリティ（デモ環境リセット用）
- **POST /api/reset**
    - メモリ上の注文データを全て削除し、空にする。
    - 認証不要とする（デモのセットアップステップで使いやすくするため）。
    - レスポンス: `{ "message": "Database reset" }`
- **POST /api/seed**
    - メモリ上のデータをリセットし、デモ用の初期データ（例: ID "1", status "created" の注文など）を1件作成する。
    - 認証不要とする。

## 4. 業務ロジック（注文ステートマシン）
注文データ構造: `{ id: string, item: string, status: string, createdAt: date }`
可能なステータス遷移: `created` -> `paid` -> `shipped`

- **POST /api/orders**
    - 新規注文を作成する。初期ステータスは `created`。
    - レスポンスに作成された注文オブジェクトを含める。
- **GET /api/orders/:id**
    - 指定IDの注文情報を返す。
- **POST /api/orders/:id/pay**
    - ステータスを `paid` に更新する。
    - **【重要: 正常系】** 現在のステータスが `created` の場合のみ成功する（200 OK）。
    - **【重要: 異常系】** 既に `paid` や `shipped` の場合は、**400 Bad Request** を返し、エラーメッセージ「支払いは完了しています」を含める。
- **POST /api/orders/:id/ship**
    - ステータスを `shipped` に更新する。
    - **【重要: 正常系】** 現在のステータスが `paid` の場合のみ成功する（200 OK）。
    - **【重要: 異常系】** ステータスが `created` （未払い）の場合は、**400 Bad Request** を返し、エラーメッセージ「支払いが完了していないため発送できません」を含める。

## 出力要求
以下のファイルを作成するためのコードを出力してください。
1. **package.json**
    - nameは `mabl-order-api` とすること。
    - 依存ライブラリ: express, jsonwebtoken, cors, body-parser
2. **server.js**
    - 上記の要件をすべて満たす実装コード。
3. **README.md**
    - プロジェクトの概要。
    - 起動方法 (`npm install` -> `node server.js`)。
    - 各エンドポイントの仕様と、動作確認用の `curl` コマンドのサンプル（特に `/login` でトークンを取得し、それを使って `/orders` を叩く例）。