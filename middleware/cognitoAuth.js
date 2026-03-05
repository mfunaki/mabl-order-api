'use strict';

const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');

let client = null;

function getJwksClient() {
  if (!client) {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const region = process.env.AWS_REGION;

    if (!userPoolId || !region) {
      throw new Error('COGNITO_USER_POOL_ID と AWS_REGION の環境変数が必要です');
    }

    client = jwksClient({
      jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
    });
  }
  return client;
}

function getKey(header, callback) {
  getJwksClient().getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

const cognitoAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[cognitoAuth] Authorization ヘッダーがありません');
    return res.status(401).json({ message: '認証が必要です' });
  }

  const token = authHeader.split(' ')[1];
  const clientId = process.env.COGNITO_CLIENT_ID;
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const region = process.env.AWS_REGION;

  if (!clientId || !userPoolId || !region) {
    console.error(`[cognitoAuth] 環境変数不足: COGNITO_CLIENT_ID=${clientId ? '設定済み' : '未設定'}, COGNITO_USER_POOL_ID=${userPoolId ? '設定済み' : '未設定'}, AWS_REGION=${region || '未設定'}`);
    return res.status(500).json({ message: 'サーバー設定エラー: Cognito 環境変数が不足しています' });
  }

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, payload) => {
    if (err) {
      console.error(`[cognitoAuth] トークン検証失敗: ${err.name} - ${err.message}`);
      return res.status(401).json({ message: '無効なトークンです', detail: err.message });
    }
    if (payload.client_id !== clientId) {
      console.error(`[cognitoAuth] client_id 不一致: expected=${clientId}, actual=${payload.client_id}`);
      return res.status(401).json({ message: '無効なトークンです', detail: 'client_id mismatch' });
    }
    req.user = { username: payload['cognito:username'] || payload.sub };
    next();
  });
};

module.exports = cognitoAuth;
