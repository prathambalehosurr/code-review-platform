import type { NormalizedPullRequest } from '../../types';

const MAX_PATCH_LENGTH = 3000;

const SYSTEM_INSTRUCTION = `You are a senior software engineer performing a professional pull request code review.

Your review must cover:
- Correctness and potential bugs
- Security vulnerabilities
- Performance issues
- Maintainability and readability
- Best practices and design patterns

Rules:
- Focus on meaningful, actionable issues. Do NOT flag formatting-only concerns.
- Ignore generated files, lock files, and build artifacts.
- Return ONLY valid JSON matching the exact schema below. No markdown, no prose, no code fences.
- If there are no issues, return an empty findings array with a positive summary.

JSON Schema:
{
  "summary": "string - brief overall assessment of the PR",
  "overallScore": "number 0-100 - quality score for the entire PR",
  "findings": [
    {
      "title": "string - short title for the finding",
      "description": "string - detailed explanation of the issue",
      "severity": "critical | high | medium | low | info",
      "confidence": "number 0-100 - how confident you are about this finding",
      "category": "bug | security | performance | style | maintainability",
      "filename": "string - the file where the issue was found",
      "line": "number (optional) - approximate line number in the diff",
      "suggestion": "string (optional) - suggested fix or improvement"
    }
  ],
  "positives": ["string - things done well in this PR"]
}`;

/**
 * Truncates a patch to the configured maximum length, appending an
 * indicator when content is trimmed.
 */
const truncatePatch = (patch: string): string => {
  if (patch.length <= MAX_PATCH_LENGTH) {
    return patch;
  }
  return patch.slice(0, MAX_PATCH_LENGTH) + '\n... [truncated]';
};

/**
 * Builds a file section string for the prompt from the changed files.
 */
const buildFileSections = (pr: NormalizedPullRequest): string => {
  return pr.files
    .filter((file) => file.patch)
    .map((file) => {
      const truncatedPatch = truncatePatch(file.patch!);
      return `### File: ${file.filename} (${file.language})\nAdditions: ${file.additions} | Deletions: ${file.deletions}\n\`\`\`diff\n${truncatedPatch}\n\`\`\``;
    })
    .join('\n\n');
};

/**
 * Returns the system instruction for the Gemini model.
 */
export const getSystemInstruction = (): string => {
  return SYSTEM_INSTRUCTION;
};

/**
 * Builds the user prompt from a NormalizedPullRequest.
 * Includes PR metadata and truncated file diffs only.
 */
export const buildReviewPrompt = (pr: NormalizedPullRequest): string => {
  const { pullRequest, files } = pr;

  const header = `## Pull Request Review Request

**Repository:** ${pullRequest.owner}/${pullRequest.repo}
**PR #${pullRequest.number}:** ${pullRequest.title}
**Branch:** ${pullRequest.branch}
**Files Changed:** ${files.length}

Review the following changed files and return your review as JSON:`;

  const fileSections = buildFileSections(pr);

  return `${header}\n\n${fileSections}`;
};
