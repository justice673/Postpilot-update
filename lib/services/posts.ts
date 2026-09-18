import { createClient } from "@/lib/supabase/server";
import {
  dateRangeEnd,
  dateRangeStart,
  type DateRangeValue,
} from "@/lib/date-range";
import type {
  ActivityItem,
  CreatePostInput,
  DashboardStats,
  PostRow,
  PostStatus,
  ScheduledPost,
  UpdatePostInput,
} from "@/lib/types/posts";

export class PostsServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "PostsServiceError";
  }
}

function mapRowToPost(row: PostRow): ScheduledPost {
  const imageUrls = row.image_urls ?? [];

  return {
    id: row.id,
    content: row.content,
    platform: row.platform ?? "x",
    scheduledAt: row.scheduled_at,
    status: row.status,
    hasImage: row.has_image,
    imageUrl: imageUrls[0],
    imageUrls,
    imagePrompt: row.image_prompt ?? undefined,
    postedAt: row.posted_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCreateInputToRow(
  input: CreatePostInput,
  userId: string,
): Omit<PostRow, "id" | "created_at" | "updated_at" | "posted_at"> & {
  posted_at: null;
} {
  const imageUrls = input.imageUrls ?? [];
  const hasImage = input.hasImage ?? imageUrls.length > 0;

  return {
    user_id: userId,
    content: input.content.trim(),
    platform: input.platform ?? "x",
    scheduled_at: input.scheduledAt,
    status: input.status ?? "pending",
    has_image: hasImage,
    image_urls: imageUrls.length > 0 ? imageUrls : null,
    image_prompt: input.imagePrompt?.trim() || null,
    posted_at: null,
  };
}

function mapUpdateInputToRow(
  input: UpdatePostInput,
): Partial<
  Pick<
    PostRow,
    | "content"
    | "scheduled_at"
    | "status"
    | "has_image"
    | "image_urls"
    | "image_prompt"
    | "posted_at"
  >
> {
  const patch: Partial<
    Pick<
      PostRow,
      | "content"
      | "scheduled_at"
      | "status"
      | "has_image"
      | "image_urls"
      | "image_prompt"
      | "posted_at"
    >
  > = {};

  if (input.content !== undefined) patch.content = input.content.trim();
  if (input.scheduledAt !== undefined) patch.scheduled_at = input.scheduledAt;
  if (input.status !== undefined) patch.status = input.status;
  if (input.postedAt !== undefined) patch.posted_at = input.postedAt;
  if (input.imagePrompt !== undefined) {
    patch.image_prompt = input.imagePrompt?.trim() || null;
  }

  if (input.imageUrls !== undefined) {
    patch.image_urls = input.imageUrls.length > 0 ? input.imageUrls : null;
    if (input.hasImage === undefined) {
      patch.has_image = input.imageUrls.length > 0;
    }
  }

  if (input.hasImage !== undefined) patch.has_image = input.hasImage;

  return patch;
}

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new PostsServiceError("Not authenticated", "UNAUTHORIZED");
  }

  return user.id;
}

function throwIfError(error: { message: string; code?: string } | null) {
  if (error) {
    throw new PostsServiceError(error.message, error.code);
  }
}

const POST_COLUMNS =
  "id, user_id, content, status, has_image, image_urls, image_prompt, scheduled_at, posted_at, created_at, updated_at";

/** All posts for the signed-in user, ordered by schedule time ascending. */
export async function getPosts(): Promise<ScheduledPost[]> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: true });

  throwIfError(error);

  return (data as PostRow[]).map(mapRowToPost);
}

/** Single post by id (scoped to the signed-in user). */
export async function getPostById(id: string): Promise<ScheduledPost | null> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  throwIfError(error);

  return data ? mapRowToPost(data as PostRow) : null;
}

/** Create a new scheduled post for the signed-in user. */
export async function createPost(input: CreatePostInput): Promise<ScheduledPost> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("posts")
    .insert(mapCreateInputToRow(input, userId))
    .select(POST_COLUMNS)
    .single();

  throwIfError(error);

  return mapRowToPost(data as PostRow);
}

/** Update an existing post (scoped to the signed-in user). */
export async function updatePost(
  id: string,
  input: UpdatePostInput,
): Promise<ScheduledPost> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const patch = mapUpdateInputToRow(input);
  if (Object.keys(patch).length === 0) {
    const existing = await getPostById(id);
    if (!existing) {
      throw new PostsServiceError("Post not found", "NOT_FOUND");
    }
    return existing;
  }

  const { data, error } = await supabase
    .from("posts")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select(POST_COLUMNS)
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    throw new PostsServiceError("Post not found", "NOT_FOUND");
  }

  return mapRowToPost(data as PostRow);
}

/** Reschedule a post to a new date/time. */
export async function reschedulePost(
  id: string,
  scheduledAt: string,
): Promise<ScheduledPost> {
  return updatePost(id, { scheduledAt });
}

/** Delete a post (scoped to the signed-in user). */
export async function deletePost(id: string): Promise<void> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    throw new PostsServiceError("Post not found", "NOT_FOUND");
  }
}

/** Recent posted/failed activity for the dashboard feed. */
export async function getRecentActivity(
  limit = 5,
  range?: DateRangeValue | null,
): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  let query = supabase
    .from("posts")
    .select("id, content, status, platform, posted_at, updated_at")
    .eq("user_id", userId)
    .in("status", ["posted", "failed"])
    .order("posted_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (range) {
    query = query
      .gte("posted_at", dateRangeStart(range).toISOString())
      .lte("posted_at", dateRangeEnd(range).toISOString());
  }

  const { data, error } = await query;

  throwIfError(error);

  return (data ?? []).map((row) => ({
    id: row.id,
    content: row.content,
    postedAt: row.posted_at ?? row.updated_at,
    status: row.status as "posted" | "failed",
    platform: row.platform === "linkedin" ? "linkedin" : "x",
  }));
}

/** Dashboard stat cards computed from the user's posts. */
export async function getDashboardStats(
  range?: DateRangeValue | null,
): Promise<DashboardStats> {
  const posts = await getPosts();
  const now = new Date();

  const windowStart = range
    ? dateRangeStart(range)
    : (() => {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        return d;
      })();

  const windowEnd = range
    ? dateRangeEnd(range)
    : (() => {
        const d = new Date(now);
        d.setHours(23, 59, 59, 999);
        return d;
      })();

  const scheduledToday = posts.filter((post) => {
    const scheduled = new Date(post.scheduledAt);
    return (
      scheduled >= windowStart &&
      scheduled <= windowEnd &&
      post.status === "pending"
    );
  }).length;

  const publishedToday = posts.filter((post) => {
    if (!post.postedAt || post.status !== "posted") return false;
    const posted = new Date(post.postedAt);
    return posted >= windowStart && posted <= windowEnd;
  }).length;

  const nextPost = posts
    .filter(
      (post) =>
        post.status === "pending" && new Date(post.scheduledAt) > now,
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )[0];

  return { scheduledToday, publishedToday, nextPost };
}

/** Posts with a given status (e.g. schedule page filters). */
export async function getPostsByStatus(
  status: PostStatus,
): Promise<ScheduledPost[]> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("user_id", userId)
    .eq("status", status)
    .order("scheduled_at", { ascending: true });

  throwIfError(error);

  return (data as PostRow[]).map(mapRowToPost);
}

/** Posts scheduled within a date range (inclusive). */
export async function getPostsInRange(
  start: Date,
  end: Date,
): Promise<ScheduledPost[]> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("user_id", userId)
    .gte("scheduled_at", start.toISOString())
    .lte("scheduled_at", end.toISOString())
    .order("scheduled_at", { ascending: true });

  throwIfError(error);

  return (data as PostRow[]).map(mapRowToPost);
}

export { mapRowToPost };
