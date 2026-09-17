"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAdminDateRange } from "@/lib/admin/date-range";
import type { AdminOverview as AdminOverviewData } from "@/lib/types/admin";
import type { DashboardChartPoint } from "@/lib/types/analytics";
import { PiCheckCircle, PiClock, PiUsersThree, PiWarningCircle } from "react-icons/pi";
import { SiX } from "react-icons/si";
import { TiFolderOpen } from "react-icons/ti";

const activityConfig = {
  scheduled: { label: "Scheduled", color: "#5595f3" },
  published: { label: "Published", color: "#2b6dcf" },
} satisfies ChartConfig;

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
          System-wide stats and charts across all Postpilot users
          {range.active ? " for the selected date range" : ""}.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Activity</CardTitle>
            <CardDescription>
              Scheduled vs published
              {range.active ? " in range" : " over the last week"}
            </CardDescription>
          </div>
          <Link
            href="/admin/analytics"
            className="text-sm font-medium text-primary hover:underline"
          >
            View analytics
          </Link>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No activity in this period yet.
            </p>
          ) : (
            <ChartContainer
              config={activityConfig}
              className="aspect-auto h-[280px] min-h-[280px] w-full"
            >
              <AreaChart data={activity} margin={{ left: 8, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fillScheduled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2b6dcf" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2b6dcf" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillPublished" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2b6dcf" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2b6dcf" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={28}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  allowDecimals={false}
                  domain={[
                    0,
                    Math.max(
                      1,
                      ...activity.map((p) => p.scheduled + p.published),
                    ),
                  ]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      }
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="linear"
                  dataKey="scheduled"
                  stroke="var(--color-scheduled)"
                  fill="url(#fillScheduled)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Area
                  type="linear"
                  dataKey="published"
                  stroke="var(--color-published)"
                  fill="url(#fillPublished)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
