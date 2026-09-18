import type { PostPlatform, PostStatus } from "@/lib/types/posts";
import type { UserRole } from "@/lib/types/profile";
import type {
  DashboardChartPoint,
  PostingTimeBucket,
} from "@/lib/types/analytics";

export interface AdminOverview {
  totalUsers: number;
  totalPosts: number;
  pendingPosts: number;
  postedPosts: number;
  failedPosts: number;
  xConnectedUsers: number;
  linkedinConnectedUsers: number;
}

export interface AdminUserSummary {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  xConnected: boolean;
  xUsername: string;
  linkedinConnected: boolean;
  linkedinUsername: string;
  postCount: number;
  pendingCount: number;
  postedCount: number;
  failedCount: number;
  createdAt: string;
  bio?: string;
  timezone?: string;
  avatarUrl?: string;
  aiWritingEnabled?: boolean;
  suspended?: boolean;
}

export interface AdminPost {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  content: string;
  platform: PostPlatform;
  scheduledAt: string;
  status: PostStatus;
  hasImage: boolean;
  postedAt?: string;
  createdAt?: string;
}

export interface AdminUserDetail extends AdminUserSummary {
  bio: string;
  timezone: string;
  aiWritingEnabled: boolean;
  avatarUrl?: string;
  suspended?: boolean;
  posts: AdminPost[];
}

export interface AdminAnalyticsData {
  weeklyPosts: { day: string; posted: number; failed: number }[];
  monthlyTotal: number;
  weeklyTotal: number;
  successRate: number;
  postingTimes: PostingTimeBucket[];
  bestTime: string;
  postStatusBreakdown: {
    name: string;
    value: number;
    status: PostStatus | "none";
  }[];
  userSignups: DashboardChartPoint[];
  /** Channel mix: X only / LinkedIn only / Both / Neither */
  connectionBreakdown: { name: string; value: number }[];
}
