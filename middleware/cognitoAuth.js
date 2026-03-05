'use strict';

const { CognitoJwtVerifier } = require('aws-jwt-verify');

let verifier = null;

function getVerifier() {
  if (!verifier) {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const clientId = process.env.COGNITO_CLIENT_ID;

    if (!userPoolId || !clientId) {
      throw new Error('COGNITO_USER_POOL_ID と COGNITO_CLIENT_ID の環境変数が必要です');
    }

    verifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: 'access',
      clientId,
    });
  }
  return verifier;
}

const cognitoAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await getVerifier().verify(token);
    req.user = { username: payload.username || payload.sub };
    next();
  } catch (err) {
    return res.status(401).json({ message: '無効なトークンです', detail: err.message });
  }
};

module.exports = cognitoAuth;
