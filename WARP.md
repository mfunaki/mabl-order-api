# WARP.md

Warp Terminal向けのプロジェクトガイド。開発効率を最大化するためのコマンドとワークフロー集。

---

## [Project Overview]

**mabl-order-api** - mablの自動テストデモ用REST APIサーバー

| 項目 | 内容 |
|------|------|
| 言語 | Node.js 20 |
| フレームワーク | Express 4.x |
| 認証 | JWT (jsonwebtoken) |
| テスト | Jest + supertest |
| データストア | インメモリ（再起動でリセット） |
| デプロイ先 | Google Cloud Run |

---

## [Quick Start]

```bash
# 依存関係インストール
npm install

# 開発サーバー起動（localhost:3000）
npm start

# 全テスト実行
npm test

# ウォッチモードでテスト
npm test -- --watch

# 特定のテスト実行
npm test -- server.test.js -t "正しい認証情報でトークンを返す"
```

---

## [Key Directories]

```
mabl-order-api/
├── server.js          # メインアプリケーション（単一ファイル構成）
├── server.test.js     # Jestテストスイート
├── package.json       # 依存関係・スクリプト定義
├── Dockerfile         # Cloud Run用コンテナ定義
├── spec.md            # API仕様書
├── CLAUDE.md          # Claude Code向けガイド
└── .github/
    └── workflows/
        └── deploy.yml # Cloud Run自動デプロイ
```

---

## [Environment & Tools]

### Docker

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

### API動作確認（curl）

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
```

---

## [Warp Workflows]

Warpの「Workflow」機能に登録すると便利なワンライナー集。

### 開発系

| 名前 | コマンド | 説明 |
|------|----------|------|
| `mabl-start` | `npm start` | サーバー起動 |
| `mabl-test` | `npm test` | 全テスト実行 |
| `mabl-test-watch` | `npm test -- --watch` | ウォッチモード |
| `mabl-docker-build` | `docker build -t mabl-order-api .` | Dockerビルド |
| `mabl-docker-run` | `docker run -p 3000:3000 mabl-order-api` | Docker起動 |

### API操作系

| 名前 | コマンド | 説明 |
|------|----------|------|
| `mabl-login` | `curl -s -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"username":"demo","password":"password"}'` | ログイン |
| `mabl-reset` | `curl -X POST http://localhost:3000/api/reset` | データリセット |
| `mabl-seed` | `curl -X POST http://localhost:3000/api/seed` | デモデータ作成 |

### 完全フロー（注文→支払い→発送）

```bash
# ワンライナーで全フロー実行
curl -X POST http://localhost:3000/api/reset && \
TOKEN=$(curl -s -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"username":"demo","password":"password"}' | jq -r '.token') && \
ORDER=$(curl -s -X POST http://localhost:3000/api/orders -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"item":"テスト商品"}') && \
ORDER_ID=$(echo $ORDER | jq -r '.order.id') && \
curl -X POST "http://localhost:3000/api/orders/$ORDER_ID/pay" -H "Authorization: Bearer $TOKEN" && \
curl -X POST "http://localhost:3000/api/orders/$ORDER_ID/ship" -H "Authorization: Bearer $TOKEN"
```

---

## [MCP Integration]

このプロジェクトで活用すべきMCPサーバー一覧。

### 必須

| MCPサーバー | 用途 |
|------------|------|
| **GitHub** | PR作成、Issue管理、CI/CDステータス確認 |
| **mabl** | E2Eテスト作成・実行・結果確認 |

### 推奨

| MCPサーバー | 用途 |
|------------|------|
| **Docker** | コンテナビルド・実行の自動化 |
| **GCP (gcloud)** | Cloud Runデプロイ状況確認 |

### mabl MCP活用例

```
# mablテスト一覧取得
get_mabl_tests query:"order"

# 最新テスト結果確認
get_latest_test_runs testId:"<test-id>"

# ローカルでmablテスト実行
run_mabl_test_local testId:"<test-id>" environmentId:"<env-id>"

# クラウドでmablテスト実行
run_mabl_test_cloud testId:"<test-id>" environmentId:"<env-id>" applicationId:"<app-id>" browsers:["chrome"]
```

---

## API仕様サマリー

| エンドポイント | メソッド | 認証 | 説明 |
|---------------|---------|------|------|
| `/login` | POST | 不要 | JWTトークン取得 |
| `/api/reset` | POST | 不要 | データ全削除 |
| `/api/seed` | POST | 不要 | デモデータ作成 |
| `/api/orders` | POST | 必要 | 注文作成 |
| `/api/orders/:id` | GET | 必要 | 注文取得 |
| `/api/orders/:id/pay` | POST | 必要 | 支払い処理 |
| `/api/orders/:id/ship` | POST | 必要 | 発送処理 |

### ステート遷移

```
created ──(pay)──▶ paid ──(ship)──▶ shipped
```
