export type DashboardData = {
  totalRepositories: number;
  connectedRepositories: number;
  totalReviews: number;
  averageScore: number;
  reviewsLast30Days: number;
};

export type SeverityCounts = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
};

export type ReviewTrendPoint = {
  date: string;
  count: number;
};

export type StatisticsData = {
  severityCounts: SeverityCounts;
  averageScore: number;
  reviewTrend: ReviewTrendPoint[];
  repositoriesReviewed: number;
};
