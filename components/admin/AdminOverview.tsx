"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineUserPlus,
} from "react-icons/hi2";
import { FaLinkedinIn } from "react-icons/fa6";
import { PiCheckCircle, PiClock, PiUsersThree, PiWarningCircle } from "react-icons/pi";
import { SiX } from "react-icons/si";
import { TiFolderOpen } from "react-icons/ti";
import { ChartAreaPosts } from "@/components/dashboard/ChartAreaPosts";
import { PlatformMark } from "@/components/dashboard/PlatformMark";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isIsoInRange, useAdminDateRange } from "@/lib/admin/date-range";
import { formatRelativeTime } from "@/lib/format";
import type { AdminOverview as AdminOverviewData } from "@/lib/types/admin";
import type {
  AdminActivityItem,
  AdminActivityType,
} from "@/lib/types/admin-activity";
import type { DashboardChartPoint } from "@/lib/types/analytics";
import { cn } from "@/lib/utils";

const ACTIVITY_META: Record<
  AdminActivityType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
  }
> = {
  signup: {
    label: "Signup",
    icon: HiOutlineUserPlus,
    tone: "bg-primary/10 text-primary",
  },
  scheduled: {
    label: "Scheduled",
    icon: HiOutlineCalendarDays,
    tone: "bg-amber-500/10 text-amber-700",
  },
  posted: {
    label: "Published",
    icon: HiOutlineCheckCircle,
    tone: "bg-emerald-500/10 text-emerald-700",
  },
  failed: {
    label: "Failed",
    icon: HiOutlineExclamationTriangle,
    tone: "bg-destructive/10 text-destructive",
  },
};

const RECENT_LIMIT = 8;

export default function AdminOverview({
  overview,
  activity,
  recentActivity,
}: {
  overview: AdminOverviewData;
  activity: DashboardChartPoint[];
  recentActivity: AdminActivityItem[];
}) {
  const range = useAdminDateRange();

  const recentItems = useMemo(() => {
    return recentActivity
      .filter((item) => isIsoInRange(item.occurredAt, range.from, range.to))
      .slice(0, RECENT_LIMIT);
  }, [recentActivity, range.from, range.to]);

  const kpis = [
    {
      label: "Total users",
      value: String(overview.totalUsers),
      hint: range.active ? "In selected range" : "Registered accounts",
      icon: PiUsersThree,
    },
    {
      label: "X connected",
      value: String(overview.xConnectedUsers),
      hint: "Users with X linked",
      icon: SiX,
    },
    {
      label: "LinkedIn connected",
      value: String(overview.linkedinConnectedUsers),
      hint: "Users with LinkedIn linked",
      icon: FaLinkedinIn,
    },
    {
      label: "Total posts",
      value: String(overview.totalPosts),
      hint: range.active ? "In selected range" : "Across all accounts",
      icon: TiFolderOpen,
    },
    {
      label: "Pending",
      value: String(overview.pendingPosts),
      hint: "Scheduled, not yet live",
      icon: PiClock,
    },
    {
      label: "Published",
      value: String(overview.postedPosts),
      hint: "Successfully posted",
      icon: PiCheckCircle,
    },
    {
      label: "Failed",
      value: String(overview.failedPosts),
      hint: "Need attention",
      icon: PiWarningCircle,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          System
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-none">
          Admin overview
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
          System-wide stats, charts, and recent activity across X and LinkedIn
          {range.active ? " for the selected date range" : ""}.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="shadow-none">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardDescription className="font-medium text-muted-foreground">
                {kpi.label}
              </CardDescription>
              <kpi.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-end">
          <Link
            href="/admin/analytics"
            className="text-sm font-medium text-primary hover:underline"
          >
            View analytics
          </Link>
        </div>
        <ChartAreaPosts
          data={activity}
          description={
            range.active
              ? "Scheduled vs published by network in range"
              : "Scheduled vs published by network over the last week"
          }
        />
      </div>

      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              {range.active
                ? "Latest signups and post events in the selected range."
                : "Latest signups and post events across the platform."}
            </CardDescription>
          </div>
          <Link
            href="/admin/notifications"
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="space-y-0 px-0 sm:px-0">
          {recentItems.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              No recent activity
              {range.active ? " in this range" : ""} yet.
            </p>
          ) : (
            recentItems.map((item, index) => {
              const meta = ACTIVITY_META[item.type];
              const Icon = meta.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-start gap-3 px-6 py-3.5 transition-colors hover:bg-muted/50",
                    index !== recentItems.length - 1 && "border-b border-border",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                      meta.tone,
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.platform ? (
                        <PlatformMark platform={item.platform} size="sm" />
                      ) : null}
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(item.occurredAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
