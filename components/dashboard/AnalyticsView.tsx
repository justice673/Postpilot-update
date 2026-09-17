"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { GoClock } from "react-icons/go";
import { PiCheckCircle, PiCalendarBlank, PiTrendUp } from "react-icons/pi";
import { Badge } from "@/components/ui/badge";
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
import type { AnalyticsData, DashboardChartPoint } from "@/lib/types/analytics";
import { cn } from "@/lib/utils";

const weeklyConfig = {
  posted: { label: "Published", color: "var(--chart-1)" },
  failed: { label: "Failed", color: "#ef4444" },
} satisfies ChartConfig;

const activityConfig = {
  scheduled: { label: "Scheduled", color: "var(--chart-1)" },
  published: { label: "Published", color: "var(--chart-2)" },
} satisfies ChartConfig;

const timesConfig = {
  count: { label: "Posts", color: "var(--chart-1)" },
} satisfies ChartConfig;

const successConfig = {
  success: { label: "Success", color: "var(--chart-1)" },
  failed: { label: "Failed", color: "#ef4444" },
} satisfies ChartConfig;

type RecentPost = {
  id: string;
  content: string;
  status: "posted" | "failed";
  when: string;
};

export default function AnalyticsView({
  data,
  chartData,
  recentPosts,
  failedCount,
  rangeActive = false,
  rangeLabel = null,
}: {
  data: AnalyticsData;
  chartData: DashboardChartPoint[];
  recentPosts: RecentPost[];
  failedCount: number;
  rangeActive?: boolean;
  rangeLabel?: string | null;
}) {
  const {
    weeklyPosts,
    monthlyTotal,
    weeklyTotal,
    successRate,
    postingTimes,
    bestTime,
  } = data;

  const weeklyBarMax = useMemo(() => {
    const peak = weeklyPosts.reduce(
      (max, day) => Math.max(max, day.posted + day.failed),
      0,
    );
    return Math.max(peak, 1);
  }, [weeklyPosts]);

  const activityYMax = useMemo(() => {
    const peak = chartData.reduce(
      (max, point) => Math.max(max, point.scheduled + point.published),
      0,
    );
    return Math.max(peak, 1);
  }, [chartData]);

  const timesYMax = useMemo(() => {
    const peak = postingTimes.reduce((max, slot) => Math.max(max, slot.count), 0);
    return Math.max(peak, 1);
  }, [postingTimes]);

  const pieData =
    successRate === 0 && weeklyTotal === 0 && monthlyTotal === 0
      ? [{ name: "success", value: 0, fill: "var(--color-success)" }]
      : [
          {
            name: "success",
            value: successRate,
            fill: "var(--color-success)",
          },
          {
            name: "failed",
            value: Math.max(100 - successRate, 0),
            fill: "var(--color-failed)",
          },
        ];

  const hasWeeklyData = weeklyPosts.some((d) => d.posted > 0 || d.failed > 0);
  const hasTimeData = postingTimes.some((slot) => slot.count > 0);
  const hasDeliveryData = weeklyTotal > 0 || monthlyTotal > 0 || successRate > 0;

  const kpis = [
    {
      label: rangeActive ? "Published in range" : "Published this week",
      value: String(weeklyTotal),
      hint:
        failedCount > 0
          ? `${failedCount} failed attempt${failedCount === 1 ? "" : "s"}`
          : rangeActive
            ? "In selected dates"
            : "Went live this week",
      icon: PiCheckCircle,
    },
    {
      label: rangeActive ? "Published in period" : "Published this month",
      value: String(monthlyTotal),
      hint: rangeActive ? "Across the range" : "Calendar month total",
      icon: PiCalendarBlank,
    },
    {
      label: "Success rate",
      value: `${successRate}%`,
      hint: "Posted vs failed",
      icon: PiTrendUp,
    },
    {
      label: "Best time",
      value: bestTime,
      hint: "Most posts go live",
      icon: GoClock,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Insights
        </p>
        <h1 className="mt-1 font-[family-name:var(--pp-display)] text-3xl font-medium tracking-tight sm:text-[2.5rem] sm:leading-none">
          Analytics
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          {rangeActive && rangeLabel
            ? `Showing performance for ${rangeLabel}.`
            : "Track posting performance on X and see when your queue lands best."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-border shadow-none">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
              {rangeActive ? "Posts by weekday" : "Posts this week"}
            </CardTitle>
            <CardDescription>Published vs failed by day</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-6">
            {!hasWeeklyData ? (
              <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No published or failed posts in this period yet.
              </p>
            ) : (
              <ChartContainer
                config={weeklyConfig}
                className="aspect-auto h-[260px] min-h-[260px] w-full"
              >
                <BarChart data={weeklyPosts} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={28}
                    domain={[0, weeklyBarMax]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="posted"
                    fill="var(--color-posted)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="failed"
                    fill="var(--color-failed)"
                    radius={[4, 4, 0, 0]}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
              Delivery success
            </CardTitle>
            <CardDescription>
              {rangeActive
                ? "Posted vs failed in range"
                : "Posted vs failed overall"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-6">
            {!hasDeliveryData ? (
              <p className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                Publish a few posts to see delivery success.
              </p>
            ) : (
              <>
                <ChartContainer
                  config={successConfig}
                  className="aspect-square h-[220px] min-h-[220px] w-full max-w-[260px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent nameKey="name" hideLabel />
                      }
                    />
                    <Pie
                      data={pieData.filter((d) => d.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {pieData
                        .filter((d) => d.value > 0)
                        .map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span className="size-2.5 rounded-full bg-primary" />
                    Success {successRate}%
                  </span>
                  <span className="inline-flex items-center gap-2 font-medium text-muted-foreground">
                    <span className="size-2.5 rounded-full bg-red-500" />
                    Failed {Math.max(100 - successRate, 0)}%
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border pt-0 shadow-none">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
              Publishing activity
            </CardTitle>
            <CardDescription>
              {rangeActive && rangeLabel
                ? `Scheduled vs published · ${rangeLabel}`
                : "Scheduled vs published over the last 30 days"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No activity in this period yet.
            </p>
          ) : (
            <ChartContainer
              config={activityConfig}
              className="aspect-auto h-[280px] min-h-[280px] w-full"
            >
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="fillScheduledA" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-scheduled)"
                      stopOpacity={0.75}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-scheduled)"
                      stopOpacity={0.08}
                    />
                  </linearGradient>
                  <linearGradient id="fillPublishedA" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-published)"
                      stopOpacity={0.7}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-published)"
                      stopOpacity={0.06}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
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
                <YAxis hide domain={[0, activityYMax]} allowDecimals={false} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
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
                <Area
                  dataKey="published"
                  type="linear"
                  fill="url(#fillPublishedA)"
                  stroke="var(--color-published)"
                  strokeWidth={2}
                  stackId="a"
                  isAnimationActive={false}
                />
                <Area
                  dataKey="scheduled"
                  type="linear"
                  fill="url(#fillScheduledA)"
                  stroke="var(--color-scheduled)"
                  strokeWidth={2}
                  stackId="a"
                  isAnimationActive={false}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
              Most active posting times
            </CardTitle>
            <CardDescription>
              When your posts go live most often
              {bestTime !== "—" ? ` · peak ${bestTime}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-6">
            {!hasTimeData ? (
              <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                Publish a few posts to unlock timing insights.
              </p>
            ) : (
              <ChartContainer
                config={timesConfig}
                className="aspect-auto h-[260px] min-h-[260px] w-full"
              >
                <LineChart data={postingTimes} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={28}
                    domain={[0, timesYMax]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-count)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--color-count)" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
              Recent posts
            </CardTitle>
            <CardDescription>
              Latest publishes and failures from your queue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 p-3 pt-0 sm:p-4 sm:pt-0">
            {recentPosts.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No published or failed posts in this period.
              </p>
            ) : (
              recentPosts.map((post, i) => (
                <div
                  key={post.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-3 py-3",
                    i !== recentPosts.length - 1 && "border-b border-border",
                  )}
                >
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm leading-snug">
                      {post.content}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          post.status === "posted" ? "success" : "danger"
                        }
                        className="rounded-md"
                      >
                        {post.status === "posted" ? "Published" : "Failed"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {post.when}
                      </span>
                    </div>
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
