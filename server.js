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
  return res.status(200).json({ message: 'Database reset' });
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
  res.json({ order });
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
  res.json({ order });
});

// GET /api/orders/:id - 注文取得
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: '注文が見つかりません' });
  }
  res.json({ order });
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
  res.json({ order });
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
  res.json({ order });
});

// GET /api/orders - 全注文一覧取得（認証済み）
app.get('/api/orders', (req, res) => {
  res.json({ orders });
});

// GET / - ルートパス（ログイン画面と注文一覧）
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>mabl Order API - デモアプリ</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
    h2 {
      color: #555;
      margin-bottom: 16px;
      font-size: 18px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      color: #666;
      font-weight: 500;
    }
    input[type="text"],
    input[type="password"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    button[type="submit"],
    .btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    button[type="submit"]:hover,
    .btn:hover {
      background: #0056b3;
    }
    .btn-logout {
      background: #6c757d;
      margin-left: 10px;
    }
    .btn-logout:hover {
      background: #5a6268;
    }
    .hidden {
      display: none;
    }
    .error {
      color: #dc3545;
      margin-top: 8px;
      font-size: 14px;
    }
    .success {
      color: #28a745;
      margin-top: 8px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
    }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-created {
      background: #ffeaa7;
      color: #d63031;
    }
    .status-paid {
      background: #74b9ff;
      color: #0984e3;
    }
    .status-shipped {
      background: #55efc4;
      color: #00b894;
    }
    .empty-message {
      text-align: center;
      color: #999;
      padding: 40px 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>mabl Order API - デモアプリ</h1>

    <!-- ログインフォーム -->
    <div id="login-section" class="card">
      <h2>ログイン</h2>
      <form id="login-form">
        <div class="form-group">
          <label for="username">ユーザー名</label>
          <input type="text" id="username" name="username" required>
        </div>
        <div class="form-group">
          <label for="password">パスワード</label>
          <input type="password" id="password" name="password" required>
        </div>
        <button type="submit">ログイン</button>
        <div id="login-error" class="error hidden"></div>
      </form>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
        <p>デモ用認証情報:</p>
        <p>ユーザー名: <strong>demo</strong></p>
        <p>パスワード: <strong>password</strong></p>
      </div>
    </div>

    <!-- 注文一覧（ログイン後表示） -->
    <div id="orders-section" class="hidden">
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="margin-bottom: 0;">注文一覧</h2>
          <div>
            <button class="btn" onclick="loadOrders()">更新</button>
            <button class="btn btn-logout" onclick="logout()">ログアウト</button>
          </div>
        </div>
        <div id="orders-list"></div>
      </div>
    </div>
  </div>

  <script>
    let token = localStorage.getItem('token');

    // ページ読み込み時の処理
    window.addEventListener('DOMContentLoaded', () => {
      if (token) {
        showOrdersSection();
        loadOrders();
      } else {
        showLoginSection();
      }
    });

    // ログインフォーム送信
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('login-error');

      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
          token = data.token;
          localStorage.setItem('token', token);
          errorDiv.classList.add('hidden');
          showOrdersSection();
          loadOrders();
        } else {
          errorDiv.textContent = data.message || 'ログインに失敗しました';
          errorDiv.classList.remove('hidden');
        }
      } catch (error) {
        errorDiv.textContent = 'ネットワークエラーが発生しました';
        errorDiv.classList.remove('hidden');
      }
    });

    // 注文一覧を読み込む
    async function loadOrders() {
      const ordersListDiv = document.getElementById('orders-list');

      try {
        const response = await fetch('/api/orders', {
          method: 'GET',
          headers: {
            'Authorization': \`Bearer \${token}\`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // 認証エラー: ログアウト処理
            logout();
            return;
          }
          throw new Error('注文一覧の取得に失敗しました');
        }

        const data = await response.json();
        displayOrders(data.orders);
      } catch (error) {
        ordersListDiv.innerHTML = \`<div class="error">\${error.message}</div>\`;
      }
    }

    // 注文一覧を表示
    function displayOrders(orders) {
      const ordersListDiv = document.getElementById('orders-list');

      if (!orders || orders.length === 0) {
        ordersListDiv.innerHTML = '<div class="empty-message">注文がありません</div>';
        return;
      }

      const table = document.createElement('table');
      table.innerHTML = \`
        <thead>
          <tr>
            <th>注文ID</th>
            <th>商品名</th>
            <th>ステータス</th>
            <th>作成日時</th>
          </tr>
        </thead>
        <tbody>
          \${orders.map(order => \`
            <tr data-order-id="\${order.id}">
              <td>\${order.id}</td>
              <td>\${order.item}</td>
              <td><span class="status status-\${order.status}">\${getStatusText(order.status)}</span></td>
              <td>\${formatDate(order.createdAt)}</td>
            </tr>
          \`).join('')}
        </tbody>
      \`;
      ordersListDiv.innerHTML = '';
      ordersListDiv.appendChild(table);
    }

    // ステータスの日本語表記
    function getStatusText(status) {
      const statusMap = {
        'created': '作成済み',
        'paid': '支払済み',
        'shipped': '発送済み'
      };
      return statusMap[status] || status;
    }

    // 日時のフォーマット
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('ja-JP');
    }

    // ログアウト
    function logout() {
      token = null;
      localStorage.removeItem('token');
      showLoginSection();
      document.getElementById('login-form').reset();
    }

    // ログインセクションを表示
    function showLoginSection() {
      document.getElementById('login-section').classList.remove('hidden');
      document.getElementById('orders-section').classList.add('hidden');
    }

    // 注文一覧セクションを表示
    function showOrdersSection() {
      document.getElementById('login-section').classList.add('hidden');
      document.getElementById('orders-section').classList.remove('hidden');
    }
  </script>
</body>
</html>
  `;
  res.send(html);
});

// サーバー起動（テスト時は起動しない）
if (require.main === module) {
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
