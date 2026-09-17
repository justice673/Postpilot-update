import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettings,
  type NotificationSettingsRow,
  type UpdateNotificationSettingsInput,
} from "@/lib/types/notifications";

export class NotificationsServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "NotificationsServiceError";
  }
}

const NOTIFICATION_COLUMNS =
  "id, user_id, email_post_success, email_post_failed, email_weekly_summary, email_daily_reminder, email_product_updates, digest_frequency, created_at, updated_at";

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new NotificationsServiceError("Not authenticated", "UNAUTHORIZED");
  }

  return user.id;
}

function throwIfError(error: { message: string; code?: string } | null) {
  if (error) {
    throw new NotificationsServiceError(error.message, error.code);
  }
}

function mapRowToSettings(row: NotificationSettingsRow): NotificationSettings {
  return {
    id: row.id,
    emailPostSuccess: row.email_post_success,
    emailPostFailed: row.email_post_failed,
    emailWeeklySummary: row.email_weekly_summary,
    emailDailyReminder: row.email_daily_reminder,
    emailProductUpdates: row.email_product_updates,
    digestFrequency: row.digest_frequency,
  };
}

function mapUpdateInputToRow(
  input: UpdateNotificationSettingsInput,
): Partial<
  Pick<
    NotificationSettingsRow,
    | "email_post_success"
    | "email_post_failed"
    | "email_weekly_summary"
    | "email_daily_reminder"
    | "email_product_updates"
    | "digest_frequency"
  >
> {
  const patch: Partial<
    Pick<
      NotificationSettingsRow,
      | "email_post_success"
      | "email_post_failed"
      | "email_weekly_summary"
      | "email_daily_reminder"
      | "email_product_updates"
      | "digest_frequency"
    >
  > = {};

  if (input.emailPostSuccess !== undefined) {
    patch.email_post_success = input.emailPostSuccess;
  }
  if (input.emailPostFailed !== undefined) {
    patch.email_post_failed = input.emailPostFailed;
  }
  if (input.emailWeeklySummary !== undefined) {
    patch.email_weekly_summary = input.emailWeeklySummary;
  }
  if (input.emailDailyReminder !== undefined) {
    patch.email_daily_reminder = input.emailDailyReminder;
  }
  if (input.emailProductUpdates !== undefined) {
    patch.email_product_updates = input.emailProductUpdates;
  }
  if (input.digestFrequency !== undefined) {
    patch.digest_frequency = input.digestFrequency;
  }

  return patch;
}

async function createDefaultNotificationSettings(
  userId: string,
): Promise<NotificationSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notification_settings")
    .insert({
      user_id: userId,
      email_post_success: DEFAULT_NOTIFICATION_SETTINGS.emailPostSuccess,
      email_post_failed: DEFAULT_NOTIFICATION_SETTINGS.emailPostFailed,
      email_weekly_summary: DEFAULT_NOTIFICATION_SETTINGS.emailWeeklySummary,
      email_daily_reminder: DEFAULT_NOTIFICATION_SETTINGS.emailDailyReminder,
      email_product_updates: DEFAULT_NOTIFICATION_SETTINGS.emailProductUpdates,
      digest_frequency: DEFAULT_NOTIFICATION_SETTINGS.digestFrequency,
    })
    .select(NOTIFICATION_COLUMNS)
    .single();

  throwIfError(error);

  return mapRowToSettings(data as NotificationSettingsRow);
}

/** Load notification settings for the signed-in user. */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("notification_settings")
    .select(NOTIFICATION_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    return createDefaultNotificationSettings(userId);
  }

  return mapRowToSettings(data as NotificationSettingsRow);
}

/** Update notification settings for the signed-in user (creates row if missing). */
export async function updateNotificationSettings(
  input: UpdateNotificationSettingsInput,
): Promise<NotificationSettings> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  let existing: NotificationSettings;
  try {
    existing = await getNotificationSettings();
  } catch (error) {
    if (
      error instanceof NotificationsServiceError &&
      (error.code === "PGRST205" || error.code === "42P01")
    ) {
      throw error;
    }
    existing = await createDefaultNotificationSettings(userId);
  }

  const patch = mapUpdateInputToRow(input);

  if (Object.keys(patch).length === 0) {
    return existing;
  }

  const { data, error } = await supabase
    .from("notification_settings")
    .update(patch)
    .eq("user_id", userId)
    .select(NOTIFICATION_COLUMNS)
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    // Row may not exist yet if create was skipped — insert with merged values.
    const merged = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...existing,
      ...input,
    };
    const { data: created, error: insertError } = await supabase
      .from("notification_settings")
      .insert({
        user_id: userId,
        email_post_success: merged.emailPostSuccess,
        email_post_failed: merged.emailPostFailed,
        email_weekly_summary: merged.emailWeeklySummary,
        email_daily_reminder: merged.emailDailyReminder,
        email_product_updates: merged.emailProductUpdates,
        digest_frequency: merged.digestFrequency,
      })
      .select(NOTIFICATION_COLUMNS)
      .single();

    throwIfError(insertError);
    return mapRowToSettings(created as NotificationSettingsRow);
  }

  return mapRowToSettings(data as NotificationSettingsRow);
}
