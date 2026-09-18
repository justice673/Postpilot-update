import "server-only";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { appBaseUrl, sendMail } from "@/lib/services/email";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettings,
} from "@/lib/types/notifications";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function getUserEmail(userId: string): Promise<string | null> {
  const admin = getAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user?.email) return null;
  return data.user.email;
}

async function getSettingsForUser(
  userId: string,
): Promise<NotificationSettings> {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("notification_settings")
    .select(
      "id, email_post_success, email_post_failed, email_weekly_summary, email_daily_reminder, email_product_updates, digest_frequency",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return { ...DEFAULT_NOTIFICATION_SETTINGS };
  }

  return {
    id: data.id,
    emailPostSuccess: data.email_post_success,
    emailPostFailed: data.email_post_failed,
    emailWeeklySummary: data.email_weekly_summary,
    emailDailyReminder: data.email_daily_reminder,
    emailProductUpdates: data.email_product_updates,
    digestFrequency: data.digest_frequency,
  };
}

function previewContent(content: string, max = 180): string {
  const trimmed = content.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function wrapHtml(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f7f9;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#2563eb">Postpilot</p>
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:600">${title}</h1>
      ${bodyHtml}
      <p style="margin:24px 0 0;font-size:12px;color:#6b7280">
        Manage alerts in
        <a href="${appBaseUrl()}/dashboard/notifications" style="color:#2563eb">Notifications</a>.
      </p>
    </div>
  </body>
</html>`;
}

/** Email when a scheduled post publishes successfully. */
export async function notifyPostPublished(input: {
  userId: string;
  content: string;
  tweetId?: string;
  xUsername?: string | null;
  linkedInPostId?: string;
  linkedInUsername?: string | null;
}): Promise<void> {
  try {
    const [settings, email] = await Promise.all([
      getSettingsForUser(input.userId),
      getUserEmail(input.userId),
    ]);

    if (!settings.emailPostSuccess || !email) return;

    const preview = previewContent(input.content);
    const isLinkedIn = Boolean(input.linkedInPostId || input.linkedInUsername);
    const handle = isLinkedIn
      ? input.linkedInUsername || "LinkedIn"
      : input.xUsername
        ? `@${input.xUsername}`
        : "X";
    const network = isLinkedIn ? "LinkedIn" : "X";
    const postUrl = isLinkedIn
      ? `${appBaseUrl()}/dashboard/schedule`
      : input.tweetId
        ? `https://x.com/i/web/status/${input.tweetId}`
        : `${appBaseUrl()}/dashboard/schedule`;
    const openLabel = isLinkedIn ? "Open schedule" : "Open on X";

    const text = [
      `Your scheduled post went live on ${network}.`,
      "",
      preview,
      "",
      `Account: ${handle}`,
      `View: ${postUrl}`,
    ].join("\n");

    await sendMail({
      to: email,
      subject: "Your Postpilot post is live",
      text,
      html: wrapHtml(
        "Your post is live",
        `<p style="margin:0 0 12px;line-height:1.5">Published to ${handle} on ${network}.</p>
         <blockquote style="margin:0 0 16px;padding:12px 14px;border-left:3px solid #2563eb;background:#f8fafc;border-radius:6px;line-height:1.5">${preview}</blockquote>
         <p style="margin:0"><a href="${postUrl}" style="color:#2563eb">${openLabel}</a></p>`,
      ),
    });
  } catch (error) {
    console.error("[notification-mail] publish notify failed:", error);
  }
}

/** Email when a post fails — always immediate when enabled. */
export async function notifyPostFailed(input: {
  userId: string;
  content: string;
  reason?: string;
}): Promise<void> {
  try {
    const [settings, email] = await Promise.all([
      getSettingsForUser(input.userId),
      getUserEmail(input.userId),
    ]);

    if (!settings.emailPostFailed || !email) return;

    const preview = previewContent(input.content);
    const reason = input.reason?.trim() || "Unknown error";
    const scheduleUrl = `${appBaseUrl()}/dashboard/schedule`;

    const text = [
      "A scheduled Postpilot post failed to publish.",
      "",
      preview,
      "",
      `Reason: ${reason}`,
      `Fix / retry: ${scheduleUrl}`,
    ].join("\n");

    await sendMail({
      to: email,
      subject: "Postpilot publish failed",
      text,
      html: wrapHtml(
        "Publish failed",
        `<p style="margin:0 0 12px;line-height:1.5">We couldn’t publish this post to X.</p>
         <blockquote style="margin:0 0 16px;padding:12px 14px;border-left:3px solid #ef4444;background:#fef2f2;border-radius:6px;line-height:1.5">${preview}</blockquote>
         <p style="margin:0 0 12px;color:#991b1b"><strong>Reason:</strong> ${reason}</p>
         <p style="margin:0"><a href="${scheduleUrl}" style="color:#2563eb">Open schedule</a></p>`,
      ),
    });
  } catch (error) {
    console.error("[notification-mail] fail notify failed:", error);
  }
}

type DigestUser = {
  userId: string;
  email: string;
  settings: NotificationSettings;
};

async function listUsersWithSettings(): Promise<DigestUser[]> {
  const admin = getAdminClient();
  const { data: rows, error } = await admin
    .from("notification_settings")
    .select(
      "user_id, email_post_success, email_post_failed, email_weekly_summary, email_daily_reminder, email_product_updates, digest_frequency",
    );

  if (error || !rows?.length) return [];

  const results: DigestUser[] = [];

  for (const row of rows) {
    const email = await getUserEmail(row.user_id);
    if (!email) continue;
    results.push({
      userId: row.user_id,
      email,
      settings: {
        emailPostSuccess: row.email_post_success,
        emailPostFailed: row.email_post_failed,
        emailWeeklySummary: row.email_weekly_summary,
        emailDailyReminder: row.email_daily_reminder,
        emailProductUpdates: row.email_product_updates,
        digestFrequency: row.digest_frequency,
      },
    });
  }

  return results;
}

/** Morning reminder: posts scheduled for today (UTC day window). */
export async function sendDailyReminders(): Promise<{ sent: number }> {
  const admin = getAdminClient();
  const users = await listUsersWithSettings();
  const eligible = users.filter((u) => u.settings.emailDailyReminder);

  if (eligible.length === 0) return { sent: 0 };

  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  let sent = 0;

  for (const user of eligible) {
    const { data: posts } = await admin
      .from("posts")
      .select("id, content, scheduled_at, status")
      .eq("user_id", user.userId)
      .eq("status", "pending")
      .gte("scheduled_at", start.toISOString())
      .lt("scheduled_at", end.toISOString())
      .order("scheduled_at", { ascending: true });

    const list = posts ?? [];
    if (list.length === 0) continue;

    const lines = list.map((post, index) => {
      const time = new Date(post.scheduled_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      });
      return `${index + 1}. ${time} UTC — ${previewContent(post.content, 100)}`;
    });

    const text = [
      `You have ${list.length} post${list.length === 1 ? "" : "s"} scheduled for today.`,
      "",
      ...lines,
      "",
      `Schedule: ${appBaseUrl()}/dashboard/schedule`,
    ].join("\n");

    const htmlList = lines
      .map(
        (line) =>
          `<li style="margin:0 0 8px;line-height:1.45">${line.replace(/^\d+\.\s*/, "")}</li>`,
      )
      .join("");

    const ok = await sendMail({
      to: user.email,
      subject: `Today’s Postpilot queue (${list.length})`,
      text,
      html: wrapHtml(
        "Today’s schedule",
        `<p style="margin:0 0 12px">You have <strong>${list.length}</strong> pending post${list.length === 1 ? "" : "s"} today.</p>
         <ol style="margin:0 0 16px;padding-left:20px">${htmlList}</ol>
         <p style="margin:0"><a href="${appBaseUrl()}/dashboard/schedule" style="color:#2563eb">Open schedule</a></p>`,
      ),
    });

    if (ok) sent += 1;
  }

  return { sent };
}

/** Weekly summary of published / failed / still queued. */
export async function sendWeeklySummaries(): Promise<{ sent: number }> {
  const admin = getAdminClient();
  const users = await listUsersWithSettings();
  const eligible = users.filter((u) => u.settings.emailWeeklySummary);

  if (eligible.length === 0) return { sent: 0 };

  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 7);

  let sent = 0;

  for (const user of eligible) {
    const { data: posts } = await admin
      .from("posts")
      .select("id, content, status, scheduled_at, posted_at")
      .eq("user_id", user.userId)
      .gte("scheduled_at", start.toISOString())
      .lte("scheduled_at", end.toISOString());

    const list = posts ?? [];
    const published = list.filter((p) => p.status === "posted").length;
    const failed = list.filter((p) => p.status === "failed").length;
    const pending = list.filter((p) => p.status === "pending").length;

    if (published + failed + pending === 0) continue;

    const text = [
      "Your Postpilot week in review",
      "",
      `Published: ${published}`,
      `Failed: ${failed}`,
      `Still queued: ${pending}`,
      "",
      `Analytics: ${appBaseUrl()}/dashboard/analytics`,
    ].join("\n");

    const ok = await sendMail({
      to: user.email,
      subject: "Your Postpilot weekly summary",
      text,
      html: wrapHtml(
        "Weekly summary",
        `<p style="margin:0 0 16px;line-height:1.5">Here’s how your queue performed over the last 7 days.</p>
         <ul style="margin:0 0 16px;padding-left:20px;line-height:1.6">
           <li><strong>${published}</strong> published</li>
           <li><strong>${failed}</strong> failed</li>
           <li><strong>${pending}</strong> still queued</li>
         </ul>
         <p style="margin:0"><a href="${appBaseUrl()}/dashboard/analytics" style="color:#2563eb">Open analytics</a></p>`,
      ),
    });

    if (ok) sent += 1;
  }

  return { sent };
}
