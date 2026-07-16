import { GoogleGenAI } from '@google/genai';

import { environment, logger } from '../../config';
import type { NormalizedPullRequest } from '../../types';
import { reviewResultSchema, type ReviewResult } from '../../validators';
import { buildReviewPrompt, getSystemInstruction } from './prompt-builder';

const MODEL_NAME = 'gemini-2.0-flash';
const MAX_REVIEW_RETRIES = 1;

let genAIClient: GoogleGenAI | null = null;

/**
 * Returns a singleton instance of the GoogleGenAI client.
 */
const getClient = (): GoogleGenAI => {
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: environment.GEMINI_API_KEY });
  }
  return genAIClient;
};

/**
 * Extracts JSON from the Gemini response text.
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
 * Calls Gemini with the review prompt and returns raw response text.
 */
const callGemini = async (prompt: string): Promise<string> => {
  const client = getClient();

  logger.info('Gemini request started');

  const response = await client.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(),
      temperature: 0.3,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  logger.info('Gemini response received', { responseLength: text.length });

  return text;
};

/**
 * Parses and validates Gemini's response text against the review schema.
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
 * 2. Calls Gemini.
 * 3. Validates the structured JSON response.
 * 4. Retries once if JSON validation fails.
 * 5. Returns a validated ReviewResult.
 */
export const generateReview = async (pr: NormalizedPullRequest): Promise<ReviewResult> => {
  const prompt = buildReviewPrompt(pr);

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_REVIEW_RETRIES; attempt++) {
    try {
      const responseText = await callGemini(prompt);
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
