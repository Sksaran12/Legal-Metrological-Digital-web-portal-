import crypto from 'crypto';

export function secureId(prefix: string): string {
  return `${prefix}-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
}

export function secureReference(prefix: string): string {
  return `${prefix}-${new Date().getUTCFullYear()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}
