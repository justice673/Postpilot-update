import type {
  AdminOverview,
  AdminPost,
  AdminUser,
} from "@/lib/admin/types";

export const adminUsers: AdminUser[] = [
  {
    id: "u_justice",
    displayName: "Justice Fonge",
    email: "justice@postpilot.app",
    role: "super_admin",
    xConnected: true,
    xUsername: "justicefonge",
    linkedinConnected: true,
    linkedinUsername: "Justice Fonge",
    timezone: "Africa/Lagos",
    aiWritingEnabled: true,
    bio: "Building Postpilot — schedule once, publish everywhere.",
    createdAt: "2026-01-12T10:00:00.000Z",
    postCount: 48,
    pendingCount: 6,
    postedCount: 40,
    failedCount: 2,
  },
  {
    id: "u_amara",
    displayName: "Amara Okonkwo",
    email: "amara@studio.co",
    role: "user",
    xConnected: true,
    xUsername: "amara.creates",
    linkedinConnected: false,
    linkedinUsername: null,
    timezone: "Africa/Lagos",
    aiWritingEnabled: true,
    bio: "Product designer shipping brand systems.",
    createdAt: "2026-03-04T14:22:00.000Z",
    postCount: 31,
    pendingCount: 4,
    postedCount: 26,
    failedCount: 1,
  },
  {
    id: "u_noah",
    displayName: "Noah Mensah",
    email: "noah@growthlab.io",
    role: "user",
    xConnected: true,
    xUsername: "noahmensah",
    linkedinConnected: true,
    linkedinUsername: "Noah Mensah",
    timezone: "Europe/London",
    aiWritingEnabled: false,
    bio: null,
    createdAt: "2026-04-18T09:10:00.000Z",
    postCount: 22,
    pendingCount: 3,
    postedCount: 18,
    failedCount: 1,
  },
  {
    id: "u_leia",
    displayName: "Leia Santos",
    email: "leia@northwind.dev",
    role: "user",
    xConnected: false,
    xUsername: null,
    linkedinConnected: false,
    linkedinUsername: null,
    timezone: "America/Sao_Paulo",
    aiWritingEnabled: true,
    bio: "Founder notes and weekly shipping logs.",
    createdAt: "2026-05-02T16:40:00.000Z",
    postCount: 8,
    pendingCount: 2,
    postedCount: 5,
    failedCount: 1,
  },
  {
    id: "u_kai",
    displayName: "Kai Chen",
    email: "kai@threadlabs.com",
    role: "user",
    xConnected: true,
    xUsername: "kaichen",
    linkedinConnected: false,
    linkedinUsername: null,
    timezone: "America/Los_Angeles",
    aiWritingEnabled: true,
    bio: "Devrel · open source · X threads",
    createdAt: "2026-06-21T11:05:00.000Z",
    postCount: 57,
    pendingCount: 9,
    postedCount: 46,
    failedCount: 2,
  },
  {
    id: "u_sofia",
    displayName: "Sofia Rahman",
    email: "sofia@mail.co",
    role: "user",
    xConnected: false,
    xUsername: null,
    linkedinConnected: false,
    linkedinUsername: null,
    timezone: "Asia/Dubai",
    aiWritingEnabled: false,
    bio: null,
    createdAt: "2026-08-09T08:30:00.000Z",
    postCount: 0,
    pendingCount: 0,
    postedCount: 0,
    failedCount: 0,
  },
];

export const adminPosts: AdminPost[] = [
  {
    id: "p1",
    userId: "u_justice",
    userDisplayName: "Justice Fonge",
    userEmail: "justice@postpilot.app",
    platform: "x",
    content:
      "Shipping the new compose flow this week — AI expand, cleaner schedule, and a queue that finally feels calm.",
    status: "pending",
    scheduledAt: "2026-09-17T09:00:00.000Z",
  },
  {
    id: "p2",
    userId: "u_amara",
    userDisplayName: "Amara Okonkwo",
    userEmail: "amara@studio.co",
    platform: "linkedin",
    content:
      "Design tip: if your calendar UI needs a legend, the product is already too loud.",
    status: "pending",
    scheduledAt: "2026-09-17T11:30:00.000Z",
  },
  {
    id: "p3",
    userId: "u_kai",
    userDisplayName: "Kai Chen",
    userEmail: "kai@threadlabs.com",
    platform: "x",
    content:
      "Thread: 7 patterns for OAuth onboarding that don’t make creators bounce.",
    status: "posted",
    scheduledAt: "2026-09-16T15:00:00.000Z",
  },
  {
    id: "p4",
    userId: "u_noah",
    userDisplayName: "Noah Mensah",
    userEmail: "noah@growthlab.io",
    platform: "x",
    content:
      "We cut scheduling friction by 40% after moving from “pick a date” to “drop in the queue.”",
    status: "posted",
    scheduledAt: "2026-09-16T10:15:00.000Z",
  },
  {
    id: "p5",
    userId: "u_justice",
    userDisplayName: "Justice Fonge",
    userEmail: "justice@postpilot.app",
    platform: "linkedin",
    content: "Hot take: most social tools are calendars with lipstick.",
    status: "posted",
    scheduledAt: "2026-09-15T13:30:00.000Z",
  },
  {
    id: "p6",
    userId: "u_leia",
    userDisplayName: "Leia Santos",
    userEmail: "leia@northwind.dev",
    platform: "x",
    content: "Week 12 ship log — auth polish, empty states, and one stubborn bug.",
    status: "failed",
    scheduledAt: "2026-09-15T08:00:00.000Z",
  },
  {
    id: "p7",
    userId: "u_kai",
    userDisplayName: "Kai Chen",
    userEmail: "kai@threadlabs.com",
    platform: "x",
    content:
      "If your webhook retries aren’t idempotent, you’re not shipping reliability — you’re shipping chaos.",
    status: "pending",
    scheduledAt: "2026-09-18T17:00:00.000Z",
  },
  {
    id: "p8",
    userId: "u_amara",
    userDisplayName: "Amara Okonkwo",
    userEmail: "amara@studio.co",
    platform: "linkedin",
    content: "Moodboard dump from today’s brand workshop ✨",
    status: "posted",
    scheduledAt: "2026-09-14T19:20:00.000Z",
  },
  {
    id: "p9",
    userId: "u_noah",
    userDisplayName: "Noah Mensah",
    userEmail: "noah@growthlab.io",
    platform: "x",
    content: "Growth isn’t a funnel. It’s a habit loop with better copy.",
    status: "failed",
    scheduledAt: "2026-09-13T12:00:00.000Z",
  },
  {
    id: "p10",
    userId: "u_justice",
    userDisplayName: "Justice Fonge",
    userEmail: "justice@postpilot.app",
    platform: "x",
    content:
      "Postpilot admin is live — overview, users, and posts in one calm control room.",
    status: "pending",
    scheduledAt: "2026-09-19T08:45:00.000Z",
  },
  {
    id: "p11",
    userId: "u_justice",
    userDisplayName: "Justice Fonge",
    userEmail: "justice@postpilot.app",
    platform: "linkedin",
    content: "Weekly recap: three wins, one miss, and what we’re shipping Monday.",
    status: "posted",
    scheduledAt: "2026-09-12T18:00:00.000Z",
  },
  {
    id: "p12",
    userId: "u_justice",
    userDisplayName: "Justice Fonge",
    userEmail: "justice@postpilot.app",
    platform: "x",
    content: "OAuth reconnect failed for a tester account — retrying tonight.",
    status: "failed",
    scheduledAt: "2026-09-11T09:20:00.000Z",
  },
  {
    id: "p13",
    userId: "u_amara",
    userDisplayName: "Amara Okonkwo",
    userEmail: "amara@studio.co",
    platform: "x",
    content: "New case study draft — brand systems for a fintech launch.",
    status: "pending",
    scheduledAt: "2026-09-18T14:00:00.000Z",
  },
  {
    id: "p14",
    userId: "u_amara",
    userDisplayName: "Amara Okonkwo",
    userEmail: "amara@studio.co",
    platform: "linkedin",
    content: "Color contrast tip that saved our last accessibility review.",
    status: "failed",
    scheduledAt: "2026-09-10T16:10:00.000Z",
  },
  {
    id: "p15",
    userId: "u_noah",
    userDisplayName: "Noah Mensah",
    userEmail: "noah@growthlab.io",
    platform: "x",
    content: "Queue experiment notes — morning slots still win for B2B.",
    status: "pending",
    scheduledAt: "2026-09-18T08:30:00.000Z",
  },
  {
    id: "p16",
    userId: "u_kai",
    userDisplayName: "Kai Chen",
    userEmail: "kai@threadlabs.com",
    platform: "x",
    content: "Open-source Friday: shipping the webhook verifier tonight.",
    status: "posted",
    scheduledAt: "2026-09-12T21:00:00.000Z",
  },
  {
    id: "p17",
    userId: "u_kai",
    userDisplayName: "Kai Chen",
    userEmail: "kai@threadlabs.com",
    platform: "linkedin",
    content: "API rate limit post failed — X returned 429. Will reschedule.",
    status: "failed",
    scheduledAt: "2026-09-09T13:45:00.000Z",
  },
  {
    id: "p18",
    userId: "u_leia",
    userDisplayName: "Leia Santos",
    userEmail: "leia@northwind.dev",
    platform: "x",
    content: "Founder note: shipping empty states before the dashboard polish.",
    status: "pending",
    scheduledAt: "2026-09-19T12:00:00.000Z",
  },
  {
    id: "p19",
    userId: "u_leia",
    userDisplayName: "Leia Santos",
    userEmail: "leia@northwind.dev",
    platform: "x",
    content: "Connected X finally — first scheduled post goes out tomorrow.",
    status: "posted",
    scheduledAt: "2026-09-08T10:00:00.000Z",
  },
];

function isIsoInRange(iso: string, from?: string, to?: string) {
  if (!from && !to) return true;
  const day = iso.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

export function getAdminOverview(range?: {
  from?: string;
  to?: string;
}): AdminOverview {
  const from = range?.from ?? "";
  const to = range?.to ?? "";
  const users = adminUsers.filter((u) =>
    isIsoInRange(u.createdAt, from, to),
  );
  const posts = adminPosts.filter((p) =>
    isIsoInRange(p.scheduledAt, from, to),
  );

  return {
    totalUsers: users.length,
    xConnectedUsers: users.filter((u) => u.xConnected).length,
    linkedinConnectedUsers: users.filter((u) => u.linkedinConnected).length,
    totalPosts: posts.length,
    pendingPosts: posts.filter((p) => p.status === "pending").length,
    postedPosts: posts.filter((p) => p.status === "posted").length,
    failedPosts: posts.filter((p) => p.status === "failed").length,
  };
}

/** Build activity series from posts for an optional date range. */
export function getAdminActivitySeries(range?: {
  from?: string;
  to?: string;
}) {
  const from = range?.from ?? "";
  const to = range?.to ?? "";
  if (!from && !to) return adminActivitySeries;

  const posts = adminPosts.filter((p) =>
    isIsoInRange(p.scheduledAt, from, to),
  );
  const byDay = new Map<string, { scheduled: number; published: number }>();

  for (const post of posts) {
    const key = post.scheduledAt.slice(0, 10);
    const row = byDay.get(key) ?? { scheduled: 0, published: 0 };
    row.scheduled += 1;
    if (post.status === "posted") row.published += 1;
    byDay.set(key, row);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([iso, counts]) => ({
      date: new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      ...counts,
    }));
}

export function getAdminUser(id: string) {
  return adminUsers.find((u) => u.id === id) ?? null;
}

export function getPostsForUser(userId: string) {
  return adminPosts
    .filter((p) => p.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
}

export function formatAdminDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatAdminDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const adminActivitySeries = [
  { date: "Sep 10", scheduled: 6, published: 4 },
  { date: "Sep 11", scheduled: 8, published: 7 },
  { date: "Sep 12", scheduled: 5, published: 5 },
  { date: "Sep 13", scheduled: 9, published: 6 },
  { date: "Sep 14", scheduled: 7, published: 8 },
  { date: "Sep 15", scheduled: 11, published: 9 },
  { date: "Sep 16", scheduled: 10, published: 8 },
];

export const adminWeeklyPosts = [
  { day: "Mon", posted: 8, failed: 1 },
  { day: "Tue", posted: 12, failed: 0 },
  { day: "Wed", posted: 9, failed: 2 },
  { day: "Thu", posted: 14, failed: 1 },
  { day: "Fri", posted: 11, failed: 0 },
  { day: "Sat", posted: 5, failed: 1 },
  { day: "Sun", posted: 6, failed: 0 },
];

export const adminPostingTimes = [
  { hour: "6a", count: 2 },
  { hour: "8a", count: 5 },
  { hour: "10a", count: 9 },
  { hour: "12p", count: 7 },
  { hour: "2p", count: 11 },
  { hour: "4p", count: 8 },
  { hour: "6p", count: 6 },
  { hour: "8p", count: 4 },
];

export const adminSignups = [
  { date: "Aug 20", signups: 1 },
  { date: "Aug 24", signups: 2 },
  { date: "Aug 28", signups: 1 },
  { date: "Sep 1", signups: 3 },
  { date: "Sep 5", signups: 2 },
  { date: "Sep 9", signups: 4 },
  { date: "Sep 13", signups: 2 },
  { date: "Sep 16", signups: 1 },
];
