import type { PostPlatform } from "@/lib/types/posts";

export type AdminActivityType =
  | "signup"
  | "scheduled"
  | "posted"
  | "failed";

export type AdminActivityItem = {
  id: string;
  type: AdminActivityType;
  title: string;
  description: string;
  href: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  occurredAt: string;
  /** Full post body when the event is post-related. */
  content?: string;
  postId?: string;
  platform?: PostPlatform;
  scheduledAt?: string;
  postedAt?: string;
};
