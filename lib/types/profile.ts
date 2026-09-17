export type UserRole = "user" | "super_admin";

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatar: string;
  initials: string;
  bio: string;
  timezone: string;
  role?: UserRole;
}

export interface ProfileRow {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  timezone: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  bio?: string;
  /** Pass `null` or `""` to clear the stored avatar. */
  avatarUrl?: string | null;
  /** IANA timezone. Empty/null falls back to the existing value (column is NOT NULL). */
  timezone?: string | null;
}

export const DEFAULT_TIMEZONE = "America/New_York";
