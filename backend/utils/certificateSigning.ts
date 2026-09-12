import crypto from 'crypto';
import { getAppConfig } from '../config/env';

export interface CertificateSignature {
  algorithm: 'Ed25519';
  keyId: string;
  signature: string;
  signedAt: Date;
}

export function canonicalizeCertificate(value: Record<string, unknown>): string {
  return JSON.stringify(
    Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = value[key];
        return result;
      }, {})
  );
}

export function signCertificate(value: Record<string, unknown>): CertificateSignature {
  const config = getAppConfig();
  if (!config.certificatePrivateKey) {
    if (config.isProduction) {
      throw new Error('CERTIFICATE_PRIVATE_KEY is required to issue certificates in production.');
    }
    throw new Error('CERTIFICATE_PRIVATE_KEY is required to issue certificates.');
  }

  const signature = crypto.sign(null, Buffer.from(canonicalizeCertificate(value)), config.certificatePrivateKey);
  return {
    algorithm: 'Ed25519',
    keyId: config.certificateKeyId,
    signature: signature.toString('base64'),
    signedAt: new Date()
  };
}
