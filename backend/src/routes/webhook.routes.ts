import { Router } from 'express';

import { githubWebhookController } from '../controllers/webhook.controller';
import { asyncHandler } from '../middleware';

export const webhookRouter = Router();

/**
 * express.json() is mounted globally in app.ts with a `verify` callback that
 * captures the raw request body into `request.rawBody` before JSON parsing.
 * This makes the raw bytes available for HMAC-SHA256 signature verification
 * without needing a separate rawBodyMiddleware that would compete with the
 * already-consumed body stream.
 */
webhookRouter.post('/github', asyncHandler(githubWebhookController));
