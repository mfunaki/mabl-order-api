---
marp: true
theme: default
paginate: true
header: "フルスタックQAへの第一歩：Web UIとAPIテストを統合した品質保証戦略"
footer: "Copyright © 2026 mabl Inc."
style: |
  /* --- 共通の基本設定 --- */
  section {
    font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', sans-serif;
  }

  /* --- 表紙ページ専用 (title-layout) --- */
  section.title-layout {
    justify-content: center;
    text-align: center;
    background-image: url('../assets/common/bg_title.jpg');
    background-size: cover;
  }

  section.title-layout h1 {
    font-size: 46px;
    color: #312051;
    margin-bottom: 30px;
    border: none;
  }

  section.title-layout h3 {
    color: #6a1b9a;
    font-weight: normal;
    margin-top: 0;
  }

  section.title-layout p {
    color: #34495e;
    font-size: 24px;
    margin-top: 40px;
  }

  /* --- 本文ページ専用 (body-layout) --- */
  section.body-layout {
    padding-top: 150px;
    padding-left: 80px;
    padding-right: 80px;
    padding-bottom: 80px;
    justify-content: flex-start;
    background-image: url('../assets/common/bg_body.jpg');
    background-size: cover;
    font-size: 28px;
    line-height: 1.6;
    color: #34495e;
  }

  section.body-layout h1 {
    position: absolute;
    left: 55px;
    top: 80px;
    font-size: 42px;
    color: #312051;
    margin: 0;
    border: none;
  }

  section.body-layout strong {
    color: #6a1b9a;
  }

  section.body-layout pre {
    background: #f8f9fa;
    border: 1px solid #e1e4e8;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  section.body-layout code {
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    font-size: 0.85em;
    color: #d63384;
  }

  /* --- 本文ページ（コンパクト版） (body-compact) --- */
  section.body-compact {
    padding-top: 130px;
    padding-left: 80px;
    padding-right: 80px;
    padding-bottom: 60px;
    justify-content: flex-start;
    background-image: url('../assets/common/bg_body.jpg');
    background-size: cover;
    font-size: 22px;
    line-height: 1.4;
    color: #34495e;
  }

  section.body-compact h1 {
    position: absolute;
    left: 55px;
    top: 70px;
    font-size: 36px;
    color: #312051;
    margin: 0;
    border: none;
  }

  section.body-compact h2 {
    font-size: 26px;
    margin-top: 0;
    margin-bottom: 10px;
  }

  section.body-compact strong {
    color: #6a1b9a;
  }

  section.body-compact pre {
    background: #f8f9fa;
    border: 1px solid #e1e4e8;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    margin: 8px 0;
  }

  section.body-compact code {
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    font-size: 0.8em;
    color: #d63384;
  }

  section.body-compact ul, section.body-compact ol {
    margin: 8px 0;
    padding-left: 24px;
  }

  section.body-compact li {
    margin: 4px 0;
  }

  /* --- 最終ページ専用 (blank-layout) --- */
  section.blank-layout {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background-image: url('../assets/common/bg_blank.jpg');
    background-size: cover;
    padding-bottom: 100px;
  }

  section.blank-layout h1 {
    font-size: 65px;
    color: #312051;
    margin: 0;
    border: none;
    position: static;
  }

---
<!-- _class: title-layout -->
<!-- _paginate: false -->
# フルスタックQAへの第一歩
### Web UIとAPIテストを統合した
### 品質保証戦略

2026年2月12日（木）13:00〜14:00
舟木将彦（Sales Engineer, mabl）

---
<!-- class: body-layout -->
# 本日のアジェンダ

1. **UIテストだけでは足りない理由**
2. **APIテストの役割と価値**
3. **今回のデモ対象：注文管理API**
4. **APIテストによるデータセットアップ**
5. **UI + API を組み合わせたE2E検証**（デモ含む）
6. **テスト設計と保守コストの削減**
7. **mablでのAPI/UIテスト統合**（デモ含む）
8. **ベストプラクティス**

---

# UIテストだけでは足りない理由

## よくある課題

- **実行時間が長い**: UIを経由するとテストが遅くなる
- **データ準備が複雑**: テスト前提条件の設定が煩雑
- **壊れやすい**: UIの小さな変更でテストが失敗
- **カバレッジの限界**: エラーパスの網羅が困難

**結果**: メンテナンスコストが肥大化し、テストが負債に

---

# APIテストの役割と価値

## UIテストを補完する4つのメリット

| 観点 | UIテストのみ | UI + APIテスト |
|------|-------------|----------------|
| **速度** | 遅い（数分/テスト） | 高速（数秒/API呼び出し） |
| **安定性** | UI変更に敏感 | APIは比較的安定 |
| **データ準備** | UI操作で準備 | API直接呼び出し |
| **エラー検証** | 限定的 | 網羅的（400, 401, 404...） |

**ポイント**: APIでデータ準備・検証、UIで重要フローを確認

---

# 今回のデモ対象：注文管理API

## mabl-order-api

| 項目 | 内容 |
|------|------|
| **用途** | mablのAPIテスト機能デモ用 |
| **技術** | Node.js + Express + JWT認証 |
| **特徴** | ステート遷移とエラー条件を含む |

## ステート遷移
```
注文作成 → 支払い → 発送
(created)   (paid)   (shipped)
```

---
<!-- _class: body-compact -->
# APIエンドポイント一覧

## 認証・ユーティリティ（認証不要）

| エンドポイント | 用途 |
|--------------|------|
| `POST /login` | JWTトークン取得 |
| `POST /api/reset` | データ全削除 |
| `POST /api/seed` | デモデータ作成 |

## 注文管理（要認証）

| エンドポイント | 用途 | 成功条件 |
|--------------|------|---------|
| `POST /api/orders` | 注文作成 | - |
| `GET /api/orders/:id` | 注文取得 | - |
| `POST /api/orders/:id/pay` | 支払い | status = created |
| `POST /api/orders/:id/ship` | 発送 | status = paid |

---

# APIテストによるデータセットアップ

## UIテストの前提条件をAPIで準備

```
1. POST /api/reset     → データクリア
2. POST /login         → トークン取得
3. POST /api/orders    → 注文作成
4. POST /api/orders/1/pay → 支払い完了状態に
```

**メリット**:
- UI操作不要で高速
- 確実に目的の状態を作成
- テストの独立性を確保

---

# UI + API を組み合わせたE2E検証

## テストシナリオ例

| ステップ | 実行方法 | 目的 |
|---------|---------|------|
| 1. データ準備 | **API** | /reset, /seed |
| 2. ログイン | UI | 認証フロー確認 |
| 3. 注文確認 | **API** | GET /api/orders/1 |
| 4. 支払い | UI | 支払いボタンクリック |
| 5. 結果検証 | **API** | status = paid を確認 |
| 6. 発送 | UI | 発送処理 |
| 7. 最終検証 | **API** | status = shipped を確認 |

**ポイント**: UIは「ユーザー操作」、APIは「データ検証」

---
<!-- _class: body-compact -->
# エラーパスの網羅的テスト

## APIテストで検証すべきエラーケース

| エンドポイント | エラー条件 | ステータス |
|--------------|-----------|----------|
| `/login` | 認証失敗 | 401 |
| `/api/orders` | 認証なし | 401 |
| `/api/orders` | 無効なトークン | 401 |
| `/api/orders/:id` | 注文が存在しない | 404 |
| `/api/orders/:id/pay` | 既に支払い済み | 400 |
| `/api/orders/:id/ship` | 未払い状態 | 400 |

**UIでは困難なエラーパスもAPIなら容易にテスト可能**

---

# テスト設計と保守コストの削減

## テストピラミッドの考え方

```
        /\
       /  \  E2E (UI)    ← 少数・重要フロー
      /----\
     /      \ 統合       ← UI + API組み合わせ
    /--------\
   /          \ API      ← 多数・高速・安定
  /______________\
```

**戦略**:
- **API層**: エラーパス、境界値、認証を網羅
- **統合層**: UI操作 + API検証の組み合わせ
- **E2E層**: クリティカルパスのみ

---

# mablでのAPIテスト作成

## 方法1: mabl Trainer（GUI）

1. API Request ステップを追加
2. HTTPメソッド、URL、ヘッダー、ボディを設定
3. レスポンスの検証を追加

## 方法2: MCP + Claude（CLI/IDE）

```bash
# プロンプトでテスト計画
mcp__mabl__plan_new_test

# テスト作成
mcp__mabl__create_mabl_test

# ローカル実行
mcp__mabl__run_mabl_test_local
```

---
<!-- _class: body-compact -->
# APIテストの検証ポイント

## レスポンス検証の例

```json
// POST /api/orders のレスポンス
{
  "order": {
    "id": "1",
    "item": "テスト商品",
    "status": "created",
    "createdAt": "2026-02-12T00:00:00.000Z"
  }
}
```

## アサーション

- **ステータスコード**: 200, 400, 401, 404
- **プロパティ存在**: `order`, `token`, `message`
- **値の検証**: `status === "paid"`
- **型チェック**: `id` が文字列であること

---

# UI + APIテストの統合実行

## mablでのワークフロー

```
┌─────────────────────────────────────────┐
│ テスト開始                               │
├─────────────────────────────────────────┤
│ [API] POST /api/reset    → データ初期化  │
│ [API] POST /login        → トークン取得  │
│ [API] POST /api/orders   → 注文作成      │
├─────────────────────────────────────────┤
│ [UI]  注文管理画面を開く                 │
│ [UI]  支払いボタンをクリック             │
├─────────────────────────────────────────┤
│ [API] GET /api/orders/1  → status確認   │
│       Assert: status === "paid"         │
└─────────────────────────────────────────┘
```

---

# ベストプラクティス

## UI + API統合テストのポイント

1. **データ準備はAPIで**: UI操作より高速・確実
2. **検証もAPIで**: レスポンスを直接確認
3. **UIは重要フローに集中**: ユーザー体験の検証
4. **エラーパスはAPIで網羅**: 401, 404 などを効率的にテスト
5. **トークン管理**: 変数に保存して再利用

## アンチパターン

- UIだけで全てをテストしようとする
- データ準備にUI操作を使う
- エラーケースをスキップする

---

# テスト戦略の使い分け

## mabl APIテスト vs 単体テスト

| 観点 | mabl APIテスト | 単体テスト（Jest等） |
|------|---------------|---------------------|
| **対象** | 本番環境/ステージング | ローカル |
| **速度** | 秒単位 | ミリ秒単位 |
| **カバレッジ** | E2E/統合 | ユニット |
| **用途** | リグレッション | 開発中の検証 |

**両方を組み合わせる**:
- 開発中: Jest で高速フィードバック
- CI/CD: mabl で統合テスト

---

# まとめ

## 本日のポイント

- **UIテストだけでは不十分**: メンテナンスコストが肥大化
- **APIテストで補完**: データ準備・エラー検証を効率化
- **統合戦略**: UI は重要フロー、API は網羅性
- **mablの活用**: GUI/CLI/MCP で柔軟にテスト作成

**フルスタックQA = UI + API の統合テスト戦略**

---

# 参考リソース

## ドキュメント・サンプル

| リソース | URL |
|---------|-----|
| mabl ドキュメント | https://help.mabl.com/ |
| mabl CLI | https://help.mabl.com/docs/mabl-cli |
| mabl MCP Server | npmjs.com/@anthropics/mcp-server-mabl |
| 注文管理API（本日のデモ） | github.com/mfunaki/mabl-order-api |

**サポート**: support@mabl.com

---
<!-- _class: blank-layout -->
<!-- _paginate: false -->
# ご清聴ありがとうございました！
