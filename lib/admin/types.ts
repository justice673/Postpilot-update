export type PostStatus = "pending" | "posted" | "failed";
export type UserRole = "user" | "super_admin";

export type AdminUser = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  xConnected: boolean;
  xUsername: string | null;
  timezone: string;
  aiWritingEnabled: boolean;
  bio: string | null;
  createdAt: string;
  postCount: number;
  pendingCount: number;
  postedCount: number;
  failedCount: number;
};

export type AdminPost = {
  id: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  content: string;
  status: PostStatus;
  scheduledAt: string;
};

export type AdminOverview = {
  totalUsers: number;
  xConnectedUsers: number;
  totalPosts: number;
  pendingPosts: number;
  postedPosts: number;
  failedPosts: number;
};
