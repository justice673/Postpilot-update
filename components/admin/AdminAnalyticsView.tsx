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
import AdminStatCards from "@/components/admin/AdminStatCards";
import { ChartAreaPosts } from "@/components/dashboard/ChartAreaPosts";
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
import type {
  AdminAnalyticsData,
  AdminOverview as AdminOverviewData,
} from "@/lib/types/admin";
import type { DashboardChartPoint } from "@/lib/types/analytics";
import { PLATFORM_CHART_COLORS } from "@/lib/types/analytics";
import { FaLinkedinIn } from "react-icons/fa6";
import { FiTrendingUp } from "react-icons/fi";
import { PiCheckCircle } from "react-icons/pi";
import { SiX } from "react-icons/si";

const weeklyConfig = {
  posted: { label: "Published", color: "#10b981" },
  failed: { label: "Failed", color: "#ef4444" },
} satisfies ChartConfig;

const signupConfig = {
  signups: { label: "Signups", color: "#5595f3" },
} satisfies ChartConfig;

const timeConfig = {
  x: { label: "X", color: PLATFORM_CHART_COLORS.x },
  linkedin: { label: "LinkedIn", color: PLATFORM_CHART_COLORS.linkedin },
} satisfies ChartConfig;

const STATUS_COLORS: Record<string, string> = {
  Pending: "#5595f3",
  Published: "#10b981",
  Failed: "#ef4444",
  "X only": PLATFORM_CHART_COLORS.x,
  "LinkedIn only": PLATFORM_CHART_COLORS.linkedin,
  Both: "#2b6dcf",
  Neither: "#94a3b8",
  Success: "#10b981",
};

function formatAxisDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTooltipDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminAnalyticsView({
  overview,
  activity,
  analytics,
  rangeActive = false,
  rangeLabel = null,
}: {
  overview: AdminOverviewData;
  activity: DashboardChartPoint[];
  analytics: AdminAnalyticsData;
  rangeActive?: boolean;
  rangeLabel?: string | null;
}) {
  const successRate = analytics.successRate;

  const weeklyYMax = useMemo(() => {
    const peak = analytics.weeklyPosts.reduce(
      (max, day) => Math.max(max, day.posted + day.failed),
      0,
    );
    return Math.max(peak, 1);
  }, [analytics.weeklyPosts]);

  const signupYMax = useMemo(() => {
    const peak = analytics.userSignups.reduce(
      (max, day) => Math.max(max, day.scheduled),
      0,
    );
    return Math.max(peak, 1);
  }, [analytics.userSignups]);

  const timesYMax = useMemo(() => {
    const peak = analytics.postingTimes.reduce(
      (max, slot) => Math.max(max, slot.count),
      0,
    );
    return Math.max(peak, 1);
  }, [analytics.postingTimes]);

  const hasWeeklyData = analytics.weeklyPosts.some(
    (d) => d.posted > 0 || d.failed > 0,
  );
  const hasTimeData = analytics.postingTimes.some((slot) => slot.count > 0);
  const hasDeliveryData =
    analytics.weeklyTotal > 0 ||
    analytics.monthlyTotal > 0 ||
    successRate > 0 ||
    analytics.postStatusBreakdown.some((item) => item.value > 0);

  const statusPie = analytics.postStatusBreakdown.map((item) => ({
    name: item.name,
    value: item.value,
    fill:
      STATUS_COLORS[item.name] ??
      (item.status === "pending"
        ? "#5595f3"
        : item.status === "posted"
          ? "#10b981"
          : "#ef4444"),
  }));

  const connectionPie = analytics.connectionBreakdown.map((item) => ({
    name: item.name,
    value: item.value,
    fill: STATUS_COLORS[item.name] ?? "#94a3b8",
  }));

  const successPie = [
    { name: "Success", value: successRate, fill: "#10b981" },
    { name: "Failed", value: Math.max(100 - successRate, 0), fill: "#ef4444" },
  ].filter((d) => d.value > 0);

  const stats = [
    {
      label: rangeActive ? "Published in range" : "Published this week",
      value: rangeActive ? overview.postedPosts : analytics.weeklyTotal,
      hint: "All users",
      icon: PiCheckCircle,
    },
    {
      label: "Success rate",
      value: `${successRate}%`,
      hint: "Posted vs failed",
      icon: FiTrendingUp,
    },
    {
      label: "X connected",
      value: overview.xConnectedUsers,
      hint: `${overview.totalUsers} total users`,
      icon: SiX,
    },
    {
      label: "LinkedIn connected",
      value: overview.linkedinConnectedUsers,
      hint: rangeActive && rangeLabel ? rangeLabel : "All accounts",
      icon: FaLinkedinIn,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Insights
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-none">
          Analytics
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
          {rangeActive && rangeLabel
            ? `Deep system metrics for ${rangeLabel}.`
            : "Deep system metrics across delivery, signups, and posting times."}
        </p>
      </div>

      <AdminStatCards stats={stats} />

      <ChartAreaPosts
        data={activity}
        description={
          rangeActive && rangeLabel
            ? `All users — scheduled vs published by network · ${rangeLabel}`
            : "All users — scheduled vs published by network over the last 30 days"
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>
              {rangeActive ? "Posts by weekday" : "Posts this week"}
            </CardTitle>
            <CardDescription>
              System-wide published vs failed by day
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasWeeklyData ? (
              <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No published or failed posts in this period yet.
              </p>
            ) : (
              <ChartContainer
                config={weeklyConfig}
                className="aspect-auto h-[260px] min-h-[260px] w-full"
              >
                <BarChart data={analytics.weeklyPosts}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    domain={[0, weeklyYMax]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
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
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Delivery success rate</CardTitle>
            <CardDescription>
              Posted vs failed across all users
              {rangeActive ? " in range" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 pb-6">
            {!hasDeliveryData || successPie.length === 0 ? (
              <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No completed posts to measure yet.
              </p>
            ) : (
              <>
                <ChartContainer
                  config={{}}
                  className="aspect-square mx-auto h-[240px] min-h-[240px] w-full max-w-[260px]"
                >
                  <PieChart>
                    <Pie
                      data={successPie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {successPie.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="name" />}
                    />
                  </PieChart>
                </ChartContainer>
                <div className="flex items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span className="size-2.5 rounded-full bg-emerald-500" />
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

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Post status breakdown</CardTitle>
            <CardDescription>Pending, published, and failed</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {statusPie.length === 0 ? (
              <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No posts in this period yet.
              </p>
            ) : (
              <ChartContainer
                config={{}}
                className="aspect-square mx-auto h-[240px] min-h-[240px] w-full max-w-[260px]"
              >
                <PieChart>
                  <Pie
                    data={statusPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {statusPie.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="name" />}
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Channel connections</CardTitle>
            <CardDescription>
              X only, LinkedIn only, both, or neither
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {connectionPie.length === 0 ? (
              <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No users to show yet.
              </p>
            ) : (
              <ChartContainer
                config={{}}
                className="aspect-square mx-auto h-[240px] min-h-[240px] w-full max-w-[260px]"
              >
                <PieChart>
                  <Pie
                    data={connectionPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {connectionPie.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="name" />}
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>User signups</CardTitle>
            <CardDescription>
              {rangeActive && rangeLabel
                ? `New registrations · ${rangeLabel}`
                : "New registrations over the last 30 days"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.userSignups.length === 0 ? (
              <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No signup data in this period.
              </p>
            ) : (
              <ChartContainer
                config={signupConfig}
                className="aspect-auto h-[260px] min-h-[260px] w-full"
              >
                <AreaChart
                  data={analytics.userSignups.map((d) => ({
                    date: d.date,
                    signups: d.scheduled,
                  }))}
                >
                  <defs>
                    <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2b6dcf" stopOpacity={0.7} />
                      <stop
                        offset="95%"
                        stopColor="#2b6dcf"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={28}
                    tickFormatter={formatAxisDate}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    domain={[0, signupYMax]}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) =>
                          formatTooltipDate(String(value))
                        }
                      />
                    }
                  />
                  <Area
                    type="linear"
                    dataKey="signups"
                    stroke="var(--color-signups)"
                    fill="url(#fillSignups)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Peak posting times</CardTitle>
            <CardDescription>
              When posts go live most often across all users, by network
              {analytics.bestTime !== "—"
                ? ` · peak ${analytics.bestTime}`
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasTimeData ? (
              <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                Publish a few posts to unlock timing insights.
              </p>
            ) : (
              <ChartContainer
                config={timeConfig}
                className="aspect-auto h-[260px] min-h-[260px] w-full"
              >
                <LineChart data={analytics.postingTimes}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    domain={[0, timesYMax]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="x"
                    stroke="var(--color-x)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: PLATFORM_CHART_COLORS.x }}
                  />
                  <Line
                    type="monotone"
                    dataKey="linkedin"
                    stroke="var(--color-linkedin)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: PLATFORM_CHART_COLORS.linkedin }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
