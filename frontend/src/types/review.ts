export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Category = 'bug' | 'security' | 'performance' | 'style' | 'maintainability';
export type ReviewStatus = 'pending' | 'completed' | 'failed' | 'published';

export type Finding = {
  title: string;
  description: string;
  severity: Severity;
  confidence: number;
  category: Category;
  filename: string;
  line?: number;
  suggestion?: string;
};

export type ReviewStatistics = {
  filesReviewed: number;
  additions: number;
  deletions: number;
  findingsCount: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
};

export type Review = {
  id: string;
  repository: string;
  owner: string;
  githubRepositoryId: number;
  pullRequestNumber: number;
  commitSha: string;
  branch: string;
  status: ReviewStatus;
  summary?: string;
  overallScore?: number;
  findings: Finding[];
  positives: string[];
  statistics: ReviewStatistics;
  createdAt: string;
  updatedAt: string;
};
