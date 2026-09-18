import type { PostPlatform } from "@/lib/types/posts";

export type PostStatus = "pending" | "posted" | "failed";
export type UserRole = "user" | "super_admin";

export type AdminUser = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  xConnected: boolean;
  xUsername: string | null;
  linkedinConnected: boolean;
  linkedinUsername: string | null;
  timezone: string;
  aiWritingEnabled: boolean;
  bio: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  postCount: number;
  pendingCount: number;
  postedCount: number;
  failedCount: number;
  suspended?: boolean;
};

export type AdminPost = {
  id: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  content: string;
  platform: PostPlatform;
  status: PostStatus;
  scheduledAt: string;
};

export type AdminOverview = {
  totalUsers: number;
  xConnectedUsers: number;
  linkedinConnectedUsers: number;
  totalPosts: number;
  pendingPosts: number;
  postedPosts: number;
  failedPosts: number;
};
