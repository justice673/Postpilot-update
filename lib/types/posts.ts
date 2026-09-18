export type PostStatus = "pending" | "posted" | "failed";
export type PostPlatform = "x" | "linkedin";

/** App-facing post shape (camelCase) */
export interface ScheduledPost {
  id: string;
  content: string;
  platform: PostPlatform;
  scheduledAt: string;
  status: PostStatus;
  hasImage: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  imagePrompt?: string;
  postedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Supabase `posts` table row (snake_case) */
export interface PostRow {
  id: string;
  user_id: string;
  content: string;
  platform: PostPlatform;
  status: PostStatus;
  has_image: boolean;
  image_urls: string[] | null;
  image_prompt: string | null;
  scheduled_at: string;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePostInput {
  content: string;
  scheduledAt: string;
  platform?: PostPlatform;
  hasImage?: boolean;
  imageUrls?: string[];
  imagePrompt?: string | null;
  status?: PostStatus;
}

export interface UpdatePostInput {
  content?: string;
  scheduledAt?: string;
  status?: PostStatus;
  hasImage?: boolean;
  imageUrls?: string[];
  imagePrompt?: string | null;
  postedAt?: string | null;
}

export interface ActivityItem {
  id: string;
  content: string;
  postedAt: string;
  status: "posted" | "failed";
  platform: PostPlatform;
}

export interface DashboardStats {
  scheduledToday: number;
  publishedToday: number;
  nextPost?: ScheduledPost;
}
