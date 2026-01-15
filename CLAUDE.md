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