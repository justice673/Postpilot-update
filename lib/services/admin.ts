import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isIsoInRange, type DateRangeValue } from "@/lib/date-range";
import type { AdminActivityItem } from "@/lib/types/admin-activity";
import type {
  AdminOverview,
  AdminPost,
  AdminUserDetail,
  AdminUserSummary,
} from "@/lib/types/admin";
import type { PostRow } from "@/lib/types/posts";
import type { ProfileRow } from "@/lib/types/profile";
import type { SettingsRow } from "@/lib/types/settings";
import { defaultDisplayName } from "@/lib/utils/profile";

export class AdminServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AdminServiceError";
  }
}

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function throwIfError(error: { message: string; code?: string } | null) {
  if (error) {
    throw new AdminServiceError(error.message, error.code);
  }
}

type PostCountBucket = {
  user_id: string;
  status: string;
};

function buildPostCounts(posts: PostCountBucket[]) {
  const byUser = new Map<
    string,
    { total: number; pending: number; posted: number; failed: number }
  >();

  for (const row of posts) {
    const current = byUser.get(row.user_id) ?? {
      total: 0,
      pending: 0,
      posted: 0,
      failed: 0,
    };
    current.total += 1;
    if (row.status === "pending") current.pending += 1;
    if (row.status === "posted") current.posted += 1;
    if (row.status === "failed") current.failed += 1;
    byUser.set(row.user_id, current);
  }

  return byUser;
}

function mapPostRow(
  row: PostRow,
  userEmail: string,
  userDisplayName: string,
): AdminPost {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail,
    userDisplayName,
    content: row.content,
    scheduledAt: row.scheduled_at,
    status: row.status,
    hasImage: row.has_image,
    postedAt: row.posted_at ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getAdminOverview(
  range?: DateRangeValue | null,
): Promise<AdminOverview> {
  const supabase = getServiceClient();

  const [
    { data: authData, error: authError },
    { data: posts, error: postsError },
    { data: settings, error: settingsError },
  ] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from("posts").select("status, scheduled_at, posted_at, user_id"),
    supabase.from("settings").select("user_id, x_connected"),
  ]);

  throwIfError(authError);
  throwIfError(postsError);
  throwIfError(settingsError);

  const users = authData?.users ?? [];
  const settingsRows = settings ?? [];
  const postRows = posts ?? [];

  const scopedUsers = range
    ? users.filter((user) =>
        isIsoInRange(user.created_at, range.from, range.to),
      )
    : users;

  const scopedUserIds = range
    ? new Set(scopedUsers.map((user) => user.id))
    : null;

  const scopedPosts = range
    ? postRows.filter((post) => {
        const stamp = post.posted_at ?? post.scheduled_at;
        return isIsoInRange(stamp, range.from, range.to);
      })
    : postRows;

  const xConnectedUsers = settingsRows.filter((row) => {
    if (!row.x_connected) return false;
    if (scopedUserIds && !scopedUserIds.has(row.user_id)) return false;
    return true;
  }).length;

  return {
    totalUsers: scopedUsers.length,
    totalPosts: scopedPosts.length,
    pendingPosts: scopedPosts.filter((p) => p.status === "pending").length,
    postedPosts: scopedPosts.filter((p) => p.status === "posted").length,
    failedPosts: scopedPosts.filter((p) => p.status === "failed").length,
    xConnectedUsers: range ? xConnectedUsers : settingsRows.filter((s) => s.x_connected).length,
  };
}

export async function listAdminUsers(): Promise<AdminUserSummary[]> {
  const supabase = getServiceClient();

  const [
    { data: authData, error: authError },
    { data: profiles, error: profilesError },
    { data: settings, error: settingsError },
    { data: posts, error: postsError },
  ] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase
      .from("profiles")
      .select("user_id, display_name, bio, avatar_url, timezone, role, created_at"),
    supabase
      .from("settings")
      .select("user_id, x_connected, x_username, ai_writing_enabled"),
    supabase.from("posts").select("user_id, status"),
  ]);

  throwIfError(authError);
  throwIfError(profilesError);
  throwIfError(settingsError);
  throwIfError(postsError);

  const profileByUser = new Map(
    (profiles ?? []).map((p) => [p.user_id, p as ProfileRow]),
  );
  const settingsByUser = new Map(
    (settings ?? []).map((s) => [s.user_id, s as SettingsRow]),
  );
  const postCounts = buildPostCounts((posts ?? []) as PostCountBucket[]);

  return (authData?.users ?? [])
    .map((user) => {
      const profile = profileByUser.get(user.id);
      const userSettings = settingsByUser.get(user.id);
      const counts = postCounts.get(user.id) ?? {
        total: 0,
        pending: 0,
        posted: 0,
        failed: 0,
      };
      const email = user.email ?? "";
      const displayName =
        profile?.display_name?.trim() || defaultDisplayName(email);
      const bannedUntil = (user as { banned_until?: string | null }).banned_until;
      const suspended = Boolean(
        bannedUntil && new Date(bannedUntil).getTime() > Date.now(),
      );

      return {
        userId: user.id,
        email,
        displayName,
        role: (profile?.role as AdminUserSummary["role"]) ?? "user",
        xConnected: userSettings?.x_connected ?? false,
        xUsername: userSettings?.x_username ?? "",
        postCount: counts.total,
        pendingCount: counts.pending,
        postedCount: counts.posted,
        failedCount: counts.failed,
        createdAt: profile?.created_at ?? user.created_at,
        bio: profile?.bio ?? "",
        timezone: profile?.timezone ?? "",
        avatarUrl: profile?.avatar_url ?? "",
        aiWritingEnabled: userSettings?.ai_writing_enabled ?? true,
        suspended,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getAdminUserDetail(
  userId: string,
): Promise<AdminUserDetail | null> {
  const supabase = getServiceClient();

  const { data: authUser, error: authError } =
    await supabase.auth.admin.getUserById(userId);
  throwIfError(authError);

  if (!authUser.user) return null;

  const [
    { data: profile, error: profileError },
    { data: settings, error: settingsError },
    { data: posts, error: postsError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id, display_name, bio, avatar_url, timezone, role, created_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("settings")
      .select("user_id, x_connected, x_username, ai_writing_enabled")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("posts")
      .select(
        "id, user_id, content, status, has_image, scheduled_at, posted_at, created_at",
      )
      .eq("user_id", userId)
      .order("scheduled_at", { ascending: false }),
  ]);

  throwIfError(profileError);
  throwIfError(settingsError);
  throwIfError(postsError);

  const email = authUser.user.email ?? "";
  const displayName =
    profile?.display_name?.trim() || defaultDisplayName(email);
  const postRows = (posts ?? []) as PostRow[];
  const counts = buildPostCounts(
    postRows.map((p) => ({ user_id: p.user_id, status: p.status })),
  ).get(userId) ?? { total: 0, pending: 0, posted: 0, failed: 0 };

  return {
    userId,
    email,
    displayName,
    role: (profile?.role as AdminUserSummary["role"]) ?? "user",
    xConnected: settings?.x_connected ?? false,
    xUsername: settings?.x_username ?? "",
    postCount: counts.total,
    pendingCount: counts.pending,
    postedCount: counts.posted,
    failedCount: counts.failed,
    createdAt: profile?.created_at ?? authUser.user.created_at,
    bio: profile?.bio ?? "",
    timezone: profile?.timezone ?? "",
    avatarUrl: profile?.avatar_url ?? "",
    aiWritingEnabled: settings?.ai_writing_enabled ?? true,
    suspended: Boolean(
      (authUser.user as { banned_until?: string | null }).banned_until &&
        new Date(
          (authUser.user as { banned_until?: string }).banned_until!,
        ).getTime() > Date.now(),
    ),
    posts: postRows.map((row) => mapPostRow(row, email, displayName)),
  };
}

/** Update a user's role in profiles (creates profile row if missing). */
export async function updateAdminUserRole(
  userId: string,
  role: AdminUserSummary["role"],
): Promise<void> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("user_id", userId)
    .select("user_id")
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(userId);
    throwIfError(authError);

    const email = authUser.user?.email ?? "";
    const { error: insertError } = await supabase.from("profiles").insert({
      user_id: userId,
      display_name: defaultDisplayName(email),
      role,
      bio: null,
      avatar_url: null,
      timezone: "UTC",
    });
    throwIfError(insertError);
  }
}

/** Ban / unban a user via Supabase Auth. */
export async function setAdminUserSuspended(
  userId: string,
  suspended: boolean,
): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: suspended ? "876600h" : "none",
  });
  throwIfError(error);
}

/** Wipe user data and delete the auth user (admin). */
export async function deleteAdminUser(userId: string): Promise<void> {
  const supabase = getServiceClient();

  const { data: authUser, error: authLookupError } =
    await supabase.auth.admin.getUserById(userId);
  throwIfError(authLookupError);

  if (!authUser.user) {
    throw new AdminServiceError("User not found", "NOT_FOUND");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (profile?.role === "super_admin") {
    throw new AdminServiceError(
      "Cannot delete a super admin account",
      "FORBIDDEN",
    );
  }

  const tables = [
    "posts",
    "notification_settings",
    "settings",
    "profiles",
  ] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);
    if (error && error.code !== "PGRST205" && error.code !== "42P01") {
      throwIfError(error);
    }
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  throwIfError(deleteError);
}

export async function listAdminPosts(limit = 100): Promise<AdminPost[]> {
  const supabase = getServiceClient();

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      "id, user_id, content, status, has_image, scheduled_at, posted_at, created_at",
    )
    .order("scheduled_at", { ascending: false })
    .limit(limit);

  throwIfError(postsError);

  const postRows = (posts ?? []) as PostRow[];
  const userIds = [...new Set(postRows.map((p) => p.user_id))];

  if (userIds.length === 0) return [];

  const [{ data: profiles }, { data: authData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const emailByUser = new Map(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? ""]),
  );
  const nameByUser = new Map(
    (profiles ?? []).map((p) => [
      p.user_id,
      p.display_name?.trim() ||
        defaultDisplayName(emailByUser.get(p.user_id) ?? ""),
    ]),
  );

  return postRows.map((row) =>
    mapPostRow(
      row,
      emailByUser.get(row.user_id) ?? "",
      nameByUser.get(row.user_id) ?? "User",
    ),
  );
}

function truncateActivityText(value: string, max = 96) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}

/** Recent platform activity for the admin notifications feed. */
export async function listAdminActivity(
  limit = 60,
): Promise<AdminActivityItem[]> {
  const supabase = getServiceClient();

  const [
    { data: authData, error: authError },
    { data: profiles, error: profilesError },
    { data: posts, error: postsError },
  ] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from("profiles").select("user_id, display_name"),
    supabase
      .from("posts")
      .select(
        "id, user_id, content, status, scheduled_at, posted_at, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  throwIfError(authError);
  throwIfError(profilesError);
  throwIfError(postsError);

  const users = authData?.users ?? [];
  const emailByUser = new Map(users.map((u) => [u.id, u.email ?? ""]));
  const nameByUser = new Map(
    (profiles ?? []).map((p) => {
      const email = emailByUser.get(p.user_id) ?? "";
      return [
        p.user_id,
        p.display_name?.trim() || defaultDisplayName(email),
      ] as const;
    }),
  );

  function displayName(userId: string) {
    return (
      nameByUser.get(userId) ??
      defaultDisplayName(emailByUser.get(userId) ?? "")
    );
  }

  const items: AdminActivityItem[] = [];

  for (const user of users) {
    const email = user.email ?? "";
    const name = displayName(user.id);
    items.push({
      id: `signup:${user.id}`,
      type: "signup",
      title: "New account",
      description: `${name} created an account`,
      href: `/admin/users/${user.id}`,
      userId: user.id,
      userDisplayName: name,
      userEmail: email,
      occurredAt: user.created_at,
    });
  }

  for (const row of (posts ?? []) as PostRow[]) {
    const name = displayName(row.user_id);
    const email = emailByUser.get(row.user_id) ?? "";
    const snippet = truncateActivityText(row.content || "Untitled post");

    if (row.status === "pending") {
      items.push({
        id: `scheduled:${row.id}`,
        type: "scheduled",
        title: "Post scheduled",
        description: `${name} scheduled “${snippet}”`,
        href: `/admin/posts`,
        userId: row.user_id,
        userDisplayName: name,
        userEmail: email,
        occurredAt: row.created_at || row.scheduled_at,
        content: row.content || "",
        postId: row.id,
        scheduledAt: row.scheduled_at,
      });
    } else if (row.status === "posted") {
      items.push({
        id: `posted:${row.id}`,
        type: "posted",
        title: "Post published",
        description: `${name} published “${snippet}”`,
        href: `/admin/posts`,
        userId: row.user_id,
        userDisplayName: name,
        userEmail: email,
        occurredAt: row.posted_at || row.updated_at || row.created_at,
        content: row.content || "",
        postId: row.id,
        scheduledAt: row.scheduled_at,
        postedAt: row.posted_at ?? undefined,
      });
    } else if (row.status === "failed") {
      items.push({
        id: `failed:${row.id}`,
        type: "failed",
        title: "Post failed",
        description: `${name}’s post failed — “${snippet}”`,
        href: `/admin/posts`,
        userId: row.user_id,
        userDisplayName: name,
        userEmail: email,
        occurredAt: row.updated_at || row.created_at,
        content: row.content || "",
        postId: row.id,
        scheduledAt: row.scheduled_at,
      });
    }
  }

  return items
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .slice(0, limit);
}

/** Count activity events in the last N hours (for the navbar badge). */
export async function countRecentAdminActivity(
  withinHours = 24,
): Promise<number> {
  const supabase = getServiceClient();
  const cutoffIso = new Date(
    Date.now() - withinHours * 60 * 60 * 1000,
  ).toISOString();

  const [{ data: authData, error: authError }, { data: posts, error: postsError }] =
    await Promise.all([
      supabase.auth.admin.listUsers({ perPage: 1000 }),
      supabase
        .from("posts")
        .select("id, status, created_at, posted_at, updated_at")
        .or(
          `created_at.gte.${cutoffIso},posted_at.gte.${cutoffIso},updated_at.gte.${cutoffIso}`,
        )
        .limit(200),
    ]);

  throwIfError(authError);
  throwIfError(postsError);

  const cutoff = new Date(cutoffIso).getTime();
  const signups = (authData?.users ?? []).filter(
    (user) => new Date(user.created_at).getTime() >= cutoff,
  ).length;

  const postEvents = (posts ?? []).filter((row) => {
    const stamp =
      row.status === "posted"
        ? row.posted_at || row.updated_at || row.created_at
        : row.status === "failed"
          ? row.updated_at || row.created_at
          : row.created_at;
    return stamp ? new Date(stamp).getTime() >= cutoff : false;
  }).length;

  return signups + postEvents;
}
