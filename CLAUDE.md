# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要
mabl-order-api - mablの自動テストデモ用に作成された、意図的にステート遷移やエラーを含ませたREST APIサーバー。

## 技術スタック
- Runtime: Node.js 20
- Framework: Express
- Auth: jsonwebtoken (JWT)
- Test: Jest + supertest
- Data: In-memory (No Database)

## コマンド
- `npm install` - 依存関係インストール
- `npm start` - サーバー起動 (localhost:3000)
- `npm test` - 全テスト実行
- `npm test -- --watch` - ウォッチモードでテスト
- `npm test -- server.test.js -t "テスト名"` - 単一テスト実行

## アーキテクチャ
単一ファイル構成（server.js）。インメモリデータストアを使用し、再起動または `/api/reset` で初期化される。

### 注文ステート遷移
```
created --> paid --> shipped
```

### 認証フロー
1. POST /login で JWT トークン取得（username: demo, password: password）
2. Authorization: Bearer <token> ヘッダーで認証

### エンドポイント
- `/login` - 認証（POST）
- `/api/reset` - データリセット（POST、認証不要）
- `/api/seed` - デモデータ作成（POST、認証不要）
- `/api/orders` - 注文作成（POST、要認証）
- `/api/orders/:id` - 注文取得（GET、要認証）
- `/api/orders/:id/pay` - 支払い処理（POST、要認証）
- `/api/orders/:id/ship` - 発送処理（POST、要認証）

## 開発方針
- デモ用アプリケーションのため、複雑なアーキテクチャよりも「mablでテストしやすいこと」を優先する
- データの永続化は行わず、再起動やリセットAPIで初期化される仕様とする
- コードはシンプルに保ち、1つのファイル（server.js）にまとめる

## CI/CD
mainブランチへのpushでCloud Runへ自動デプロイ（.github/workflows/deploy.yml）。デプロイ後にmablテストが自動実行される。

## Docker操作

```bash
# ローカルでDockerイメージをビルド
docker build -t mabl-order-api .

# コンテナ起動
docker run -p 3000:3000 mabl-order-api

# バックグラウンドで起動
docker run -d -p 3000:3000 --name mabl-api mabl-order-api

# コンテナ停止・削除
docker stop mabl-api && docker rm mabl-api
```

## API動作確認（curl）

```bash
# ログインしてトークン取得
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"password"}' | jq -r '.token')

# 注文作成
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"item":"テスト商品"}'

# 注文取得
curl http://localhost:3000/api/orders/1 \
  -H "Authorization: Bearer $TOKEN"

# 支払い処理
curl -X POST http://localhost:3000/api/orders/1/pay \
  -H "Authorization: Bearer $TOKEN"

# 発送処理
curl -X POST http://localhost:3000/api/orders/1/ship \
  -H "Authorization: Bearer $TOKEN"

# データリセット
curl -X POST http://localhost:3000/api/reset

# 完全フロー（注文→支払い→発送）
curl -X POST http://localhost:3000/api/reset && \
TOKEN=$(curl -s -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"username":"demo","password":"password"}' | jq -r '.token') && \
ORDER=$(curl -s -X POST http://localhost:3000/api/orders -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"item":"テスト商品"}') && \
ORDER_ID=$(echo $ORDER | jq -r '.order.id') && \
curl -X POST "http://localhost:3000/api/orders/$ORDER_ID/pay" -H "Authorization: Bearer $TOKEN" && \
curl -X POST "http://localhost:3000/api/orders/$ORDER_ID/ship" -H "Authorization: Bearer $TOKEN"
```

## MCP Integration

| MCPサーバー | 用途 |
|------------|------|
| **GitHub** | PR作成、Issue管理、CI/CDステータス確認 |
| **mabl** | E2Eテスト作成・実行・結果確認 |
| **Docker** | コンテナビルド・実行の自動化 |
| **GCP (gcloud)** | Cloud Runデプロイ状況確認 |