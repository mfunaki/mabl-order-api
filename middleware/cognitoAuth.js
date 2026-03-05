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
    return res.status(401).json({ message: '認証が必要です' });
  }

  const token = authHeader.split(' ')[1];
  const clientId = process.env.COGNITO_CLIENT_ID;

  jwt.verify(token, getKey, { algorithms: ['RS256'], audience: clientId }, (err, payload) => {
    if (err) {
      return res.status(401).json({ message: '無効なトークンです', detail: err.message });
    }
    req.user = { username: payload['cognito:username'] || payload.sub };
    next();
  });
};

module.exports = cognitoAuth;
