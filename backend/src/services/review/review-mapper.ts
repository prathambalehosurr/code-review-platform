import type { ReviewFinding, ReviewResult } from '../../validators';

export interface GitHubReviewComment {
  path: string;
  line: number;
  body: string;
}

export interface GitHubReviewPayload {
  body: string;
  comments: GitHubReviewComment[];
}

/**
 * Maps a single ReviewFinding to a GitHubReviewComment.
 * Returns null if the finding lacks a filename or a valid line number.
 */
export const mapReviewFindingToComment = (finding: ReviewFinding): GitHubReviewComment | null => {
  if (!finding.filename || typeof finding.line !== 'number' || finding.line <= 0) {
    return null;
  }

  // Ensure there's some content to suggest/body
  const body = finding.suggestion || finding.description;
  if (!body) {
    return null;
  }

  return {
    path: finding.filename,
    line: finding.line,
    body: `**[${finding.severity.toUpperCase()}] ${finding.category}** - ${finding.title}\n\n${finding.description}${finding.suggestion ? `\n\n**Suggestion:**\n${finding.suggestion}` : ''}`,
  };
};

/**
 * Creates the Markdown summary for the review.
 */
export const buildReviewSummary = (result: ReviewResult): string => {
  let summary = `## AI Code Review\n\n**Overall Score:** ${result.overallScore}/100\n\n**Findings:**\n`;

  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  result.findings.forEach((f) => {
    if (counts[f.severity] !== undefined) {
      counts[f.severity]++;
    }
  });

  summary += `- Critical: ${counts.critical}\n`;
  summary += `- High: ${counts.high}\n`;
  summary += `- Medium: ${counts.medium}\n`;
  summary += `- Low: ${counts.low}\n`;
  summary += `- Info: ${counts.info}\n\n`;

  if (result.positives && result.positives.length > 0) {
    summary += `### Positives\n\n`;
    result.positives.forEach((pos) => {
      summary += `- ${pos}\n`;
    });
  }

  if (result.summary) {
    summary += `\n### Summary\n${result.summary}\n`;
  }

  return summary;
};

/**
 * Maps a complete ReviewResult into a payload ready for the GitHub API.
 * Collects any skipped findings.
 */
export const mapReviewResultToGitHubPayload = (
  result: ReviewResult,
): { payload: GitHubReviewPayload; skippedFindings: ReviewFinding[] } => {
  const comments: GitHubReviewComment[] = [];
  const skippedFindings: ReviewFinding[] = [];

  for (const finding of result.findings) {
    const comment = mapReviewFindingToComment(finding);
    if (comment) {
      comments.push(comment);
    } else {
      skippedFindings.push(finding);
    }
  }

  const body = buildReviewSummary(result);

  return {
    payload: {
      body,
      comments,
    },
    skippedFindings,
  };
};
