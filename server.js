const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET_KEY = 'secret_key_demo';

// メモリ上のデータストア
let orders = [];
let nextId = 1;

// ミドルウェア
app.use(cors());
app.use(express.json());

// 認証ミドルウェア
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: '無効なトークンです' });
  }
};

// POST /login - ログイン
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'demo' && password === 'password') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
  }

  return res.status(401).json({ message: '認証に失敗しました' });
});

// POST /api/reset - データリセット（認証不要）
app.post('/api/reset', (req, res) => {
  orders = [];
  nextId = 1;
  res.json({ status: 200, message: 'Database reset' });
});

// POST /api/seed - 初期データ作成（認証不要）
app.post('/api/seed', (req, res) => {
  orders = [];
  nextId = 2;
  const order = {
    id: '1',
    item: 'Sample Item',
    status: 'created',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  res.json(order);
});

// 認証が必要なルート
app.use('/api/orders', authMiddleware);

// POST /api/orders - 注文作成
app.post('/api/orders', (req, res) => {
  const { item } = req.body;
  const order = {
    id: String(nextId++),
    item,
    status: 'created',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  res.json(order);
});

// GET /api/orders/:id - 注文取得
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: '注文が見つかりません' });
  }
  res.json(order);
});

// POST /api/orders/:id/pay - 支払い
app.post('/api/orders/:id/pay', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: '注文が見つかりません' });
  }

  if (order.status !== 'created') {
    return res.status(400).json({ message: '支払いは完了しています' });
  }

  order.status = 'paid';
  res.json(order);
});

// POST /api/orders/:id/ship - 発送
app.post('/api/orders/:id/ship', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: '注文が見つかりません' });
  }

  if (order.status === 'created') {
    return res.status(400).json({ message: '支払いが完了していないため発送できません' });
  }

  order.status = 'shipped';
  res.json(order);
});

// サーバー起動（テスト時は起動しない）
if (require.main === module) {
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
