import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_POSTING_TIMES,
  type SettingsRow,
  type UpdateSettingsInput,
  type UserSettings,
} from "@/lib/types/settings";

export class SettingsServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "SettingsServiceError";
  }
}

const SETTINGS_COLUMNS =
  "id, user_id, x_connected, x_username, linkedin_connected, linkedin_username, ai_writing_enabled, default_posting_times, n8n_webhook_url, openai_api_key, created_at, updated_at";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new SettingsServiceError("Not authenticated", "UNAUTHORIZED");
  }

  return user.id;
}

function throwIfError(error: { message: string; code?: string } | null) {
  if (error) {
    throw new SettingsServiceError(error.message, error.code);
  }
}

function mapRowToSettings(row: SettingsRow): UserSettings {
  return {
    id: row.id,
    xConnected: row.x_connected,
    xUsername: row.x_username ?? "",
    linkedinConnected: row.linkedin_connected ?? false,
    linkedinUsername: row.linkedin_username ?? "",
    aiWritingEnabled: row.ai_writing_enabled,
    defaultPostingTimes:
      row.default_posting_times.length > 0
        ? row.default_posting_times
        : DEFAULT_POSTING_TIMES,
    n8nWebhookUrl: row.n8n_webhook_url ?? "",
    geminiApiKey: row.openai_api_key ?? "",
  };
}

function mapUpdateInputToRow(input: UpdateSettingsInput): Partial<
  Pick<
    SettingsRow,
    | "ai_writing_enabled"
    | "default_posting_times"
    | "n8n_webhook_url"
    | "openai_api_key"
  >
> {
  const patch: Partial<
    Pick<
      SettingsRow,
      | "ai_writing_enabled"
      | "default_posting_times"
      | "n8n_webhook_url"
      | "openai_api_key"
    >
  > = {};

  if (input.aiWritingEnabled !== undefined) {
    patch.ai_writing_enabled = input.aiWritingEnabled;
  }
  if (input.defaultPostingTimes !== undefined) {
    patch.default_posting_times = input.defaultPostingTimes;
  }
  if (input.n8nWebhookUrl !== undefined) {
    patch.n8n_webhook_url = input.n8nWebhookUrl.trim() || null;
  }
  if (input.geminiApiKey !== undefined) {
    patch.openai_api_key = input.geminiApiKey.trim() || null;
  }

  return patch;
}

async function createDefaultSettings(userId: string): Promise<UserSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("settings")
    .insert({
      user_id: userId,
      x_connected: false,
      x_username: null,
      linkedin_connected: false,
      linkedin_username: null,
      ai_writing_enabled: true,
      default_posting_times: DEFAULT_POSTING_TIMES,
      n8n_webhook_url: null,
      openai_api_key: null,
    })
    .select(SETTINGS_COLUMNS)
    .single();

  throwIfError(error);

  return mapRowToSettings(data as SettingsRow);
}

/** Load settings for the signed-in user, creating defaults if missing. */
export async function getSettings(): Promise<UserSettings> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("settings")
    .select(SETTINGS_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    return createDefaultSettings(userId);
  }

  return mapRowToSettings(data as SettingsRow);
}

/** Fetch X OAuth tokens for posting (server/cron only). */
export async function getXTokensForUser(
  userId: string,
): Promise<{ accessToken: string; accessSecret: string; username: string } | null> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("settings")
    .select("x_connected, x_username, x_access_token, x_access_secret")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new SettingsServiceError(error.message, error.code);
  }

  if (
    !data?.x_connected ||
    !data.x_access_token ||
    !data.x_access_secret
  ) {
    return null;
  }

  return {
    accessToken: data.x_access_token,
    accessSecret: data.x_access_secret,
    username: data.x_username ?? "",
  };
}

/** Save X OAuth tokens after a successful connect flow. */
export async function connectXAccount(input: {
  accessToken: string;
  accessSecret: string;
  screenName: string;
}): Promise<UserSettings> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  await getSettings();

  const { data, error } = await supabase
    .from("settings")
    .update({
      x_connected: true,
      x_username: input.screenName,
      x_access_token: input.accessToken,
      x_access_secret: input.accessSecret,
    })
    .eq("user_id", userId)
    .select(SETTINGS_COLUMNS)
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    throw new SettingsServiceError("Settings not found", "NOT_FOUND");
  }

  return mapRowToSettings(data as SettingsRow);
}

/** Disconnect the user's X account. */
export async function disconnectXAccount(): Promise<UserSettings> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("settings")
    .update({
      x_connected: false,
      x_username: null,
      x_access_token: null,
      x_access_secret: null,
    })
    .eq("user_id", userId)
    .select(SETTINGS_COLUMNS)
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    throw new SettingsServiceError("Settings not found", "NOT_FOUND");
  }

  return mapRowToSettings(data as SettingsRow);
}

export type LinkedInTokens = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string | null;
  personUrn: string;
  username: string;
};

/** Fetch LinkedIn OAuth tokens for posting (server/cron only). */
export async function getLinkedInTokensForUser(
  userId: string,
): Promise<LinkedInTokens | null> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("settings")
    .select(
      "linkedin_connected, linkedin_username, linkedin_access_token, linkedin_refresh_token, linkedin_token_expires_at, linkedin_person_urn",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new SettingsServiceError(error.message, error.code);
  }

  if (
    !data?.linkedin_connected ||
    !data.linkedin_access_token ||
    !data.linkedin_person_urn
  ) {
    return null;
  }

  return {
    accessToken: data.linkedin_access_token,
    refreshToken: data.linkedin_refresh_token,
    expiresAt: data.linkedin_token_expires_at,
    personUrn: data.linkedin_person_urn,
    username: data.linkedin_username ?? "",
  };
}

/** Persist refreshed LinkedIn tokens (server/cron only). */
export async function updateLinkedInTokensForUser(
  userId: string,
  input: {
    accessToken: string;
    refreshToken?: string | null;
    expiresAt: string;
  },
): Promise<void> {
  const supabase = getAdminClient();

  const patch: Record<string, string | null> = {
    linkedin_access_token: input.accessToken,
    linkedin_token_expires_at: input.expiresAt,
  };
  if (input.refreshToken !== undefined) {
    patch.linkedin_refresh_token = input.refreshToken;
  }

  const { error } = await supabase
    .from("settings")
    .update(patch)
    .eq("user_id", userId);

  if (error) {
    throw new SettingsServiceError(error.message, error.code);
  }
}

/** Save LinkedIn OAuth tokens after a successful connect flow. */
export async function connectLinkedInAccount(input: {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string;
  personUrn: string;
  username: string;
}): Promise<UserSettings> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  await getSettings();

  const { data, error } = await supabase
    .from("settings")
    .update({
      linkedin_connected: true,
      linkedin_username: input.username,
      linkedin_access_token: input.accessToken,
      linkedin_refresh_token: input.refreshToken,
      linkedin_token_expires_at: input.expiresAt,
      linkedin_person_urn: input.personUrn,
    })
    .eq("user_id", userId)
    .select(SETTINGS_COLUMNS)
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    throw new SettingsServiceError("Settings not found", "NOT_FOUND");
  }

  return mapRowToSettings(data as SettingsRow);
}

/** Disconnect the user's LinkedIn account. */
export async function disconnectLinkedInAccount(): Promise<UserSettings> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("settings")
    .update({
      linkedin_connected: false,
      linkedin_username: null,
      linkedin_access_token: null,
      linkedin_refresh_token: null,
      linkedin_token_expires_at: null,
      linkedin_person_urn: null,
    })
    .eq("user_id", userId)
    .select(SETTINGS_COLUMNS)
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    throw new SettingsServiceError("Settings not found", "NOT_FOUND");
  }

  return mapRowToSettings(data as SettingsRow);
}

/** Update settings for the signed-in user. */
export async function updateSettings(
  input: UpdateSettingsInput,
): Promise<UserSettings> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const existing = await getSettings();
  const patch = mapUpdateInputToRow(input);

  if (Object.keys(patch).length === 0) {
    return existing;
  }

  const { data, error } = await supabase
    .from("settings")
    .update(patch)
    .eq("user_id", userId)
    .select(SETTINGS_COLUMNS)
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    throw new SettingsServiceError("Settings not found", "NOT_FOUND");
  }

  return mapRowToSettings(data as SettingsRow);
}

export { mapRowToSettings };
