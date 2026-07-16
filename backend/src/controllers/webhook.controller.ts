import type { Request, Response } from 'express';

import { environment, logger } from '../config';
import { ERROR_CODES, HTTP_STATUS } from '../constants';
import { processWebhookEvent } from '../services';
import { createErrorResponse, createSuccessResponse, verifyGitHubSignature } from '../utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getSignatureHeader = (request: Request): string | null => {
  const value = request.headers['x-hub-signature-256'];
  return typeof value === 'string' ? value : null;
};

const getEventTypeHeader = (request: Request): string | null => {
  const value = request.headers['x-github-event'];
  return typeof value === 'string' ? value : null;
};

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/webhooks/github
 *
 * 1. Verifies the GitHub HMAC-SHA256 signature.
 * 2. Determines the event type from the `X-GitHub-Event` header.
 * 3. Delegates normalisation to WebhookService.
 * 4. Returns the appropriate response.
 */
export const githubWebhookController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  // --- Signature verification -------------------------------------------
  const signature = getSignatureHeader(request);
  const eventType = getEventTypeHeader(request);

  if (!signature) {
    logger.warn('Webhook received without signature header', {
      requestId: request.requestId,
      event: eventType ?? 'unknown',
    });

    response
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(
        createErrorResponse(
          'Missing X-Hub-Signature-256 header',
          [],
          ERROR_CODES.AUTHENTICATION_ERROR,
        ),
      );
    return;
  }

  const rawBody = request.rawBody;

  if (!rawBody) {
    logger.warn('Webhook received without raw body', {
      requestId: request.requestId,
    });

    response
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(
        createErrorResponse(
          'Raw body unavailable for signature verification',
          [],
          ERROR_CODES.AUTHENTICATION_ERROR,
        ),
      );
    return;
  }

  const isValid = verifyGitHubSignature(rawBody, environment.GITHUB_WEBHOOK_SECRET, signature);

  if (!isValid) {
    logger.warn('Invalid webhook signature', {
      requestId: request.requestId,
      event: eventType ?? 'unknown',
    });

    response
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(createErrorResponse('Invalid webhook signature', [], ERROR_CODES.AUTHENTICATION_ERROR));
    return;
  }

  // --- Parse JSON body from raw buffer (express.json() cannot run after rawBodyMiddleware) ---
  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(rawBody.toString('utf8')) as unknown;
  } catch {
    logger.warn('Webhook received with invalid JSON body', {
      requestId: request.requestId,
      event: eventType ?? 'unknown',
    });

    response.status(HTTP_STATUS.ACCEPTED).json(createSuccessResponse('Event accepted'));
    return;
  }

  // --- Event dispatching -----------------------------------------------
  if (!eventType) {
    logger.warn('Webhook received without X-GitHub-Event header', {
      requestId: request.requestId,
    });

    response.status(HTTP_STATUS.ACCEPTED).json(createSuccessResponse('Event accepted'));
    return;
  }

  const normalized = await processWebhookEvent(eventType, parsedBody);

  // Ping event
  if (normalized?.event === 'ping') {
    response.status(HTTP_STATUS.OK).json(createSuccessResponse('GitHub webhook verified.'));
    return;
  }

  // Supported PR event
  if (normalized !== null) {
    response.status(HTTP_STATUS.ACCEPTED).json(createSuccessResponse('Event accepted', normalized));
    return;
  }

  // Unsupported event – silently accept
  response.status(HTTP_STATUS.ACCEPTED).json(createSuccessResponse('Event accepted'));
};
