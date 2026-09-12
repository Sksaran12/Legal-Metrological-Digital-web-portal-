import crypto from 'crypto';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

export function getAppConfig() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  const mongoUri = required('MONGODB_URI');
  const jwtSecret = required('JWT_SECRET');

  if (isProduction && jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters in production.');
  }

  return {
    nodeEnv,
    isProduction,
    mongoUri,
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || (isProduction ? '15m' : '7d'),
    publicAppUrl: required('PUBLIC_APP_URL'),
    mapTileUrl: process.env.MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    geocoderUrl: process.env.GEOCODER_URL || 'https://nominatim.openstreetmap.org',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID?.trim(),
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET?.trim(),
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET?.trim(),
    allowDemoPayments: !isProduction && process.env.ALLOW_DEMO_PAYMENTS === 'true',
    certificatePrivateKey: process.env.CERTIFICATE_PRIVATE_KEY
      ? Buffer.from(process.env.CERTIFICATE_PRIVATE_KEY, 'base64').toString('utf8')
      : undefined,
    certificateKeyId: process.env.CERTIFICATE_KEY_ID || 'primary'
  };
}

export function createCertificateKeyPair() {
  return crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
}
