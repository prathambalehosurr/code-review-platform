import { describe, expect, it } from 'vitest';

import {
  buildReviewSummary,
  mapReviewFindingToComment,
  mapReviewResultToGitHubPayload,
} from '../../../src/services/review/review-mapper';
import type { ReviewFinding, ReviewResult } from '../../../src/validators';

describe('Review Mapper', () => {
  const mockFinding: ReviewFinding = {
    title: 'Hardcoded secret',
    description: 'A hardcoded API key was found.',
    suggestion: 'Use an environment variable instead.',
    severity: 'critical',
    category: 'security',
    filename: 'src/config.ts',
    line: 42,
    confidence: 0.99,
  };

  const mockResult: ReviewResult = {
    summary: 'Overall a good PR, but needs security fixes.',
    overallScore: 65,
    findings: [mockFinding],
    positives: ['Good test coverage'],
  };

  describe('mapReviewFindingToComment', () => {
    it('should map a valid finding to a GitHub comment', () => {
      const comment = mapReviewFindingToComment(mockFinding);
      expect(comment).not.toBeNull();
      expect(comment?.path).toBe('src/config.ts');
      expect(comment?.line).toBe(42);
      expect(comment?.body).toContain('**[CRITICAL] security** - Hardcoded secret');
      expect(comment?.body).toContain('A hardcoded API key was found.');
      expect(comment?.body).toContain('**Suggestion:**\nUse an environment variable instead.');
    });

    it('should return null if filename is missing', () => {
      const invalid = { ...mockFinding, filename: '' };
      expect(mapReviewFindingToComment(invalid)).toBeNull();
    });

    it('should return null if line is undefined or <= 0', () => {
      expect(mapReviewFindingToComment({ ...mockFinding, line: undefined })).toBeNull();
      expect(mapReviewFindingToComment({ ...mockFinding, line: 0 })).toBeNull();
      expect(mapReviewFindingToComment({ ...mockFinding, line: -1 })).toBeNull();
    });

    it('should return null if there is no description and no suggestion', () => {
      const invalid = { ...mockFinding, description: '', suggestion: undefined };
      expect(mapReviewFindingToComment(invalid)).toBeNull();
    });

    it('should work without a suggestion', () => {
      const noSuggest = { ...mockFinding, suggestion: undefined };
      const comment = mapReviewFindingToComment(noSuggest);
      expect(comment?.body).not.toContain('**Suggestion:**');
    });
  });

  describe('buildReviewSummary', () => {
    it('should build a markdown summary containing score and severity counts', () => {
      const summary = buildReviewSummary(mockResult);
      expect(summary).toContain('**Overall Score:** 65/100');
      expect(summary).toContain('- Critical: 1');
      expect(summary).toContain('- High: 0');
      expect(summary).toContain('### Positives\n\n- Good test coverage');
      expect(summary).toContain('### Summary\nOverall a good PR, but needs security fixes.');
    });

    it('should handle missing positives and summary gracefully', () => {
      const emptyResult: ReviewResult = { overallScore: 100, findings: [] };
      const summary = buildReviewSummary(emptyResult);
      expect(summary).toContain('**Overall Score:** 100/100');
      expect(summary).not.toContain('### Positives');
      expect(summary).not.toContain('### Summary');
    });
  });

  describe('mapReviewResultToGitHubPayload', () => {
    it('should split valid and invalid findings', () => {
      const invalidFinding = { ...mockFinding, line: -5 };
      const combinedResult = { ...mockResult, findings: [mockFinding, invalidFinding] };

      const { payload, skippedFindings } = mapReviewResultToGitHubPayload(combinedResult);

      expect(payload.comments).toHaveLength(1);
      expect(payload.comments[0].line).toBe(42);
      expect(skippedFindings).toHaveLength(1);
      expect(skippedFindings[0].line).toBe(-5);
      expect(payload.body).toContain('**Overall Score:** 65/100');
    });
  });
});
