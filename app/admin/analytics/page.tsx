import AdminAnalyticsView from "@/components/admin/AdminAnalyticsView";
import {
  formatDateRangeLabel,
  parseDateRangeParams,
} from "@/lib/date-range";
import { getAdminOverview } from "@/lib/services/admin";
import {
  getAdminAnalytics,
  getAdminDashboardChartData,
} from "@/lib/services/admin-analytics";
import type { AdminAnalyticsData } from "@/lib/types/admin";

const emptyAnalytics: AdminAnalyticsData = {
  weeklyPosts: [
    { day: "Mon", posted: 0, failed: 0 },
    { day: "Tue", posted: 0, failed: 0 },
    { day: "Wed", posted: 0, failed: 0 },
    { day: "Thu", posted: 0, failed: 0 },
    { day: "Fri", posted: 0, failed: 0 },
    { day: "Sat", posted: 0, failed: 0 },
    { day: "Sun", posted: 0, failed: 0 },
  ],
  monthlyTotal: 0,
  weeklyTotal: 0,
  successRate: 0,
  postingTimes: [],
  bestTime: "—",
  postStatusBreakdown: [],
  userSignups: [],
  connectionBreakdown: [],
};

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const range = parseDateRangeParams(params);
  const rangeLabel = range ? formatDateRangeLabel(range) : null;

  const [overview, activity, analytics] = await Promise.all([
    getAdminOverview(range).catch(() => ({
      totalUsers: 0,
      totalPosts: 0,
      pendingPosts: 0,
      postedPosts: 0,
      failedPosts: 0,
      xConnectedUsers: 0,
      linkedinConnectedUsers: 0,
    })),
    getAdminDashboardChartData(range ?? 30).catch(() => []),
    getAdminAnalytics(range).catch(() => emptyAnalytics),
  ]);

  return (
    <AdminAnalyticsView
      overview={overview}
      activity={activity}
      analytics={analytics}
      rangeActive={Boolean(range)}
      rangeLabel={rangeLabel}
    />
  );
}
