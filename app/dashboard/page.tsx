import DashboardHome from "@/components/dashboard/DashboardHome";
import {
  formatDateRangeLabel,
  isIsoInRange,
  parseDateRangeParams,
} from "@/lib/date-range";
import { getAnalytics, getDashboardChartData } from "@/lib/services/analytics";
import {
  getDashboardStats,
  getPosts,
  getRecentActivity,
} from "@/lib/services/posts";
import { getProfile } from "@/lib/services/profile";
import { getSettings } from "@/lib/services/settings";
import {
  resolveUserTimeZone,
  todayKeyInZone,
  zonedDateKey,
} from "@/lib/timezone";
import { DEFAULT_TIMEZONE } from "@/lib/types/profile";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const range = parseDateRangeParams(params);
  const rangeLabel = range ? formatDateRangeLabel(range) : null;

  const [stats, activity, chartData, analytics, posts, profile, settings] =
    await Promise.all([
      getDashboardStats(range).catch(() => ({
        scheduledToday: 0,
        publishedToday: 0,
        nextPost: undefined,
      })),
      getRecentActivity(6, range).catch(() => []),
      getDashboardChartData(range ?? 90).catch(() => []),
      getAnalytics(range).catch(() => ({
        postingTimes: [] as {
          hour: string;
          count: number;
          x: number;
          linkedin: number;
        }[],
        bestTime: "—",
        weeklyPosts: [],
        monthlyTotal: 0,
        weeklyTotal: 0,
        successRate: 0,
        networkMix: { xPublished: 0, linkedinPublished: 0 },
      })),
      getPosts().catch(() => []),
      getProfile().catch(() => null),
      getSettings().catch(() => null),
    ]);

  const timeZone = resolveUserTimeZone(
    profile?.timezone && profile.timezone !== DEFAULT_TIMEZONE
      ? profile.timezone
      : null,
  );

  const filteredQueuePosts = (
    range
      ? posts.filter((post) =>
          isIsoInRange(post.scheduledAt, range.from, range.to),
        )
      : posts.filter(
          (post) =>
            zonedDateKey(post.scheduledAt, timeZone) ===
            todayKeyInZone(timeZone),
        )
  )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )
    .slice(0, 8);

  const queue = filteredQueuePosts.map((post) => ({
    id: post.id,
    body: post.content,
    time: new Date(post.scheduledAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    status:
      post.status === "posted"
        ? ("Published" as const)
        : post.status === "failed"
          ? ("Failed" as const)
          : ("Scheduled" as const),
    platform: post.platform ?? "x",
    href: "/dashboard/schedule",
  }));

  const pendingCount = range
    ? posts.filter(
        (post) =>
          post.status === "pending" &&
          isIsoInRange(post.scheduledAt, range.from, range.to),
      ).length
    : posts.filter((post) => post.status === "pending").length;

  return (
    <DashboardHome
      displayName={profile?.name || "there"}
      xConnected={Boolean(settings?.xConnected)}
      xUsername={settings?.xUsername ?? null}
      linkedinConnected={Boolean(settings?.linkedinConnected)}
      linkedinUsername={settings?.linkedinUsername ?? null}
      scheduledToday={stats.scheduledToday}
      publishedToday={stats.publishedToday}
      pendingCount={pendingCount}
      nextPost={stats.nextPost ?? null}
      queue={queue}
      activity={activity}
      chartData={chartData}
      postingTimes={analytics.postingTimes}
      bestTime={analytics.bestTime}
      rangeActive={Boolean(range)}
      rangeLabel={rangeLabel}
    />
  );
}
