"use client";

import { useMemo } from "react";
import {
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
import { ChartAreaPosts } from "@/components/dashboard/ChartAreaPosts";
import {
  PlatformBadge,
  PlatformMark,
} from "@/components/dashboard/PlatformMark";
import type { AnalyticsData, DashboardChartPoint } from "@/lib/types/analytics";
import { PLATFORM_CHART_COLORS } from "@/lib/types/analytics";
import type { PostPlatform } from "@/lib/types/posts";
import { cn } from "@/lib/utils";

const weeklyConfig = {
  xPosted: { label: "X published", color: PLATFORM_CHART_COLORS.x },
  linkedinPosted: {
    label: "LinkedIn published",
    color: PLATFORM_CHART_COLORS.linkedin,
  },
  failed: { label: "Failed", color: "#ef4444" },
} satisfies ChartConfig;

const timesConfig = {
  x: { label: "X", color: PLATFORM_CHART_COLORS.x },
  linkedin: { label: "LinkedIn", color: PLATFORM_CHART_COLORS.linkedin },
} satisfies ChartConfig;

const networkMixConfig = {
  x: { label: "X", color: PLATFORM_CHART_COLORS.x },
  linkedin: { label: "LinkedIn", color: PLATFORM_CHART_COLORS.linkedin },
} satisfies ChartConfig;

type RecentPost = {
  id: string;
  content: string;
  status: "posted" | "failed";
  platform: PostPlatform;
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
    networkMix,
  } = data;

  const weeklyBarMax = useMemo(() => {
    const peak = weeklyPosts.reduce(
      (max, day) =>
        Math.max(max, day.xPosted + day.linkedinPosted + day.failed),
      0,
    );
    return Math.max(peak, 1);
  }, [weeklyPosts]);

  const timesYMax = useMemo(() => {
    const peak = postingTimes.reduce((max, slot) => Math.max(max, slot.count), 0);
    return Math.max(peak, 1);
  }, [postingTimes]);

  const networkPieData = [
    {
      name: "x",
      value: networkMix.xPublished,
      fill: "var(--color-x)",
    },
    {
      name: "linkedin",
      value: networkMix.linkedinPublished,
      fill: "var(--color-linkedin)",
    },
  ].filter((d) => d.value > 0);

  const networkPublishedTotal =
    networkMix.xPublished + networkMix.linkedinPublished;

  const hasWeeklyData = weeklyPosts.some(
    (d) => d.xPosted > 0 || d.linkedinPosted > 0 || d.failed > 0,
  );
  const hasTimeData = postingTimes.some((slot) => slot.count > 0);
  const hasNetworkMix = networkPublishedTotal > 0;

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
            : "Track posting performance across your channels and see when your queue lands best."}
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
            <CardDescription>
              Published by network vs failed, by day
            </CardDescription>
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
                    dataKey="xPosted"
                    stackId="day"
                    fill="var(--color-xPosted)"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="linkedinPosted"
                    stackId="day"
                    fill="var(--color-linkedinPosted)"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="failed"
                    stackId="day"
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
              Publishes by network
            </CardTitle>
            <CardDescription>
              {rangeActive
                ? "Share of successful posts in range"
                : "Share of successful posts overall"}
              {` · ${successRate}% delivery success`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-6">
            {!hasNetworkMix ? (
              <p className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                Publish a few posts to see network mix.
              </p>
            ) : (
              <>
                <ChartContainer
                  config={networkMixConfig}
                  className="aspect-square h-[220px] min-h-[220px] w-full max-w-[260px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent nameKey="name" hideLabel />
                      }
                    />
                    <Pie
                      data={networkPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {networkPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: PLATFORM_CHART_COLORS.x }}
                    />
                    X {networkMix.xPublished}
                    {networkPublishedTotal > 0
                      ? ` · ${Math.round(
                          (networkMix.xPublished / networkPublishedTotal) * 100,
                        )}%`
                      : ""}
                  </span>
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: PLATFORM_CHART_COLORS.linkedin }}
                    />
                    LinkedIn {networkMix.linkedinPublished}
                    {networkPublishedTotal > 0
                      ? ` · ${Math.round(
                          (networkMix.linkedinPublished /
                            networkPublishedTotal) *
                            100,
                        )}%`
                      : ""}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ChartAreaPosts
        data={chartData}
        description={
          rangeActive && rangeLabel
            ? `By network · ${rangeLabel}`
            : "Scheduled vs published by network over the last 30 days"
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
              Most active posting times
            </CardTitle>
            <CardDescription>
              When your posts go live most often, by network
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
                    dataKey="x"
                    stroke="var(--color-x)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--color-x)" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="linkedin"
                    stroke="var(--color-linkedin)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--color-linkedin)" }}
                    activeDot={{ r: 5 }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
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
              Latest publishes and failures across your channels
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
                  <PlatformMark platform={post.platform} />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm leading-snug">
                      {post.content}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <PlatformBadge platform={post.platform} />
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
