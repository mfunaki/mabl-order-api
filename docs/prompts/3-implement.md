# 実装プロンプト

## 目的

仕様書（spec.md）とテスト（server.test.js）に基づいて、サーバー実装（server.js）を作成または更新します。

## いつ使う

- テストが作成された後
- テストが失敗している状態から、テストをパスさせる実装を行う時

## 指示

spec.md と server.test.js を読み取り、すべてのテストをパスする実装を行ってください。

### 実装ルール

1. **シンプルに保つ**
   - 単一ファイル（server.js）にまとめる
   - 必要最小限のコードで実装

2. **レスポンス形式**
   - 成功時: `{ order }`, `{ token }`, `{ message }` などのラッパー形式
   - エラー時: `{ message: "エラーメッセージ" }`

3. **エラーハンドリング**
   - 適切なHTTPステータスコードを返す
   - 日本語のエラーメッセージを含める

4. **認証**
   - JWT を使用
   - `/api/orders` 以下のルートを保護

### 基本構造
```javascript
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
// ... 実装
module.exports = app;
```

## 出力ファイル

- `server.js`

## 実行方法

```
spec.md と server.test.js を読み取り、
docs/prompts/3-implement.md の指示に従って server.js を実装してください。
すべてのテストがパスすることを確認してください。
```
