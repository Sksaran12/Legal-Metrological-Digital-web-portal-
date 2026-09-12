import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { isValidHmacSignature } from '../backend/utils/signatures';

test('accepts an exact HMAC signature and rejects modified payloads', () => {
  const payload = JSON.stringify({ event: 'payment.captured', id: 'pay_test' });
  const secret = 'test-webhook-secret';
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  assert.equal(isValidHmacSignature(payload, signature, secret), true);
  assert.equal(isValidHmacSignature(`${payload}.tampered`, signature, secret), false);
});

test('rejects malformed signatures without throwing', () => {
  assert.equal(isValidHmacSignature('payload', 'not-a-signature', 'secret'), false);
});
