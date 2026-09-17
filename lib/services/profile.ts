import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_TIMEZONE,
  type ProfileRow,
  type UpdateProfileInput,
  type UserProfile,
} from "@/lib/types/profile";
import { defaultDisplayName, getInitials } from "@/lib/utils/profile";

export class ProfileServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ProfileServiceError";
  }
}

const PROFILE_COLUMNS =
  "id, user_id, display_name, bio, avatar_url, timezone, role, created_at, updated_at";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ProfileServiceError("Not authenticated", "UNAUTHORIZED");
  }

  return { supabase, user };
}

function throwIfError(error: { message: string; code?: string } | null) {
  if (error) {
    throw new ProfileServiceError(error.message, error.code);
  }
}

function mapRowToProfile(row: ProfileRow, email: string): UserProfile {
  const name = row.display_name?.trim() || defaultDisplayName(email);

  return {
    id: row.id,
    name,
    email,
    avatar: row.avatar_url ?? "",
    initials: getInitials(name, email),
    bio: row.bio ?? "",
    timezone: row.timezone?.trim() || "",
    role: row.role ?? "user",
  };
}

function profileFromAuth(email: string): UserProfile {
  const name = defaultDisplayName(email);

  return {
    name,
    email,
    avatar: "",
    initials: getInitials(name, email),
    bio: "",
    timezone: "",
  };
}

async function createDefaultProfile(
  userId: string,
  email: string,
): Promise<UserProfile> {
  const supabase = await createClient();
  const displayName = defaultDisplayName(email);

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      display_name: displayName,
      bio: null,
      avatar_url: null,
      timezone: DEFAULT_TIMEZONE,
    })
    .select(PROFILE_COLUMNS)
    .single();

  throwIfError(error);

  return mapRowToProfile(data as ProfileRow, email);
}

/** Load profile for the signed-in user, creating defaults if missing. */
export async function getProfile(): Promise<UserProfile> {
  const { supabase, user } = await getAuthenticatedUser();
  const email = user.email ?? "";

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", user.id)
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    try {
      return await createDefaultProfile(user.id, email);
    } catch (createError) {
      if (
        createError instanceof ProfileServiceError &&
        createError.code === "PGRST205"
      ) {
        return profileFromAuth(email);
      }
      throw createError;
    }
  }

  return mapRowToProfile(data as ProfileRow, email);
}

/** Update profile fields for the signed-in user. */
export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UserProfile> {
  const { supabase, user } = await getAuthenticatedUser();
  const email = user.email ?? "";

  if (input.email !== undefined && input.email.trim() !== email) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: input.email.trim(),
    });
    throwIfError(emailError);
  }

  const existing = await getProfile();

  const patch: Partial<
    Pick<ProfileRow, "display_name" | "bio" | "avatar_url" | "timezone">
  > = {};

  if (input.name !== undefined) {
    patch.display_name = input.name.trim() || null;
  }
  if (input.bio !== undefined) {
    patch.bio = input.bio.trim() || null;
  }
  if (input.avatarUrl !== undefined) {
    patch.avatar_url = input.avatarUrl?.trim() || null;
  }
  if (input.timezone !== undefined) {
    // Column is NOT NULL — never write null; fall back to existing or default.
    const nextTz = input.timezone?.trim();
    patch.timezone =
      nextTz || existing.timezone?.trim() || DEFAULT_TIMEZONE;
  }

  if (Object.keys(patch).length === 0) {
    return {
      ...existing,
      email: input.email?.trim() ?? existing.email,
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("user_id", user.id)
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    return createDefaultProfile(user.id, input.email?.trim() ?? email);
  }

  return mapRowToProfile(
    data as ProfileRow,
    input.email?.trim() ?? user.email ?? email,
  );
}

/** Verify current password and set a new one. */
export async function updatePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user.email) {
    throw new ProfileServiceError("No email on account", "NO_EMAIL");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    throw new ProfileServiceError("Current password is incorrect", "BAD_PASSWORD");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  throwIfError(updateError);
}

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Verify password, wipe user-owned rows, then delete the auth user.
 * Requires the service role key for auth.admin.deleteUser.
 */
export async function deleteAccount(currentPassword: string): Promise<void> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user.email) {
    throw new ProfileServiceError("No email on account", "NO_EMAIL");
  }

  if (!currentPassword.trim()) {
    throw new ProfileServiceError(
      "Enter your current password to delete your account",
      "BAD_PASSWORD",
    );
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    throw new ProfileServiceError("Current password is incorrect", "BAD_PASSWORD");
  }

  const admin = getAdminClient();
  const userId = user.id;

  const tables = [
    "posts",
    "notification_settings",
    "settings",
    "profiles",
  ] as const;

  for (const table of tables) {
    const { error } = await admin.from(table).delete().eq("user_id", userId);
    if (error && error.code !== "PGRST205" && error.code !== "42P01") {
      throw new ProfileServiceError(
        error.message || `Failed to delete ${table}`,
        error.code,
      );
    }
  }

  const { error: deleteAuthError } = await admin.auth.admin.deleteUser(userId);
  if (deleteAuthError) {
    throw new ProfileServiceError(
      deleteAuthError.message || "Failed to delete account",
      deleteAuthError.code,
    );
  }

  await supabase.auth.signOut();
}
