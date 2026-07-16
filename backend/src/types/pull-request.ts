export interface PullRequestInfo {
  id: number;
  number: number;
  title: string;
  state: string;
  htmlUrl: string;
  owner: string;
  repo: string;
  branch: string;
  sha: string;
}

export interface ChangedFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  language: string;
}

export interface NormalizedPullRequest {
  pullRequest: PullRequestInfo;
  files: ChangedFile[];
}
