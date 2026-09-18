"use client";

import { useState } from "react";
import {
  HiOutlineBell,
  HiOutlineCalendarDays,
  HiOutlineEnvelope,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { SiX } from "react-icons/si";
import { saveNotificationSettingsAction } from "@/app/dashboard/notifications/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type {
  DigestFrequency,
  NotificationSettings,
} from "@/lib/types/notifications";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DIGEST_OPTIONS: { value: DigestFrequency; label: string; hint: string }[] =
  [
    {
      value: "instant",
      label: "Instant",
      hint: "Send as they happen",
    },
    {
      value: "daily",
      label: "Daily",
      hint: "One digest at 8:00 AM",
    },
    {
      value: "weekly",
      label: "Weekly",
      hint: "Sundays at 9:00 AM",
    },
  ];

export default function NotificationsView({
  initialSettings,
}: {
  initialSettings: NotificationSettings;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle<K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const result = await saveNotificationSettingsAction({
      emailPostSuccess: settings.emailPostSuccess,
      emailPostFailed: settings.emailPostFailed,
      emailWeeklySummary: settings.emailWeeklySummary,
      emailDailyReminder: settings.emailDailyReminder,
      emailProductUpdates: settings.emailProductUpdates,
      digestFrequency: settings.digestFrequency,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.error);
      toast.error("Couldn’t save preferences", { description: result.error });
      return;
    }
    setSettings(result.data);
    setSaved(true);
    toast.success("Preferences saved");
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 md:gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Notifications
        </p>
        <h1 className="mt-1 font-[family-name:var(--pp-display)] text-3xl font-medium tracking-tight sm:text-[2.5rem] sm:leading-none">
          Alerts & email
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Choose what Postpilot emails you about your publishing queue. Emails
          send when
          SMTP is configured on the server.
        </p>
      </div>

      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
            Publishing
          </CardTitle>
          <CardDescription>
            Alerts tied to scheduled posts going live on your channels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            icon={HiOutlineBell}
            title="Publish confirmations"
            description="Email when a scheduled post goes live."
            checked={settings.emailPostSuccess}
            onChange={(v) => toggle("emailPostSuccess", v)}
          />
          <ToggleRow
            icon={HiOutlineExclamationTriangle}
            title="Failed publishes"
            description="Alert me if a post fails so I can reconnect and retry."
            checked={settings.emailPostFailed}
            onChange={(v) => toggle("emailPostFailed", v)}
          />
          <ToggleRow
            icon={SiX}
            title="Weekly summary"
            description="A Monday summary of what published and what’s still queued."
            checked={settings.emailWeeklySummary}
            onChange={(v) => toggle("emailWeeklySummary", v)}
          />
          <ToggleRow
            icon={HiOutlineCalendarDays}
            title="Daily schedule reminder"
            description="Morning email listing posts scheduled for today."
            checked={settings.emailDailyReminder}
            onChange={(v) => toggle("emailDailyReminder", v)}
          />
        </CardContent>
      </Card>

      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
            Product updates
          </CardTitle>
          <CardDescription>
            Optional notes when we ship channels or compose features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            icon={HiOutlineEnvelope}
            title="Product emails"
            description="New networks, AI compose improvements, and tips."
            checked={settings.emailProductUpdates}
            onChange={(v) => toggle("emailProductUpdates", v)}
          />
        </CardContent>
      </Card>

      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
            Delivery
          </CardTitle>
          <CardDescription>
            How often non-urgent notifications are grouped and sent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="digest-frequency">Digest frequency</Label>
            <select
              id="digest-frequency"
              value={settings.digestFrequency}
              onChange={(e) =>
                toggle("digestFrequency", e.target.value as DigestFrequency)
              }
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {DIGEST_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.hint}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Failed post alerts are always sent immediately, regardless of
              digest setting.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          className="rounded-md shadow-none"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? "Saving…" : "Save preferences"}
        </Button>
        {saved ? (
          <span className="text-sm font-medium text-emerald-700">Saved</span>
        ) : null}
        {error ? (
          <span className="text-sm font-medium text-destructive">{error}</span>
        ) : null}
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
    >
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      <span
        className={cn(
          "relative mt-1 h-6 w-10 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
