export interface DashboardChartPoint {
  date: string;
  /** Totals (scheduled = all networks, published = all networks). */
  scheduled: number;
  published: number;
  /** Per-network breakdown for brand-colored charts. */
  xScheduled: number;
  xPublished: number;
  linkedinScheduled: number;
  linkedinPublished: number;
}

/** Brand colors for network series on dashboard charts. */
export const PLATFORM_CHART_COLORS = {
  x: "#111111",
  xMuted: "#737373",
  linkedin: "#0A66C2",
  linkedinMuted: "#93C5FD",
  instagram: "#E1306C",
} as const;

export interface PostingTimeBucket {
  hour: string;
  /** Total publishes in this hour bucket. */
  count: number;
  x: number;
  linkedin: number;
}

export interface WeeklyPostBucket {
  day: string;
  /** Totals for back-compat / empty checks. */
  posted: number;
  failed: number;
  xPosted: number;
  linkedinPosted: number;
}

export interface NetworkMix {
  xPublished: number;
  linkedinPublished: number;
}

export interface AnalyticsData {
  weeklyPosts: WeeklyPostBucket[];
  monthlyTotal: number;
  weeklyTotal: number;
  successRate: number;
  postingTimes: PostingTimeBucket[];
  bestTime: string;
  networkMix: NetworkMix;
}
