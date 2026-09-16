"use client";

import { useMemo, useState } from "react";
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
import { PiCheckCircle, PiTrendUp } from "react-icons/pi";
import { SiX } from "react-icons/si";
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
import { cn } from "@/lib/utils";

type RangeKey = "7d" | "30d";

const weeklyPosts = [
  { day: "Mon", posted: 3, failed: 0 },
  { day: "Tue", posted: 5, failed: 1 },
  { day: "Wed", posted: 4, failed: 0 },
  { day: "Thu", posted: 6, failed: 1 },
  { day: "Fri", posted: 4, failed: 0 },
  { day: "Sat", posted: 2, failed: 0 },
  { day: "Sun", posted: 3, failed: 0 },
];

const impressions7d = [
  { date: "2026-09-09", impressions: 4200, engagement: 312 },
  { date: "2026-09-10", impressions: 5100, engagement: 401 },
  { date: "2026-09-11", impressions: 4800, engagement: 356 },
  { date: "2026-09-12", impressions: 6200, engagement: 488 },
  { date: "2026-09-13", impressions: 5900, engagement: 442 },
  { date: "2026-09-14", impressions: 7100, engagement: 520 },
  { date: "2026-09-15", impressions: 6800, engagement: 501 },
];

const impressions30d = [
  { date: "2026-08-17", impressions: 3200, engagement: 210 },
  { date: "2026-08-20", impressions: 4100, engagement: 280 },
  { date: "2026-08-23", impressions: 3800, engagement: 255 },
  { date: "2026-08-26", impressions: 5200, engagement: 340 },
  { date: "2026-08-29", impressions: 4900, engagement: 318 },
  { date: "2026-09-01", impressions: 5600, engagement: 390 },
  { date: "2026-09-04", impressions: 6100, engagement: 420 },
  { date: "2026-09-07", impressions: 5800, engagement: 405 },
  { date: "2026-09-10", impressions: 6400, engagement: 460 },
  { date: "2026-09-13", impressions: 7200, engagement: 510 },
  { date: "2026-09-15", impressions: 6800, engagement: 501 },
];

const postingTimes = [
  { hour: "6a", count: 1 },
  { hour: "8a", count: 3 },
  { hour: "10a", count: 5 },
  { hour: "12p", count: 4 },
  { hour: "2p", count: 7 },
  { hour: "4p", count: 6 },
  { hour: "6p", count: 8 },
  { hour: "8p", count: 4 },
  { hour: "10p", count: 2 },
];

const topPosts = [
  {
    content: "Most scheduling tools are calendars with lipstick. We built a queue.",
    impressions: "12.4k",
    engagement: "6.2%",
    when: "Tue · 1:30 PM",
  },
  {
    content: "Shipping the new compose flow this week — here’s what’s new for X.",
    impressions: "9.8k",
    engagement: "4.9%",
    when: "Mon · 9:00 AM",
  },
  {
    content: "Thread: how we cut draft time in half with Gemini prompts.",
    impressions: "8.1k",
    engagement: "5.4%",
    when: "Wed · 10:00 AM",
  },
  {
    content: "Hot take on shipping in public — keep it sharp, under 280.",
    impressions: "7.2k",
    engagement: "3.8%",
    when: "Today · 11:15 AM",
  },
];

const weeklyConfig = {
  posted: { label: "Published", color: "var(--chart-1)" },
  failed: { label: "Failed", color: "#ef4444" },
} satisfies ChartConfig;

const growthConfig = {
  impressions: { label: "Impressions", color: "var(--chart-1)" },
  engagement: { label: "Engagements", color: "var(--chart-2)" },
} satisfies ChartConfig;

const timesConfig = {
  count: { label: "Posts", color: "var(--chart-1)" },
} satisfies ChartConfig;

const successConfig = {
  success: { label: "Success", color: "var(--chart-1)" },
  failed: { label: "Failed", color: "#ef4444" },
} satisfies ChartConfig;

export default function AnalyticsView() {
  const [range, setRange] = useState<RangeKey>("7d");

  const weeklyTotal = weeklyPosts.reduce((a, d) => a + d.posted, 0);
  const weeklyFailed = weeklyPosts.reduce((a, d) => a + d.failed, 0);
  const successRate = Math.round(
    (weeklyTotal / Math.max(weeklyTotal + weeklyFailed, 1)) * 100,
  );

  const pieData = [
    { name: "success", value: successRate, fill: "var(--color-success)" },
    {
      name: "failed",
      value: Math.max(100 - successRate, 0),
      fill: "var(--color-failed)",
    },
  ];

  const growthData = range === "7d" ? impressions7d : impressions30d;

  const growthTotals = useMemo(() => {
    const impressions = growthData.reduce((a, d) => a + d.impressions, 0);
    const engagement = growthData.reduce((a, d) => a + d.engagement, 0);
    return {
      impressions,
      engagement,
      rate: ((engagement / Math.max(impressions, 1)) * 100).toFixed(1),
    };
  }, [growthData]);

  const bestTime = "6:00 PM";

  const kpis = [
    {
      label: "Published this week",
      value: String(weeklyTotal),
      hint: `${weeklyFailed} failed attempts`,
      icon: PiCheckCircle,
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
    {
      label: "Impressions",
      value: `${(growthTotals.impressions / 1000).toFixed(1)}k`,
      hint: `Last ${range === "7d" ? "7" : "30"} days on X`,
      icon: SiX,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Insights
          </p>
          <h1 className="mt-1 font-[family-name:var(--pp-display)] text-3xl font-medium tracking-tight sm:text-[2.5rem] sm:leading-none">
            Analytics
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Track posting performance on X and see when your queue lands best.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-card p-1 self-start sm:self-auto">
          {(
            [
              { id: "7d" as const, label: "7 days" },
              { id: "30d" as const, label: "30 days" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRange(opt.id)}
              className={cn(
                "h-9 rounded-md px-3 text-sm font-semibold transition-colors",
                range === opt.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
              Posts this week
            </CardTitle>
            <CardDescription>Published vs failed by day</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-6">
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
          </CardContent>
        </Card>

        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
              Delivery success
            </CardTitle>
            <CardDescription>Posted vs failed this week</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-6">
            <ChartContainer
              config={successConfig}
              className="aspect-square h-[220px] min-h-[220px] w-full max-w-[260px]"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="name" hideLabel />}
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {pieData.map((entry) => (
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
                Failed {100 - successRate}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border pt-0 shadow-none">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
              Reach & engagement
            </CardTitle>
            <CardDescription>
              Impressions and engagements on X · last{" "}
              {range === "7d" ? "7" : "30"} days
            </CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Impressions</p>
              <p className="font-semibold">
                {growthTotals.impressions.toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Eng. rate</p>
              <p className="font-semibold">{growthTotals.rate}%</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={growthConfig}
            className="aspect-auto h-[280px] min-h-[280px] w-full"
          >
            <AreaChart data={growthData} accessibilityLayer>
              <defs>
                <linearGradient id="fillImpressions" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-impressions)"
                    stopOpacity={0.75}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-impressions)"
                    stopOpacity={0.08}
                  />
                </linearGradient>
                <linearGradient id="fillEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-engagement)"
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-engagement)"
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
              <YAxis tickLine={false} axisLine={false} width={40} />
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
                dataKey="engagement"
                type="natural"
                fill="url(#fillEngagement)"
                stroke="var(--color-engagement)"
                strokeWidth={2}
              />
              <Area
                dataKey="impressions"
                type="natural"
                fill="url(#fillImpressions)"
                stroke="var(--color-impressions)"
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
              Most active posting times
            </CardTitle>
            <CardDescription>
              When your posts go live most often · peak {bestTime}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-6">
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
          </CardContent>
        </Card>

        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
              Top posts
            </CardTitle>
            <CardDescription>Highest reach from your recent queue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 p-3 pt-0 sm:p-4 sm:pt-0">
            {topPosts.map((post, i) => (
              <div
                key={post.content}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-3",
                  i !== topPosts.length - 1 && "border-b border-border",
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
                    <Badge variant="secondary" className="rounded-md">
                      {post.impressions} views
                    </Badge>
                    <Badge variant="outline" className="rounded-md">
                      {post.engagement} eng.
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {post.when}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
