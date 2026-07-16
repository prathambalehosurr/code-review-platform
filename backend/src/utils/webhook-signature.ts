import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verifies the `X-Hub-Signature-256` header sent by GitHub against the
 * raw request body using HMAC-SHA256.
 *
 * Uses `crypto.timingSafeEqual` to prevent timing-based side-channel attacks.
 * Never compares signature strings directly.
 *
 * @param rawBody  - The raw request body Buffer captured before JSON parsing.
 * @param secret   - The `GITHUB_WEBHOOK_SECRET` from environment.
 * @param signature - The full `X-Hub-Signature-256` header value.
 * @returns `true` when the signature is valid, `false` otherwise.
 */
export const verifyGitHubSignature = (
  rawBody: Buffer,
  secret: string,
  signature: string,
): boolean => {
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;

  // Both buffers must be the same length for timingSafeEqual to work.
  // Use equal-length encoding so a length mismatch doesn't short-circuit.
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
};
