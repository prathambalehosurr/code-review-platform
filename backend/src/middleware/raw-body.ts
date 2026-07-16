import type { RequestHandler } from 'express';

/**
 * Captures the raw request body as a Buffer on `request.rawBody`.
 *
 * Must be mounted BEFORE `express.json()` on webhook routes only.
 * The raw bytes are required to compute the HMAC-SHA256 signature that
 * GitHub sends in `X-Hub-Signature-256`. Using the parsed JSON body
 * would produce a different digest and always fail verification.
 */
export const rawBodyMiddleware: RequestHandler = (request, _response, next) => {
  const chunks: Buffer[] = [];

  request.on('data', (chunk: Buffer) => {
    chunks.push(chunk);
  });

  request.on('end', () => {
    request.rawBody = Buffer.concat(chunks);
    next();
  });

  request.on('error', next);
};
