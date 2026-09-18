"use client";

import Link from "next/link";
import { GoClock } from "react-icons/go";
import { HiOutlineSparkles } from "react-icons/hi2";
import { IoCreateOutline } from "react-icons/io5";
import { PiCalendarLight, PiCheckCircle, PiQueue } from "react-icons/pi";
import { FaLinkedinIn } from "react-icons/fa6";
import { SiX } from "react-icons/si";
import { ChartAreaPosts } from "@/components/dashboard/ChartAreaPosts";
import { ChartBarCompose } from "@/components/dashboard/ChartBarCompose";
import CountdownTimer from "@/components/dashboard/CountdownTimer";
import {
  PlatformBadge,
  PlatformMark,
} from "@/components/dashboard/PlatformMark";
import {
  formatConnectedChannels,
  platformLabel,
  resolvePlatform,
} from "@/lib/platforms";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import type { DashboardChartPoint } from "@/lib/types/analytics";
import type { PostingTimeBucket } from "@/lib/types/analytics";
import type {
  ActivityItem,
  PostPlatform,
  ScheduledPost,
} from "@/lib/types/posts";
import { cn } from "@/lib/utils";

type QueueItem = {
  id: string;
  body: string;
  time: string;
  status: "Scheduled" | "Published" | "Failed";
  platform: PostPlatform;
  href: string;
};

export default function DashboardHome({
  displayName,
  xConnected,
  xUsername,
  linkedinConnected = false,
  linkedinUsername = null,
  scheduledToday,
  publishedToday,
  pendingCount,
  nextPost,
  queue,
  activity,
  chartData,
  postingTimes,
  bestTime,
  rangeActive = false,
  rangeLabel = null,
}: {
  displayName: string;
  xConnected: boolean;
  xUsername: string | null;
  linkedinConnected?: boolean;
  linkedinUsername?: string | null;
  scheduledToday: number;
  publishedToday: number;
  pendingCount: number;
  nextPost: ScheduledPost | null;
  queue: QueueItem[];
  activity: ActivityItem[];
  chartData: DashboardChartPoint[];
  postingTimes: PostingTimeBucket[];
  bestTime: string;
  rangeActive?: boolean;
  rangeLabel?: string | null;
}) {
  const anyConnected = xConnected || linkedinConnected;
  const connectedLabel = formatConnectedChannels({
    xConnected,
    xUsername,
    linkedinConnected,
    linkedinUsername,
  });
  const nextPlatform = nextPost
    ? resolvePlatform(nextPost.platform)
    : null;
  const NextIcon =
    nextPlatform === "linkedin" ? FaLinkedinIn : SiX;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const firstName = displayName.trim().split(/\s+/)[0] || "there";

  const kpis = [
    {
      label: rangeActive ? "Scheduled" : "Scheduled today",
      value: String(scheduledToday),
      hint: rangeActive ? "Pending in range" : "In your queue",
      icon: PiCalendarLight,
    },
    {
      label: rangeActive ? "Published" : "Published today",
      value: String(publishedToday),
      hint: rangeActive ? "Posted in range" : "Went live cleanly",
      icon: PiCheckCircle,
    },
    {
      label: rangeActive ? "Pending in range" : "Pending queue",
      value: String(pendingCount),
      hint: rangeActive ? "Still waiting" : "Waiting to publish",
      icon: PiQueue,
    },
    {
      label: "Next post",
      value: nextPost ? (
        <CountdownTimer
          targetDate={nextPost.scheduledAt}
          className="font-[family-name:var(--pp-display)] text-2xl font-medium tracking-tight tabular-nums sm:text-3xl"
        />
      ) : (
        "—"
      ),
      hint: nextPost
        ? new Date(nextPost.scheduledAt).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })
        : "Nothing upcoming",
      icon: GoClock,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            {today}
          </p>
          <h1 className="mt-1 font-[family-name:var(--pp-display)] text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-none">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground sm:text-[15px]">
            {rangeActive && rangeLabel
              ? `Showing activity for ${rangeLabel}.`
              : anyConnected
                ? `Your queue is ready${
                    connectedLabel ? ` · ${connectedLabel}` : ""
                  }. Draft the next idea or let Gemini expand a prompt.`
                : "Connect X or LinkedIn to start scheduling — then draft or expand with AI."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/create"
            className={cn(buttonVariants(), "rounded-md shadow-none")}
          >
            <IoCreateOutline className="size-4" />
            Create post
          </Link>
          <Link
            href="/dashboard/create"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-md shadow-none",
            )}
          >
            <HiOutlineSparkles className="size-4" />
            Expand with AI
          </Link>
        </div>
      </div>

      {!anyConnected ? (
        <div className="flex flex-col gap-3 rounded-xl border border-[#dbe7f8] bg-[#f7faff] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#111111] text-white">
              <SiX className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Connect a channel to publish</p>
              <p className="text-xs text-muted-foreground">
                Scheduling needs a linked X or LinkedIn account.
              </p>
            </div>
          </div>
          <Link
            href="/onboarding/connect"
            className={cn(buttonVariants(), "w-fit rounded-md shadow-none")}
          >
            Connect channels
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className="border-border bg-card/80 shadow-none"
          >
            <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {kpi.label}
                </span>
                <kpi.icon className="size-4 text-primary" />
              </div>
              <div className="font-[family-name:var(--pp-display)] text-2xl font-medium tracking-tight sm:text-3xl">
                {kpi.value}
              </div>
              <p className="text-xs text-muted-foreground">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="overflow-hidden border-border bg-[#2b6dcf] text-white shadow-none">
          <CardContent className="flex h-full flex-col justify-between gap-8 p-6 sm:p-7">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold">
                <NextIcon className="size-3" />
                {nextPlatform
                  ? `Next on ${platformLabel(nextPlatform)}`
                  : "Next up"}
              </div>
              {nextPost ? (
                <>
                  <p className="font-[family-name:var(--pp-display)] text-4xl font-medium tracking-tight sm:text-5xl">
                    <CountdownTimer targetDate={nextPost.scheduledAt} />
                  </p>
                  <p className="mt-2 text-sm text-white/80">until publish</p>
                </>
              ) : (
                <>
                  <p className="font-[family-name:var(--pp-display)] text-3xl font-medium tracking-tight sm:text-4xl">
                    Queue is clear
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    Nothing scheduled next — create one.
                  </p>
                </>
              )}
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              {nextPost ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold">Upcoming post</p>
                        <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          <NextIcon className="size-2.5" />
                          {platformLabel(nextPost.platform)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-white/80">
                        {nextPost.content}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-white/90">
                      {new Date(nextPost.scheduledAt).toLocaleTimeString(
                        "en-US",
                        { hour: "numeric", minute: "2-digit" },
                      )}
                    </span>
                  </div>
                  <Link
                    href="/dashboard/schedule"
                    className="mt-4 inline-flex text-sm font-semibold text-white underline-offset-4 hover:underline"
                  >
                    Open schedule →
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard/create"
                  className="inline-flex text-sm font-semibold text-white underline-offset-4 hover:underline"
                >
                  Schedule a post →
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
                {rangeActive ? "Posts in range" : "Today's queue"}
              </CardTitle>
              <CardDescription>
                {rangeActive
                  ? rangeLabel
                    ? `Scheduled across ${rangeLabel}`
                    : "Posts in the selected range"
                  : "What's lined up across your channels"}
              </CardDescription>
            </div>
            <Link
              href="/dashboard/schedule"
              className="text-sm font-semibold text-primary hover:text-[#1e4f9a]"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-1 p-3 pt-0 sm:p-4 sm:pt-0">
            {queue.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {rangeActive
                    ? "No posts in this range."
                    : "Nothing queued for today."}
                </p>
                <Link
                  href="/dashboard/create"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "mt-3 rounded-md shadow-none",
                  )}
                >
                  Schedule a post
                </Link>
              </div>
            ) : (
              queue.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/70"
                >
                  <PlatformMark platform={item.platform} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {item.time}
                        </p>
                        <PlatformBadge platform={item.platform} />
                      </div>
                      <Badge
                        variant={
                          item.status === "Published"
                            ? "success"
                            : item.status === "Failed"
                              ? "danger"
                              : "warning"
                        }
                        className="shrink-0 rounded-md font-medium"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <ChartAreaPosts
        data={chartData}
        description={
          rangeActive && rangeLabel
            ? `By network · ${rangeLabel}`
            : "Scheduled vs published by network over the last 90 days"
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartBarCompose data={postingTimes} bestTime={bestTime} />
        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
              Recent activity
            </CardTitle>
            <CardDescription>
              {rangeActive
                ? "Publishes and failures in the selected range."
                : "Latest publishes and failures across your channels."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No publishes yet — your activity will show up here.
              </p>
            ) : (
              activity.map((item, i) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 py-3",
                    i !== activity.length - 1 && "border-b border-border",
                  )}
                >
                  <PlatformMark platform={item.platform} size="sm" className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {item.status === "posted" ? "Published" : "Failed"}
                      </p>
                      <PlatformBadge platform={item.platform} />
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          item.status === "posted"
                            ? "bg-emerald-500"
                            : "bg-red-500",
                        )}
                      />
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.content.slice(0, 72)}
                      {item.content.length > 72 ? "…" : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeTime(item.postedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
