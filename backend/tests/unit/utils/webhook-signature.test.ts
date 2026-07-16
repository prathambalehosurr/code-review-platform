import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { verifyGitHubSignature } from '../../../src/utils/webhook-signature';

describe('Webhook Signature Verification', () => {
  const secret = 'my-super-secret-key';
  const rawBodyString = JSON.stringify({ action: 'opened', pull_request: { number: 42 } });
  const rawBody = Buffer.from(rawBodyString);

  const generateValidSignature = (body: Buffer, sec: string): string => {
    return `sha256=${createHmac('sha256', sec).update(body).digest('hex')}`;
  };

  it('should return true for a valid signature', () => {
    const signature = generateValidSignature(rawBody, secret);
    expect(verifyGitHubSignature(rawBody, secret, signature)).toBe(true);
  });

  it('should return false for an invalid signature', () => {
    const invalidSignature =
      'sha256=abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    expect(verifyGitHubSignature(rawBody, secret, invalidSignature)).toBe(false);
  });

  it('should return false if the payload was modified', () => {
    const signature = generateValidSignature(rawBody, secret);
    const modifiedBody = Buffer.from(
      JSON.stringify({ action: 'closed', pull_request: { number: 42 } }),
    );
    expect(verifyGitHubSignature(modifiedBody, secret, signature)).toBe(false);
  });

  it('should return false if the secret does not match', () => {
    const signature = generateValidSignature(rawBody, 'wrong-secret');
    expect(verifyGitHubSignature(rawBody, secret, signature)).toBe(false);
  });

  it('should return false if signature length is completely different', () => {
    const signature = 'sha256=short';
    expect(verifyGitHubSignature(rawBody, secret, signature)).toBe(false);
  });

  it('should return false for an empty signature', () => {
    expect(verifyGitHubSignature(rawBody, secret, '')).toBe(false);
  });
});
