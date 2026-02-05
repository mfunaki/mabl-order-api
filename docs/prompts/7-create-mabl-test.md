# mablテスト作成プロンプト

## 目的

mabl で API テストを作成します。

## いつ使う

- 新しい API テストを mabl で作成したい時
- API の正常系・異常系テストを追加したい時
- CI/CD パイプラインにテストを組み込みたい時

## 前提条件

- mabl アプリケーションと環境が設定済みであること
- テスト対象の API サーバーが起動していること（http://localhost:3000 または デプロイ先URL）

## テストケース一覧

openapi.yaml に基づく網羅的なテストケースです。

### 1. 認証テスト（POST /login）

| テスト名 | 条件 | 期待結果 |
|---------|------|---------|
| ログイン成功 | username: demo, password: password | 200, token を取得 |
| ログイン失敗 | username: demo, password: wrong | 401, エラーメッセージ |

### 2. データ管理テスト（認証不要）

| テスト名 | エンドポイント | 期待結果 |
|---------|--------------|---------|
| データリセット | POST /api/reset | 200, message: "Database reset" |
| 初期データ作成 | POST /api/seed | 200, order オブジェクト返却 |

### 3. 注文作成テスト（POST /api/orders）

| テスト名 | 条件 | 期待結果 |
|---------|------|---------|
| 注文作成成功 | 有効なトークン, item: "テスト商品" | 200, status: created |
| 認証ヘッダーなし | Authorization ヘッダーなし | 401, message: "認証が必要です" |
| 無効なトークン | Authorization: Bearer invalid | 401, message: "無効なトークンです" |

### 4. 注文取得テスト（GET /api/orders/{id}）

| テスト名 | 条件 | 期待結果 |
|---------|------|---------|
| 注文取得成功 | 有効なトークン, 存在するID | 200, order オブジェクト |
| 注文が見つからない | 有効なトークン, 存在しないID | 404, message: "注文が見つかりません" |
| 認証エラー | Authorization ヘッダーなし | 401, message: "認証が必要です" |

### 5. 支払いテスト（POST /api/orders/{id}/pay）

| テスト名 | 条件 | 期待結果 |
|---------|------|---------|
| 支払い成功 | status: created の注文 | 200, status: paid |
| 既に支払い済み | status: paid の注文 | 400, message: "支払いは完了しています" |
| 発送済みに支払い | status: shipped の注文 | 400, message: "支払いは完了しています" |
| 注文が見つからない | 存在しないID | 404, message: "注文が見つかりません" |
| 認証エラー | Authorization ヘッダーなし | 401, message: "認証が必要です" |

### 6. 発送テスト（POST /api/orders/{id}/ship）

| テスト名 | 条件 | 期待結果 |
|---------|------|---------|
| 発送成功 | status: paid の注文 | 200, status: shipped |
| 未払いで発送 | status: created の注文 | 400, message: "支払いが完了していないため発送できません" |
| 注文が見つからない | 存在しないID | 404, message: "注文が見つかりません" |
| 認証エラー | Authorization ヘッダーなし | 401, message: "認証が必要です" |

### 7. E2E フローテスト

| テスト名 | フロー | 期待結果 |
|---------|-------|---------|
| 正常フロー | login → reset → 注文作成 → 支払い → 発送 | 各ステップで正しいステータス |
| 異常フロー | login → reset → 注文作成 → 発送（支払いスキップ） | 400 エラー |

## mablテスト作成手順

### ステップ1: セットアップ
1. ログインしてJWTトークンを取得
2. トークンを変数に保存（以降のAPIで使用）

### ステップ2: 成功パターンテスト
1. データリセット（POST /api/reset）
2. 注文作成（POST /api/orders, item: "成功テスト商品"）
3. 注文ID を変数に保存
4. 支払い処理（POST /api/orders/{id}/pay）
5. ステータスが paid になったことを確認
6. 発送処理（POST /api/orders/{id}/ship）
7. ステータスが shipped になったことを確認

### ステップ3: 失敗パターンテスト
1. データリセット（POST /api/reset）
2. 注文作成（POST /api/orders, item: "失敗テスト商品"）
3. 注文ID を変数に保存
4. 支払いをスキップして発送（POST /api/orders/{id}/ship）
5. 400 エラーとエラーメッセージを確認

### ステップ4: 認証エラーテスト
1. Authorization ヘッダーなしで POST /api/orders を呼び出す
2. 401 エラーとエラーメッセージを確認

### ステップ5: 404 エラーテスト
1. 存在しない注文ID で GET /api/orders/nonexistent を呼び出す
2. 404 エラーとエラーメッセージを確認

## アサーション

各テストで以下を確認：

- **ステータスコード**: 200, 400, 401, 404
- **レスポンスボディ**:
  - 成功時: `order` または `message` または `token` プロパティの存在
  - エラー時: `message` プロパティに適切なエラーメッセージ
- **ステート遷移**: `created` → `paid` → `shipped`

## 実行方法

mabl MCP サーバー経由で、このプロンプトの内容に従ってテストを作成してください。

```
docs/prompts/7-create-mabl-test.md の指示に従って、mabl APIテストを作成してください。
```
