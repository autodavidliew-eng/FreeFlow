import { createHmac, timingSafeEqual } from 'crypto';

import { base64UrlDecode, base64UrlEncode } from './encoding';

export function signValue(value: string, secret: string): string {
  const payload = base64UrlEncode(value);
  const signature = base64UrlEncode(
    createHmac('sha256', secret).update(payload).digest()
  );
  return `${payload}.${signature}`;
}

export function verifyValue(signed: string, secret: string): string | null {
  const [payload, signature] = signed.split('.');
  if (!payload || !signature) {
    return null;
  }

  const expected = base64UrlEncode(
    createHmac('sha256', secret).update(payload).digest()
  );

  const signatureBuffer = base64UrlDecode(signature);
  const expectedBuffer = base64UrlDecode(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  return base64UrlDecode(payload).toString('utf-8');
}
