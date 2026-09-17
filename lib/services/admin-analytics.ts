import {
  addDays,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import {
  dateRangeEnd,
  dateRangeStart,
  daysInRange,
  isDateInRange,
  type DateRangeValue,
} from "@/lib/date-range";
import type { AdminAnalyticsData } from "@/lib/types/admin";
import type { DashboardChartPoint } from "@/lib/types/analytics";
import type { PostRow } from "@/lib/types/posts";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_BUCKETS = [6, 9, 12, 15, 18, 21];

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function formatHourLabel(hour: number): string {
  if (hour === 12) return "12pm";
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

function postTimestamp(post: PostRow): Date {
  return new Date(post.posted_at ?? post.scheduled_at);
}

function isInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date < end;
}

async function fetchAllPosts(): Promise<PostRow[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, user_id, content, status, has_image, image_urls, image_prompt, scheduled_at, posted_at, created_at, updated_at",
    )
    .order("scheduled_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PostRow[];
}

/** Daily scheduled vs published counts across all users. */
export async function getAdminDashboardChartData(
  daysOrRange: number | DateRangeValue | null = 90,
): Promise<DashboardChartPoint[]> {
  const posts = await fetchAllPosts();

  if (daysOrRange && typeof daysOrRange === "object") {
    const range = daysOrRange;
    const totalDays = daysInRange(range);
    const start = dateRangeStart(range);

    return Array.from({ length: totalDays }, (_, index) => {
      const dayStart = addDays(start, index);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = addDays(dayStart, 1);

      const scheduled = posts.filter((post) => {
        const scheduledAt = new Date(post.scheduled_at);
        return isInRange(scheduledAt, dayStart, dayEnd);
      }).length;

      const published = posts.filter((post) => {
        if (post.status !== "posted" || !post.posted_at) return false;
        const postedAt = new Date(post.posted_at);
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
      const scheduledAt = new Date(post.scheduled_at);
      return isInRange(scheduledAt, dayStart, dayEnd);
    }).length;

    const published = posts.filter((post) => {
      if (post.status !== "posted" || !post.posted_at) return false;
      const postedAt = new Date(post.posted_at);
      return isInRange(postedAt, dayStart, dayEnd);
    }).length;

    return {
      date: format(dayStart, "yyyy-MM-dd"),
      scheduled,
      published,
    };
  });
}

/** System-wide analytics for admin charts. */
export async function getAdminAnalytics(
  range?: DateRangeValue | null,
): Promise<AdminAnalyticsData> {
  const supabase = getServiceClient();
  const [posts, authResult, settingsResult] = await Promise.all([
    fetchAllPosts(),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from("settings").select("x_connected"),
  ]);

  const users = authResult.data?.users ?? [];
  const settings = settingsResult.data ?? [];
  const now = new Date();

  const scopedPosts = range
    ? posts.filter((post) => isDateInRange(postTimestamp(post), range))
    : posts;

  const weekStart = range
    ? dateRangeStart(range)
    : startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = range
    ? dateRangeEnd(range)
    : addDays(startOfWeek(now, { weekStartsOn: 1 }), 7);

  const weeklyPosts = DAY_LABELS.map((day, index) => {
    const dayStart = addDays(startOfWeek(weekStart, { weekStartsOn: 1 }), index);
    const dayEnd = addDays(dayStart, 1);

    const dayPosts = scopedPosts.filter((post) => {
      if (post.status !== "posted" && post.status !== "failed") return false;
      const timestamp = postTimestamp(post);
      if (range) {
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
      post.posted_at &&
      (range
        ? isDateInRange(new Date(post.posted_at), range)
        : isInRange(new Date(post.posted_at), weekStart, weekEnd)),
  ).length;

  const monthStart = range ? dateRangeStart(range) : startOfMonth(now);
  const monthEnd = range ? dateRangeEnd(range) : endOfMonth(now);
  const monthlyTotal = scopedPosts.filter(
    (post) =>
      post.status === "posted" &&
      post.posted_at &&
      new Date(post.posted_at) >= monthStart &&
      new Date(post.posted_at) <= monthEnd,
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
      if (post.status !== "posted" || !post.posted_at) return false;
      const postHour = new Date(post.posted_at).getHours();
      return postHour >= hour && postHour < hour + 3;
    }).length,
  }));

  const bestBucket = postingTimes.reduce(
    (best, current) => (current.count > best.count ? current : best),
    postingTimes[0] ?? { hour: "—", count: 0 },
  );

  const pendingCount = scopedPosts.filter((p) => p.status === "pending").length;
  const failedCount = scopedPosts.filter((p) => p.status === "failed").length;

  const postStatusBreakdown = [
    { name: "Pending", value: pendingCount, status: "pending" as const },
    { name: "Published", value: postedCount, status: "posted" as const },
    { name: "Failed", value: failedCount, status: "failed" as const },
  ].filter((item) => item.value > 0);

  const xConnected = settings.filter((s) => s.x_connected).length;
  const xDisconnected = Math.max(users.length - xConnected, 0);

  const xConnectionBreakdown = [
    { name: "Connected", value: xConnected },
    { name: "Not connected", value: xDisconnected },
  ].filter((item) => item.value > 0);

  const signupDays = range ? daysInRange(range) : 30;
  const signupStart = range
    ? dateRangeStart(range)
    : (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return addDays(today, -(signupDays - 1));
      })();

  const userSignups: DashboardChartPoint[] = Array.from(
    { length: signupDays },
    (_, index) => {
      const dayStart = addDays(signupStart, index);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = addDays(dayStart, 1);

      const signups = users.filter((user) => {
        const created = new Date(user.created_at);
        return isInRange(created, dayStart, dayEnd);
      }).length;

      return {
        date: format(dayStart, "yyyy-MM-dd"),
        scheduled: signups,
        published: 0,
      };
    },
  );

  return {
    weeklyPosts,
    monthlyTotal,
    weeklyTotal,
    successRate,
    postingTimes,
    bestTime: bestBucket.count > 0 ? bestBucket.hour : "—",
    postStatusBreakdown,
    userSignups,
    xConnectionBreakdown,
  };
}
