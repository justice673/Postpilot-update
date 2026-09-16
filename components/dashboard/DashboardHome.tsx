"use client";

import Link from "next/link";
import { GoClock } from "react-icons/go";
import { HiOutlineSparkles } from "react-icons/hi2";
import { IoCreateOutline } from "react-icons/io5";
import { PiCalendarLight, PiCheckCircle } from "react-icons/pi";
import { SiX } from "react-icons/si";
import { ChartAreaPosts } from "@/components/dashboard/ChartAreaPosts";
import { ChartBarCompose } from "@/components/dashboard/ChartBarCompose";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const kpis = [
  {
    label: "Scheduled today",
    value: "4",
    hint: "In your X queue",
    icon: PiCalendarLight,
  },
  {
    label: "Published today",
    value: "2",
    hint: "Went live cleanly",
    icon: PiCheckCircle,
  },
  {
    label: "AI expands",
    value: "8",
    hint: "Gemini this week",
    icon: HiOutlineSparkles,
  },
  {
    label: "Next post",
    value: "02:14:08",
    hint: "Thread drop · 11:15 AM",
    icon: GoClock,
  },
];

const queue = [
  {
    title: "Product teaser",
    body: "Shipping the new compose flow this week — here’s what’s new.",
    time: "9:00 AM",
    status: "Scheduled" as const,
  },
  {
    title: "Hot take",
    body: "Most scheduling tools are calendars with lipstick. We built a queue.",
    time: "1:30 PM",
    status: "Scheduled" as const,
  },
  {
    title: "Weekly recap",
    body: "Three wins, one miss, and what we’re shipping next Monday.",
    time: "6:00 PM",
    status: "Draft" as const,
  },
  {
    title: "Ship update",
    body: "Posted yesterday — still picking up replies.",
    time: "Yesterday",
    status: "Published" as const,
  },
];

const activity = [
  { text: "Published “Ship update” to X", time: "2h ago" },
  { text: "Gemini expanded a prompt into a draft", time: "4h ago" },
  { text: "Rescheduled “Hot take” to 1:30 PM", time: "5h ago" },
  { text: "Connected X account via OAuth", time: "Yesterday" },
];

export default function DashboardHome() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            {today}
          </p>
          <h1 className="mt-1 font-[family-name:var(--pp-display)] text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-none">
            Welcome back, Justice
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground sm:text-[15px]">
            Your X queue is set. Draft the next idea or let Gemini expand a
            prompt.
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

      {/* KPIs */}
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
              <p className="font-[family-name:var(--pp-display)] text-2xl font-medium tracking-tight sm:text-3xl">
                {kpi.value}
              </p>
              <p className="text-xs text-muted-foreground">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next post + queue */}
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="overflow-hidden border-border bg-[#2b6dcf] text-white shadow-none">
          <CardContent className="flex h-full flex-col justify-between gap-8 p-6 sm:p-7">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold">
                <SiX className="size-3" />
                Next on X
              </div>
              <p className="font-[family-name:var(--pp-display)] text-4xl font-medium tracking-tight sm:text-5xl">
                02:14:08
              </p>
              <p className="mt-2 text-sm text-white/80">until publish</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">Thread drop</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/80">
                    Hot take on shipping in public — keep it sharp, under 280.
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-white/90">
                  11:15 AM
                </span>
              </div>
              <Link
                href="/dashboard/create"
                className="mt-4 inline-flex text-sm font-semibold text-white underline-offset-4 hover:underline"
              >
                Edit post →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
                Today&apos;s queue
              </CardTitle>
              <CardDescription>What&apos;s lined up on X</CardDescription>
            </div>
            <Link
              href="/dashboard/schedule"
              className="text-sm font-semibold text-primary hover:text-[#1e4f9a]"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-1 p-3 pt-0 sm:p-4 sm:pt-0">
            {queue.map((item) => (
              <Link
                key={item.title}
                href="/dashboard/create"
                className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/70"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                  {item.time === "Yesterday" ? "✓" : item.time.split(" ")[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{item.title}</p>
                    <Badge
                      variant={
                        item.status === "Published"
                          ? "success"
                          : item.status === "Draft"
                            ? "secondary"
                            : "default"
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
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <ChartAreaPosts />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartBarCompose />
        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
              Recent activity
            </CardTitle>
            <CardDescription>
              Latest moves across compose, schedule, and publish.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {activity.map((item, i) => (
              <div
                key={item.text}
                className={cn(
                  "flex items-start gap-3 py-3",
                  i !== activity.length - 1 && "border-b border-border",
                )}
              >
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
