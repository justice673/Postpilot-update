"use client";

import Link from "next/link";
import { useState } from "react";
import { FaLinkedinIn, FaTiktok } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";
import { SiX, SiYoutube } from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ChannelStatus = "connected" | "available" | "soon";

type Channel = {
  id: string;
  name: string;
  handle?: string;
  description: string;
  status: ChannelStatus;
  Icon: React.ComponentType<{ className?: string }>;
  markClass: string;
};

const initialChannels: Channel[] = [
  {
    id: "x",
    name: "X",
    handle: "@justice",
    description: "Compose, schedule, and publish posts.",
    status: "connected",
    Icon: SiX,
    markClass: "bg-[#111111] text-white",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Feed & carousels — on the roadmap.",
    status: "soon",
    Icon: RiInstagramFill,
    markClass:
      "bg-[linear-gradient(135deg,#f58529,#dd2a7b,#8134af)] text-white",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Professional posts — coming soon.",
    status: "soon",
    Icon: FaLinkedinIn,
    markClass: "bg-[#0a66c2] text-white",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Short-form drops — coming soon.",
    status: "soon",
    Icon: FaTiktok,
    markClass: "bg-[#111111] text-white",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Community posts — coming soon.",
    status: "soon",
    Icon: SiYoutube,
    markClass: "bg-[#ff0000] text-white",
  },
];

export default function SettingsView() {
  const [channels, setChannels] = useState(initialChannels);
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const disconnectTarget = channels.find((c) => c.id === disconnectId) ?? null;

  function confirmDisconnect() {
    if (!disconnectId) return;
    setDisconnecting(true);
    window.setTimeout(() => {
      setChannels((prev) =>
        prev.map((c) =>
          c.id === disconnectId
            ? {
                ...c,
                status: "available",
                handle: undefined,
              }
            : c,
        ),
      );
      setDisconnecting(false);
      setDisconnectId(null);
    }, 400);
  }

  function connectChannel(id: string) {
    const channel = channels.find((c) => c.id === id);
    if (!channel || channel.status === "soon") return;
    setConnectingId(id);
    window.setTimeout(() => {
      setChannels((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "connected",
                handle: c.id === "x" ? "@justice" : undefined,
              }
            : c,
        ),
      );
      setConnectingId(null);
    }, 700);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 md:gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Settings
        </p>
        <h1 className="mt-1 font-[family-name:var(--pp-display)] text-3xl font-medium tracking-tight sm:text-[2.5rem] sm:leading-none">
          Channels
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Manage connected socials. Profile and notifications live in the
          sidebar account menu.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-[family-name:var(--pp-display)] text-xl font-medium">
              Connected channels
            </h2>
            <p className="text-sm text-muted-foreground">
              X is live today. Other networks show here as they ship.
            </p>
          </div>
          <Link
            href="/onboarding/connect"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-md shadow-none self-start sm:self-auto",
            )}
          >
            Open connect flow
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {channels.map((channel) => {
            const isConnected = channel.status === "connected";
            const isSoon = channel.status === "soon";
            const isBusy = connectingId === channel.id;

            return (
              <Card
                key={channel.id}
                className={cn(
                  "border-border shadow-none",
                  isSoon && "opacity-85",
                )}
              >
                <CardContent className="flex flex-col gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-xl",
                        channel.markClass,
                      )}
                    >
                      <channel.Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{channel.name}</p>
                        {isConnected ? (
                          <Badge
                            variant="success"
                            className="rounded-md font-medium"
                          >
                            Connected
                          </Badge>
                        ) : isSoon ? (
                          <Badge
                            variant="secondary"
                            className="rounded-md font-medium"
                          >
                            Coming soon
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="rounded-md font-medium"
                          >
                            Not connected
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {isConnected && channel.handle
                          ? `${channel.handle} · ${channel.description}`
                          : channel.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isConnected ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-md border-red-200 text-red-600 shadow-none hover:bg-red-50 hover:text-red-700"
                        onClick={() => setDisconnectId(channel.id)}
                      >
                        Disconnect
                      </Button>
                    ) : isSoon ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-md shadow-none"
                        disabled
                      >
                        Notify me
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-md shadow-none"
                        disabled={isBusy}
                        onClick={() => connectChannel(channel.id)}
                      >
                        {isBusy ? "Connecting…" : `Connect ${channel.name}`}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog
        open={!!disconnectId}
        onOpenChange={(open) => {
          if (!open) setDisconnectId(null);
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              Disconnect {disconnectTarget?.name ?? "channel"}?
            </DialogTitle>
            <DialogDescription>
              {disconnectTarget?.id === "x"
                ? "You’ll stop publishing to X until you connect again. Scheduled posts will stay in your queue but won’t go live."
                : `You’ll remove ${disconnectTarget?.name ?? "this channel"} from Postpilot.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="shadow-none"
              disabled={disconnecting}
              onClick={() => setDisconnectId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white shadow-none hover:bg-red-700"
              disabled={disconnecting}
              onClick={confirmDisconnect}
            >
              {disconnecting ? "Disconnecting…" : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
