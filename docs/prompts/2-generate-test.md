# テスト生成プロンプト

## 目的

仕様書（spec.md）に基づいて、テストファイル（server.test.js）を作成または更新します。
TDD（テスト駆動開発）のアプローチに従い、実装前にテストを作成します。

## いつ使う

- 新しいAPIを実装する前
- 既存APIの仕様を変更した後
- spec.md を更新した後

## 指示

spec.md を読み取り、以下の要件に従ってテストを作成してください：

### テストフレームワーク
- Jest + supertest を使用

### テスト構造
```javascript
const request = require('supertest');
const app = require('./server');

describe('API名', () => {
  // 各テスト前のセットアップ
  beforeEach(async () => {
    await request(app).post('/api/reset');
  });

  describe('エンドポイント', () => {
    it('正常系のテスト', async () => {
      // テストコード
    });

    it('異常系のテスト', async () => {
      // テストコード
    });
  });
});
```

### テスト項目
1. **正常系テスト**
   - 期待されるステータスコード
   - 期待されるレスポンス形式

2. **異常系テスト**
   - 認証エラー（401）
   - バリデーションエラー（400）
   - リソース未発見（404）

3. **ステート遷移テスト**
   - 有効な遷移
   - 無効な遷移

## 出力ファイル

- `server.test.js`

## 実行方法

```
spec.md を読み取り、docs/prompts/2-generate-test.md の指示に従って
server.test.js を作成または更新してください。
この時点でテストは失敗することを確認してください。
```
