const request = require('supertest');
const app = require('./server');

describe('mabl-order-api', () => {
  let token;

  beforeEach(async () => {
    // 各テスト前にデータをリセット
    await request(app).post('/api/reset');
  });

  describe('POST /login', () => {
    it('正しい認証情報でトークンを返す', async () => {
      const res = await request(app)
        .post('/login')
        .send({ username: 'demo', password: 'password' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('間違った認証情報で401を返す', async () => {
      const res = await request(app)
        .post('/login')
        .send({ username: 'demo', password: 'wrong' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/reset', () => {
    it('認証なしでデータをリセットできる', async () => {
      const res = await request(app).post('/api/reset');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ code: 200, message: 'Database reset' });
    });
  });

  describe('POST /api/seed', () => {
    it('認証なしで初期データを作成できる', async () => {
      const res = await request(app).post('/api/seed');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', '1');
      expect(res.body).toHaveProperty('status', 'created');
    });
  });

  describe('認証が必要なエンドポイント', () => {
    beforeEach(async () => {
      const loginRes = await request(app)
        .post('/login')
        .send({ username: 'demo', password: 'password' });
      token = loginRes.body.token;
    });

    describe('POST /api/orders', () => {
      it('認証なしで401を返す', async () => {
        const res = await request(app)
          .post('/api/orders')
          .send({ item: 'テスト商品' });

        expect(res.status).toBe(401);
      });

      it('新規注文を作成できる', async () => {
        const res = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('item', 'テスト商品');
        expect(res.body).toHaveProperty('status', 'created');
        expect(res.body).toHaveProperty('createdAt');
      });
    });

    describe('GET /api/orders/:id', () => {
      it('存在する注文を取得できる', async () => {
        // まず注文を作成
        const createRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        const orderId = createRes.body.id;

        const res = await request(app)
          .get(`/api/orders/${orderId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', orderId);
      });

      it('存在しない注文で404を返す', async () => {
        const res = await request(app)
          .get('/api/orders/nonexistent')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
      });
    });

    describe('POST /api/orders/:id/pay', () => {
      it('created状態の注文を支払い済みにできる', async () => {
        const createRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        const orderId = createRes.body.id;

        const res = await request(app)
          .post(`/api/orders/${orderId}/pay`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', 'paid');
      });

      it('既にpaid状態の注文で400を返す', async () => {
        const createRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        const orderId = createRes.body.id;

        // 1回目の支払い
        await request(app)
          .post(`/api/orders/${orderId}/pay`)
          .set('Authorization', `Bearer ${token}`);

        // 2回目の支払い（エラー）
        const res = await request(app)
          .post(`/api/orders/${orderId}/pay`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('支払いは完了しています');
      });

      it('shipped状態の注文で400を返す', async () => {
        const createRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        const orderId = createRes.body.id;

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
        expect(res.body.message).toContain('支払いは完了しています');
      });
    });

    describe('POST /api/orders/:id/ship', () => {
      it('paid状態の注文を発送済みにできる', async () => {
        const createRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        const orderId = createRes.body.id;

        // 支払い
        await request(app)
          .post(`/api/orders/${orderId}/pay`)
          .set('Authorization', `Bearer ${token}`);

        // 発送
        const res = await request(app)
          .post(`/api/orders/${orderId}/ship`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', 'shipped');
      });

      it('created状態（未払い）の注文で400を返す', async () => {
        const createRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ item: 'テスト商品' });

        const orderId = createRes.body.id;

        const res = await request(app)
          .post(`/api/orders/${orderId}/ship`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('支払いが完了していないため発送できません');
      });
    });
  });
});
