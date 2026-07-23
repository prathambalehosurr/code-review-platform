import OpenAI from 'openai';

import { environment, logger } from '../../config';
import type { NormalizedPullRequest } from '../../types';
import { reviewResultSchema, type ReviewResult } from '../../validators';
import { buildReviewPrompt, getSystemInstruction } from './prompt-builder';

const MAX_REVIEW_RETRIES = 1;

let openaiClient: OpenAI | null = null;

/**
 * Returns a singleton instance of the OpenAI client configured for NVIDIA NIM.
 */
const getClient = (): OpenAI => {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: environment.NVIDIA_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }
  return openaiClient;
};

/**
 * Extracts JSON from the response text.
 * Handles both raw JSON and JSON wrapped in markdown code fences.
 */
const extractJson = (text: string): string => {
  // Try to extract from markdown code fences first
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch?.[0]) {
    return jsonMatch[0].trim();
  }

  return text.trim();
};

/**
 * Calls NVIDIA API with the review prompt and returns raw response text.
 */
const callNvidia = async (model: string, prompt: string): Promise<string> => {
  const client = getClient();

  logger.info('NVIDIA NIM request started', { model });

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: getSystemInstruction() },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    top_p: 0.7,
    max_tokens: 4096,
  });

  const text = completion.choices[0]?.message?.content;

  if (!text) {
    throw new Error('NVIDIA NIM returned an empty response');
  }

  logger.info('NVIDIA NIM response received', { responseLength: text.length });

  return text;
};

/**
 * Parses and validates the response text against the review schema.
 * Returns a validated ReviewResult or throws on validation failure.
 */
const parseAndValidate = (text: string): ReviewResult => {
  const jsonString = extractJson(text);
  const parsed: unknown = JSON.parse(jsonString);
  return reviewResultSchema.parse(parsed);
};

/**
 * Generates an AI code review for a NormalizedPullRequest.
 *
 * Flow:
 * 1. Builds a prompt from the PR data.
 * 2. Calls NVIDIA NIM via OpenAI SDK.
 * 3. Validates the structured JSON response.
 * 4. Retries once if JSON validation fails.
 * 5. Returns a validated ReviewResult.
 */
export const generateReview = async (pr: NormalizedPullRequest, aiSettingsModel?: string): Promise<ReviewResult> => {
  const prompt = buildReviewPrompt(pr);
  // Default to Llama-3.1-8B if not provided, or map if needed
  const modelToUse = aiSettingsModel || 'meta/llama-3.1-8b-instruct';

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_REVIEW_RETRIES; attempt++) {
    try {
      const responseText = await callNvidia(modelToUse, prompt);
      const result = parseAndValidate(responseText);

      logger.info('Validation passed');

      return result;
    } catch (error: unknown) {
      lastError = error;

      const message = error instanceof Error ? error.message : String(error);

      if (attempt < MAX_REVIEW_RETRIES) {
        logger.warn('Validation failed, retrying', {
          attempt: attempt + 1,
          error: message,
        });
      } else {
        logger.error('Validation failed after all retries', {
          attempts: attempt + 1,
          error: message,
        });
      }
    }
  }

  throw lastError;
};
