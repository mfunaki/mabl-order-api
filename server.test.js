const request = require('supertest');
const app = require('./server');

describe('mabl-order-api', () => {
  let token;

  beforeEach(async () => {
    // 各テスト前にデータをリセット
    await request(app).post('/api/reset');
  });

  // =========================================
  // 認証エンドポイント
  // =========================================
  describe('POST /login', () => {
    it('正しい認証情報でトークンを返す', async () => {
      const res = await request(app)
        .post('/login')
        .send({ username: 'demo', password: 'password' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
    });

    it('間違った認証情報で401を返す', async () => {
      const res = await request(app)
        .post('/login')
        .send({ username: 'demo', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', '認証に失敗しました');
    });

    it('存在しないユーザーで401を返す', async () => {
      const res = await request(app)
        .post('/login')
        .send({ username: 'unknown', password: 'password' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', '認証に失敗しました');
    });
  });

  // =========================================
  // ユーティリティエンドポイント（認証不要）
  // =========================================
  describe('POST /api/reset', () => {
    it('認証なしでデータをリセットできる', async () => {
      const res = await request(app).post('/api/reset');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Database reset');
    });

    it('リセット後は注文データが空になる', async () => {
      // まずログインしてトークンを取得
      const loginRes = await request(app)
        .post('/login')
        .send({ username: 'demo', password: 'password' });
      const authToken = loginRes.body.token;

      // seedで初期データを作成
      await request(app).post('/api/seed');

      // リセット
      await request(app).post('/api/reset');

      // リセット後は注文が見つからない
      const res = await request(app)
        .get('/api/orders/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/seed', () => {
    it('認証なしで初期データを作成できる', async () => {
      const res = await request(app).post('/api/seed');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('order');
      expect(res.body.order).toHaveProperty('id', '1');
      expect(res.body.order).toHaveProperty('item', 'Sample Item');
      expect(res.body.order).toHaveProperty('status', 'created');
      expect(res.body.order).toHaveProperty('createdAt');
    });

    it('seed後に作成された注文を取得できる', async () => {
      // seedで初期データを作成
      await request(app).post('/api/seed');

      // ログインしてトークンを取得
      const loginRes = await request(app)
        .post('/login')
        .send({ username: 'demo', password: 'password' });
      const authToken = loginRes.body.token;

      // 注文を取得
      const res = await request(app)
        .get('/api/orders/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.order).toHaveProperty('id', '1');
    });
  });

  // =========================================
  // 認証が必要なエンドポイント
  // =========================================
  describe('認証が必要なエンドポイント', () => {
    beforeEach(async () => {
      const loginRes = await request(app)
        .post('/login')
        .send({ username: 'demo', password: 'password' });
      token = loginRes.body.token;
    });

    // -----------------------------------------
    // POST /api/orders - 注文作成
    // -----------------------------------------
    describe('POST /api/orders', () => {
      it('認証なしで401を返す', async () => {
        const res = await request(app)
          .post('/api/orders')
          .send({ item: 'テスト商品' });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', '認証が必要です');
      });

      it('無効なトークンで401を返す', async () => {
        const res = await request(app)
          .post('/api/orders')
          .set('Authorization', 'Bearer invalid_token')
          .send({ item: 'テスト商品' });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', '無効なトークンです');
      });

      it('新規注文を作成できる', async () => {
        const res = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('order');
        expect(res.body.order).toHaveProperty('id');
        expect(res.body.order).toHaveProperty('item', 'テスト商品');
        expect(res.body.order).toHaveProperty('status', 'created');
        expect(res.body.order).toHaveProperty('createdAt');
      });

      it('複数の注文を作成すると異なるIDが割り当てられる', async () => {
        const res1 = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: '商品1' });

        const res2 = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: '商品2' });

        expect(res1.body.order.id).not.toBe(res2.body.order.id);
      });
    });

    // -----------------------------------------
    // GET /api/orders/:id - 注文取得
    // -----------------------------------------
    describe('GET /api/orders/:id', () => {
      it('認証なしで401を返す', async () => {
        await request(app).post('/api/seed');

        const res = await request(app)
          .get('/api/orders/1');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', '認証が必要です');
      });

      it('無効なトークンで401を返す', async () => {
        await request(app).post('/api/seed');

        const res = await request(app)
          .get('/api/orders/1')
          .set('Authorization', 'Bearer invalid_token');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', '無効なトークンです');
      });

      it('存在する注文を取得できる', async () => {
        // まず注文を作成
        const createRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        const orderId = createRes.body.order.id;

        const res = await request(app)
          .get(`/api/orders/${orderId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('order');
        expect(res.body.order).toHaveProperty('id', orderId);
        expect(res.body.order).toHaveProperty('item', 'テスト商品');
        expect(res.body.order).toHaveProperty('status', 'created');
        expect(res.body.order).toHaveProperty('createdAt');
      });

      it('存在しない注文で404を返す', async () => {
        const res = await request(app)
          .get('/api/orders/nonexistent')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', '注文が見つかりません');
      });
    });

    // -----------------------------------------
    // POST /api/orders/:id/pay - 支払い
    // -----------------------------------------
    describe('POST /api/orders/:id/pay', () => {
      it('認証なしで401を返す', async () => {
        await request(app).post('/api/seed');

        const res = await request(app)
          .post('/api/orders/1/pay');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', '認証が必要です');
      });

      it('無効なトークンで401を返す', async () => {
        await request(app).post('/api/seed');

        const res = await request(app)
          .post('/api/orders/1/pay')
          .set('Authorization', 'Bearer invalid_token');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', '無効なトークンです');
      });

      it('存在しない注文で404を返す', async () => {
        const res = await request(app)
          .post('/api/orders/nonexistent/pay')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', '注文が見つかりません');
      });

      it('created状態の注文を支払い済みにできる', async () => {
        const createRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        const orderId = createRes.body.order.id;

        const res = await request(app)
          .post(`/api/orders/${orderId}/pay`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('order');
        expect(res.body.order).toHaveProperty('status', 'paid');
      });

      it('既にpaid状態の注文で400を返す', async () => {
        const createRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        const orderId = createRes.body.order.id;

        // 1回目の支払い
        await request(app)
          .post(`/api/orders/${orderId}/pay`)
          .set('Authorization', `Bearer ${token}`);

        // 2回目の支払い（エラー）
        const res = await request(app)
          .post(`/api/orders/${orderId}/pay`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', '支払いは完了しています');
      });

      it('shipped状態の注文で400を返す', async () => {
        const createRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        const orderId = createRes.body.order.id;

        // 支払い
        await request(app)
          .post(`/api/orders/${orderId}/pay`)
          .set('Authorization', `Bearer ${token}`);

        // 発送
        await request(app)
          .post(`/api/orders/${orderId}/ship`)
          .set('Authorization', `Bearer ${token}`);

        // shipped後に支払い（エラー）
        const res = await request(app)
          .post(`/api/orders/${orderId}/pay`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', '支払いは完了しています');
      });
    });

    // -----------------------------------------
    // POST /api/orders/:id/ship - 発送
    // -----------------------------------------
    describe('POST /api/orders/:id/ship', () => {
      it('認証なしで401を返す', async () => {
        await request(app).post('/api/seed');

        const res = await request(app)
          .post('/api/orders/1/ship');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', '認証が必要です');
      });

      it('無効なトークンで401を返す', async () => {
        await request(app).post('/api/seed');

        const res = await request(app)
          .post('/api/orders/1/ship')
          .set('Authorization', 'Bearer invalid_token');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', '無効なトークンです');
      });

      it('存在しない注文で404を返す', async () => {
        const res = await request(app)
          .post('/api/orders/nonexistent/ship')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', '注文が見つかりません');
      });

      it('paid状態の注文を発送済みにできる', async () => {
        const createRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        const orderId = createRes.body.order.id;

        // 支払い
        await request(app)
          .post(`/api/orders/${orderId}/pay`)
          .set('Authorization', `Bearer ${token}`);

        // 発送
        const res = await request(app)
          .post(`/api/orders/${orderId}/ship`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('order');
        expect(res.body.order).toHaveProperty('status', 'shipped');
      });

      it('created状態（未払い）の注文で400を返す', async () => {
        const createRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        const orderId = createRes.body.order.id;

        const res = await request(app)
          .post(`/api/orders/${orderId}/ship`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', '支払いが完了していないため発送できません');
      });

      it('既にshipped状態の注文を再度shipするとステータスは変わらない', async () => {
        const createRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        const orderId = createRes.body.order.id;

        // 支払い
        await request(app)
          .post(`/api/orders/${orderId}/pay`)
          .set('Authorization', `Bearer ${token}`);

        // 1回目の発送
        await request(app)
          .post(`/api/orders/${orderId}/ship`)
          .set('Authorization', `Bearer ${token}`);

        // 2回目の発送
        const res = await request(app)
          .post(`/api/orders/${orderId}/ship`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.order).toHaveProperty('status', 'shipped');
      });
    });
  });

  // =========================================
  // ステート遷移テスト（エンドツーエンド）
  // =========================================
  describe('ステート遷移（E2E）', () => {
    beforeEach(async () => {
      const loginRes = await request(app)
        .post('/login')
        .send({ username: 'demo', password: 'password' });
      token = loginRes.body.token;
    });

    it('created -> paid -> shipped の正常フロー', async () => {
      // 注文作成
      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ item: 'E2Eテスト商品' });

      expect(createRes.body.order.status).toBe('created');
      const orderId = createRes.body.order.id;

      // 支払い
      const payRes = await request(app)
        .post(`/api/orders/${orderId}/pay`)
        .set('Authorization', `Bearer ${token}`);

      expect(payRes.body.order.status).toBe('paid');

      // 発送
      const shipRes = await request(app)
        .post(`/api/orders/${orderId}/ship`)
        .set('Authorization', `Bearer ${token}`);

      expect(shipRes.body.order.status).toBe('shipped');

      // 最終確認
      const getRes = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.body.order.status).toBe('shipped');
    });

    it('created状態からshipはできない', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ item: 'テスト商品' });

      const orderId = createRes.body.order.id;

      const res = await request(app)
        .post(`/api/orders/${orderId}/ship`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });

    it('paid状態からpayはできない', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ item: 'テスト商品' });

      const orderId = createRes.body.order.id;

      await request(app)
        .post(`/api/orders/${orderId}/pay`)
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .post(`/api/orders/${orderId}/pay`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });
});
