"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FaLinkedinIn, FaTiktok } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";
import { SiX, SiYoutube } from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

const baseChannels: Omit<Channel, "status" | "handle">[] = [
  {
    id: "x",
    name: "X",
    description: "Compose, schedule, and publish posts.",
    Icon: SiX,
    markClass: "bg-[#111111] text-white",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Compose, schedule, and publish professional posts.",
    Icon: FaLinkedinIn,
    markClass: "bg-[#0a66c2] text-white",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Feed & carousels — on the roadmap.",
    Icon: RiInstagramFill,
    markClass:
      "bg-[linear-gradient(135deg,#f58529,#dd2a7b,#8134af)] text-white",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Short-form drops — coming soon.",
    Icon: FaTiktok,
    markClass: "bg-[#111111] text-white",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Community posts — coming soon.",
    Icon: SiYoutube,
    markClass: "bg-[#ff0000] text-white",
  },
];

export default function SettingsView({
  xConnected = false,
  xUsername = null,
  linkedinConnected = false,
  linkedinUsername = null,
}: {
  xConnected?: boolean;
  xUsername?: string | null;
  linkedinConnected?: boolean;
  linkedinUsername?: string | null;
}) {
  const router = useRouter();
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const channels: Channel[] = useMemo(
    () =>
      baseChannels.map((channel) => {
        if (channel.id === "x") {
          return {
            ...channel,
            status: xConnected ? "connected" : "available",
            handle: xConnected && xUsername ? `@${xUsername}` : undefined,
          };
        }
        if (channel.id === "linkedin") {
          return {
            ...channel,
            status: linkedinConnected ? "connected" : "available",
            handle:
              linkedinConnected && linkedinUsername
                ? linkedinUsername
                : undefined,
          };
        }
        return { ...channel, status: "soon" as const };
      }),
    [xConnected, xUsername, linkedinConnected, linkedinUsername],
  );

  const disconnectTarget = channels.find((c) => c.id === disconnectId) ?? null;

  async function confirmDisconnect() {
    if (disconnectId !== "x" && disconnectId !== "linkedin") return;
    setDisconnecting(true);
    setError(null);

    const label = disconnectId === "linkedin" ? "LinkedIn" : "X";
    const endpoint =
      disconnectId === "linkedin"
        ? "/api/auth/linkedin/disconnect"
        : "/api/auth/x/disconnect";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error || `Failed to disconnect ${label}.`);
      }
      setDisconnectId(null);
      toast.success(`${label} disconnected`, {
        description: "You can reconnect anytime from Settings.",
      });
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : `Failed to disconnect ${label}.`;
      setError(message);
      toast.error(`Couldn’t disconnect ${label}`, { description: message });
    } finally {
      setDisconnecting(false);
    }
  }

  function connectChannel(id: string) {
    if (id !== "x" && id !== "linkedin") return;
    setConnectingId(id);
    window.location.href =
      id === "linkedin" ? "/api/auth/linkedin" : "/api/auth/x";
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Settings
          </p>
          <h1 className="mt-1 font-[family-name:var(--pp-display)] text-3xl font-medium tracking-tight sm:text-[2.5rem] sm:leading-none">
            Connected channels
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Manage where Postpilot can publish. X and LinkedIn are live; more
            networks are on the way.
          </p>
        </div>
        <Link
          href="/onboarding/connect"
          className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
        >
          Open connect flow
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {channels.map((channel) => (
          <Card key={channel.id} className="border-border shadow-none">
            <CardContent className="flex h-full flex-col gap-4 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl",
                    channel.markClass,
                  )}
                >
                  <channel.Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold tracking-tight">{channel.name}</p>
                    {channel.status === "connected" ? (
                      <Badge className="rounded-md bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">
                        Connected
                      </Badge>
                    ) : channel.status === "soon" ? (
                      <Badge variant="secondary" className="rounded-md">
                        Soon
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-md">
                        Available
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {channel.handle ? (
                      <span className="font-medium text-foreground">
                        {channel.handle}
                      </span>
                    ) : null}
                    {channel.handle ? " · " : null}
                    {channel.description}
                  </p>
                </div>
              </div>

              <div className="mt-auto flex shrink-0 items-center">
                {channel.status === "connected" ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-500 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDisconnectId(channel.id)}
                  >
                    Disconnect
                  </Button>
                ) : channel.status === "available" ? (
                  <Button
                    type="button"
                    onClick={() => connectChannel(channel.id)}
                    disabled={connectingId === channel.id}
                  >
                    {connectingId === channel.id ? "Connecting…" : "Connect"}
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" disabled>
                    Coming soon
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={Boolean(disconnectId)}
        onOpenChange={(open) => {
          if (!open) setDisconnectId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect {disconnectTarget?.name}?</DialogTitle>
            <DialogDescription>
              You won’t be able to schedule or publish to{" "}
              {disconnectTarget?.name} until you connect again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDisconnectId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={disconnecting}
              onClick={() => void confirmDisconnect()}
            >
              {disconnecting ? "Disconnecting…" : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
