"use client";

import { useState } from "react";
import {
  HiOutlineBell,
  HiOutlineEnvelope,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { SiX } from "react-icons/si";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NotificationsView() {
  const [notifyPublish, setNotifyPublish] = useState(true);
  const [notifyFail, setNotifyFail] = useState(true);
  const [notifyDigest, setNotifyDigest] = useState(false);
  const [notifyProduct, setNotifyProduct] = useState(true);
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
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
          Choose what Postpilot emails you about your X queue.
        </p>
      </div>

      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
            Publishing
          </CardTitle>
          <CardDescription>
            Alerts tied to scheduled posts going live on X.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            icon={HiOutlineBell}
            title="Publish confirmations"
            description="Email when a scheduled post goes live."
            checked={notifyPublish}
            onChange={setNotifyPublish}
          />
          <ToggleRow
            icon={HiOutlineExclamationTriangle}
            title="Failed publishes"
            description="Alert me if a post fails so I can reconnect and retry."
            checked={notifyFail}
            onChange={setNotifyFail}
          />
          <ToggleRow
            icon={SiX}
            title="Weekly digest"
            description="A Monday summary of what published and what’s still queued."
            checked={notifyDigest}
            onChange={setNotifyDigest}
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
            checked={notifyProduct}
            onChange={setNotifyProduct}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" className="rounded-md shadow-none" onClick={save}>
          Save preferences
        </Button>
        {saved ? (
          <span className="text-sm font-medium text-emerald-700">Saved</span>
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
