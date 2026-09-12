import crypto from 'crypto';

export function isValidHmacSignature(payload: string | Buffer, provided: string, secret: string) {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const providedBuffer = Buffer.from(provided, 'utf8');
  return providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}
