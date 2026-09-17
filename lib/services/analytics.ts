import { addDays, endOfMonth, format, startOfMonth, startOfWeek } from "date-fns";
import {
  dateRangeEnd,
  dateRangeStart,
  daysInRange,
  isDateInRange,
  type DateRangeValue,
} from "@/lib/date-range";
import { getPosts } from "@/lib/services/posts";
import type { AnalyticsData, DashboardChartPoint } from "@/lib/types/analytics";
import type { ScheduledPost } from "@/lib/types/posts";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_BUCKETS = [6, 9, 12, 15, 18, 21];

function formatHourLabel(hour: number): string {
  if (hour === 12) return "12pm";
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

function postTimestamp(post: ScheduledPost): Date {
  return new Date(post.postedAt ?? post.scheduledAt);
}

function isInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date < end;
}

export async function getAnalytics(
  range?: DateRangeValue | null,
): Promise<AnalyticsData> {
  const posts = await getPosts();
  const now = new Date();

  const scopedPosts = range
    ? posts.filter((post) => isDateInRange(postTimestamp(post), range))
    : posts;

  const weekStart = range ? dateRangeStart(range) : startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = range ? dateRangeEnd(range) : addDays(startOfWeek(now, { weekStartsOn: 1 }), 7);

  const weeklyPosts = DAY_LABELS.map((day, index) => {
    const dayStart = addDays(startOfWeek(weekStart, { weekStartsOn: 1 }), index);
    const dayEnd = addDays(dayStart, 1);

    const dayPosts = scopedPosts.filter((post) => {
      if (post.status !== "posted" && post.status !== "failed") return false;
      const timestamp = postTimestamp(post);
      if (range) {
        // Day-of-week buckets across the selected range
        return timestamp.getDay() === ((index + 1) % 7);
      }
      return isInRange(timestamp, dayStart, dayEnd);
    });

    return {
      day,
      posted: dayPosts.filter((post) => post.status === "posted").length,
      failed: dayPosts.filter((post) => post.status === "failed").length,
    };
  });

  const weeklyTotal = scopedPosts.filter(
    (post) =>
      post.status === "posted" &&
      post.postedAt &&
      (range
        ? isDateInRange(new Date(post.postedAt), range)
        : isInRange(new Date(post.postedAt), weekStart, weekEnd)),
  ).length;

  const monthStart = range ? dateRangeStart(range) : startOfMonth(now);
  const monthEnd = range ? dateRangeEnd(range) : endOfMonth(now);
  const monthlyTotal = scopedPosts.filter(
    (post) =>
      post.status === "posted" &&
      post.postedAt &&
      new Date(post.postedAt) >= monthStart &&
      new Date(post.postedAt) <= monthEnd,
  ).length;

  const completed = scopedPosts.filter(
    (post) => post.status === "posted" || post.status === "failed",
  );
  const postedCount = completed.filter((post) => post.status === "posted").length;
  const successRate =
    completed.length === 0
      ? 0
      : Math.round((postedCount / completed.length) * 100);

  const postingTimes = HOUR_BUCKETS.map((hour) => ({
    hour: formatHourLabel(hour),
    count: scopedPosts.filter((post) => {
      if (post.status !== "posted" || !post.postedAt) return false;
      const postHour = new Date(post.postedAt).getHours();
      return postHour >= hour && postHour < hour + 3;
    }).length,
  }));

  const bestBucket = postingTimes.reduce(
    (best, current) => (current.count > best.count ? current : best),
    postingTimes[0] ?? { hour: "—", count: 0 },
  );

  return {
    weeklyPosts,
    monthlyTotal,
    weeklyTotal,
    successRate,
    postingTimes,
    bestTime: bestBucket.count > 0 ? bestBucket.hour : "—",
  };
}

/** Daily scheduled vs published counts for the dashboard chart. */
export async function getDashboardChartData(
  daysOrRange: number | DateRangeValue | null = 90,
): Promise<DashboardChartPoint[]> {
  const posts = await getPosts();

  if (daysOrRange && typeof daysOrRange === "object") {
    const range = daysOrRange;
    const totalDays = daysInRange(range);
    const start = dateRangeStart(range);

    return Array.from({ length: totalDays }, (_, index) => {
      const dayStart = addDays(start, index);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = addDays(dayStart, 1);

      const scheduled = posts.filter((post) => {
        const scheduledAt = new Date(post.scheduledAt);
        return isInRange(scheduledAt, dayStart, dayEnd);
      }).length;

      const published = posts.filter((post) => {
        if (post.status !== "posted" || !post.postedAt) return false;
        const postedAt = new Date(post.postedAt);
        return isInRange(postedAt, dayStart, dayEnd);
      }).length;

      return {
        date: format(dayStart, "yyyy-MM-dd"),
        scheduled,
        published,
      };
    });
  }

  const days = typeof daysOrRange === "number" ? daysOrRange : 90;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const dayStart = addDays(today, -(days - 1 - index));
    const dayEnd = addDays(dayStart, 1);

    const scheduled = posts.filter((post) => {
      const scheduledAt = new Date(post.scheduledAt);
      return isInRange(scheduledAt, dayStart, dayEnd);
    }).length;

    const published = posts.filter((post) => {
      if (post.status !== "posted" || !post.postedAt) return false;
      const postedAt = new Date(post.postedAt);
      return isInRange(postedAt, dayStart, dayEnd);
    }).length;

    return {
      date: format(dayStart, "yyyy-MM-dd"),
      scheduled,
      published,
    };
  });
}
