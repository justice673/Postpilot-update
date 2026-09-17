export interface DashboardChartPoint {
  date: string;
  scheduled: number;
  published: number;
}

export interface AnalyticsData {
  weeklyPosts: { day: string; posted: number; failed: number }[];
  monthlyTotal: number;
  weeklyTotal: number;
  successRate: number;
  postingTimes: { hour: string; count: number }[];
  bestTime: string;
}
