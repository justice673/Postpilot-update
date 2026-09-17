import AnalyticsView from "@/components/dashboard/AnalyticsView";
import {
  formatDateRangeLabel,
  isIsoInRange,
  parseDateRangeParams,
} from "@/lib/date-range";
import { getAnalytics, getDashboardChartData } from "@/lib/services/analytics";
import { getPosts } from "@/lib/services/posts";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const range = parseDateRangeParams(params);
  const rangeLabel = range ? formatDateRangeLabel(range) : null;

  const [data, chartData, posts] = await Promise.all([
    getAnalytics(range).catch(() => ({
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
      postingTimes: [] as { hour: string; count: number }[],
      bestTime: "—",
    })),
    getDashboardChartData(range ?? 30).catch(() => []),
    getPosts().catch(() => []),
  ]);

  const recentPosts = (
    range
      ? posts.filter((post) => {
          if (post.status !== "posted" && post.status !== "failed") return false;
          const stamp = post.postedAt ?? post.scheduledAt;
          return isIsoInRange(stamp, range.from, range.to);
        })
      : posts.filter(
          (post) => post.status === "posted" || post.status === "failed",
        )
  )
    .sort(
      (a, b) =>
        new Date(b.postedAt ?? b.scheduledAt).getTime() -
        new Date(a.postedAt ?? a.scheduledAt).getTime(),
    )
    .slice(0, 5)
    .map((post) => ({
      id: post.id,
      content: post.content,
      status: post.status as "posted" | "failed",
      when: new Date(post.postedAt ?? post.scheduledAt).toLocaleString(
        "en-US",
        {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        },
      ),
    }));

  const failedInScope = data.weeklyPosts.reduce((sum, d) => sum + d.failed, 0);

  return (
    <AnalyticsView
      data={data}
      chartData={chartData}
      recentPosts={recentPosts}
      failedCount={failedInScope}
      rangeActive={Boolean(range)}
      rangeLabel={rangeLabel}
    />
  );
}
