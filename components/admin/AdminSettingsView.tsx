"use client";

import { FormEvent, useState } from "react";
import { FiSave } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
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

export default function AdminSettingsView() {
  const [appName, setAppName] = useState("Postpilot");
  const [supportEmail, setSupportEmail] = useState("support@postpilot.app");
  const [maintenance, setMaintenance] = useState(false);
  const [signupsOpen, setSignupsOpen] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  function onSave(e: FormEvent) {
    e.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
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
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="support-email">Support email</Label>
              <Input
                id="support-email"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Access</CardTitle>
            <CardDescription>Registration and platform availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow
              title="Open signups"
              description="Allow new users to create accounts"
              checked={signupsOpen}
              onChange={setSignupsOpen}
            />
            <ToggleRow
              title="Maintenance mode"
              description="Show a maintenance screen on public routes"
              checked={maintenance}
              onChange={setMaintenance}
            />
            <ToggleRow
              title="AI writing"
              description="Enable Gemini expand across all workspaces"
              checked={aiEnabled}
              onChange={setAiEnabled}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {saved ? <Badge variant="success">Saved</Badge> : null}
          <Button type="submit" className="shadow-none">
            <FiSave className="size-4" />
            Save settings
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
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3 text-left transition-colors hover:border-primary/30"
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
