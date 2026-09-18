"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { ChartAreaPosts } from "@/components/dashboard/ChartAreaPosts";
import { useAdminDateRange } from "@/lib/admin/date-range";
import type { AdminOverview as AdminOverviewData } from "@/lib/types/admin";
import type { DashboardChartPoint } from "@/lib/types/analytics";
import { FaLinkedinIn } from "react-icons/fa6";
import { PiCheckCircle, PiClock, PiUsersThree, PiWarningCircle } from "react-icons/pi";
import { SiX } from "react-icons/si";
import { TiFolderOpen } from "react-icons/ti";

export default function AdminOverview({
  overview,
  activity,
}: {
  overview: AdminOverviewData;
  activity: DashboardChartPoint[];
}) {
  const range = useAdminDateRange();

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
          System-wide stats and charts across X and LinkedIn
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
    </div>
  );
}
