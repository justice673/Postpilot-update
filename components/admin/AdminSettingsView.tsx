"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiSave } from "react-icons/fi";
import { savePlatformSettingsAction } from "@/app/admin/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PlatformSettings } from "@/lib/types/platform-settings";
import { toast } from "sonner";

export default function AdminSettingsView({
  initialSettings,
}: {
  initialSettings: PlatformSettings;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [appName, setAppName] = useState(initialSettings.appName);
  const [supportEmail, setSupportEmail] = useState(
    initialSettings.supportEmail,
  );
  const [maintenance, setMaintenance] = useState(
    initialSettings.maintenanceMode,
  );
  const [signupsOpen, setSignupsOpen] = useState(initialSettings.signupsOpen);
  const [aiEnabled, setAiEnabled] = useState(initialSettings.aiWritingEnabled);

  function onSave(e: FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const result = await savePlatformSettingsAction({
        appName,
        supportEmail,
        signupsOpen,
        maintenanceMode: maintenance,
        aiWritingEnabled: aiEnabled,
      });

      if (!result.success) {
        toast.error("Couldn’t save settings", {
          description: result.error,
        });
        return;
      }

      toast.success("Settings saved");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 md:gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Site
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-none">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
          System preferences for the Postpilot product and marketing site.
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Brand and support details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="app-name">App name</Label>
              <Input
                id="app-name"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                disabled={pending}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="support-email">Support email</Label>
              <Input
                id="support-email"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                disabled={pending}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Access</CardTitle>
            <CardDescription>
              Registration and platform availability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow
              title="Open signups"
              description="Allow new users to create accounts"
              checked={signupsOpen}
              onChange={setSignupsOpen}
              disabled={pending}
            />
            <ToggleRow
              title="Maintenance mode"
              description="Show a maintenance screen on public routes"
              checked={maintenance}
              onChange={setMaintenance}
              disabled={pending}
            />
            <ToggleRow
              title="AI writing"
              description="Enable Gemini expand across all workspaces"
              checked={aiEnabled}
              onChange={setAiEnabled}
              disabled={pending}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" className="shadow-none" disabled={pending}>
            <FiSave className="size-4" />
            {pending ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3 text-left transition-colors hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span>
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
