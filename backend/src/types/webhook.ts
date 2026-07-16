export type GitHubEventType = 'pull_request' | 'ping';

export type NormalizedPullRequestEvent = {
  event: 'pull_request';
  action: string;
  repositoryId: number;
  repositoryFullName: string;
  pullRequestNumber: number;
  installationId: number | null;
  sender: string;
  timestamp: string;
};

export type NormalizedPingEvent = {
  event: 'ping';
};

export type NormalizedWebhookEvent = NormalizedPullRequestEvent | NormalizedPingEvent;
