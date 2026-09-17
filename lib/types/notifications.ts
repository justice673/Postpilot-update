export type DigestFrequency = "instant" | "daily" | "weekly";

export interface NotificationSettings {
  id?: string;
  emailPostSuccess: boolean;
  emailPostFailed: boolean;
  emailWeeklySummary: boolean;
  emailDailyReminder: boolean;
  emailProductUpdates: boolean;
  digestFrequency: DigestFrequency;
}

export interface NotificationSettingsRow {
  id: string;
  user_id: string;
  email_post_success: boolean;
  email_post_failed: boolean;
  email_weekly_summary: boolean;
  email_daily_reminder: boolean;
  email_product_updates: boolean;
  digest_frequency: DigestFrequency;
  created_at: string;
  updated_at: string;
}

export interface UpdateNotificationSettingsInput {
  emailPostSuccess?: boolean;
  emailPostFailed?: boolean;
  emailWeeklySummary?: boolean;
  emailDailyReminder?: boolean;
  emailProductUpdates?: boolean;
  digestFrequency?: DigestFrequency;
}

export const DEFAULT_NOTIFICATION_SETTINGS: Omit<
  NotificationSettings,
  "id"
> = {
  emailPostSuccess: true,
  emailPostFailed: true,
  emailWeeklySummary: true,
  emailDailyReminder: false,
  emailProductUpdates: false,
  digestFrequency: "instant",
};
