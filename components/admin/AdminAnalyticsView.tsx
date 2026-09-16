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
import {
  adminPostingTimes,
  adminSignups,
  adminWeeklyPosts,
  getAdminActivitySeries,
  getAdminOverview,
} from "@/lib/admin/mock-data";
import { useAdminDateRange } from "@/lib/admin/date-range";
import { FiTrendingUp } from "react-icons/fi";
import { PiCheckCircle, PiUsersThree } from "react-icons/pi";
import { SiX } from "react-icons/si";
import AdminStatCards from "@/components/admin/AdminStatCards";

const activityConfig = {
  scheduled: { label: "Scheduled", color: "#5595f3" },
  published: { label: "Published", color: "#2b6dcf" },
} satisfies ChartConfig;

const weeklyConfig = {
  posted: { label: "Published", color: "#10b981" },
  failed: { label: "Failed", color: "#ef4444" },
} satisfies ChartConfig;

const signupConfig = {
  signups: { label: "Signups", color: "#5595f3" },
} satisfies ChartConfig;

const timeConfig = {
  count: { label: "Posts", color: "#2b6dcf" },
} satisfies ChartConfig;

export default function AdminAnalyticsView() {
  const range = useAdminDateRange();
  const overview = useMemo(
    () => getAdminOverview({ from: range.from, to: range.to }),
    [range.from, range.to],
  );
  const activity = useMemo(
    () => getAdminActivitySeries({ from: range.from, to: range.to }),
    [range.from, range.to],
  );

  const weeklyPosted = adminWeeklyPosts.reduce((sum, d) => sum + d.posted, 0);
  const successRate =
    overview.postedPosts + overview.failedPosts === 0
      ? 0
      : Math.round(
          (overview.postedPosts /
            (overview.postedPosts + overview.failedPosts)) *
            100,
        );
  const signupTotal = adminSignups.reduce((sum, d) => sum + d.signups, 0);

  const statusPie = [
    { name: "Pending", value: overview.pendingPosts, fill: "#5595f3" },
    { name: "Published", value: overview.postedPosts, fill: "#10b981" },
    { name: "Failed", value: overview.failedPosts, fill: "#ef4444" },
  ];

  const xPie = [
    { name: "Connected", value: overview.xConnectedUsers, fill: "#2b6dcf" },
    {
      name: "Not connected",
      value: Math.max(overview.totalUsers - overview.xConnectedUsers, 0),
      fill: "#94a3b8",
    },
  ];

  const successPie = [
    { name: "Success", value: successRate, fill: "#10b981" },
    { name: "Failed", value: Math.max(100 - successRate, 0), fill: "#ef4444" },
  ];

  const stats = [
    {
      label: range.active ? "Published in range" : "Published this week",
      value: range.active ? overview.postedPosts : weeklyPosted,
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
      label: "New signups",
      value: range.active ? overview.totalUsers : signupTotal,
      hint: range.active ? "In selected range" : "Last 30 days",
      icon: PiUsersThree,
    },
    {
      label: "X connected",
      value: overview.xConnectedUsers,
      hint: `${overview.totalUsers} total users`,
      icon: SiX,
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
          Deep system metrics across delivery, signups, and posting times
          {range.active ? " for the selected date range" : ""}.
        </p>
      </div>

      <AdminStatCards stats={stats} />

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>System post activity</CardTitle>
          <CardDescription>
            All users — scheduled vs published
            {range.active ? " in range" : " over time"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={activityConfig} className="aspect-auto h-[280px] min-h-[280px] w-full">
            <AreaChart data={activity}>
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
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="scheduled"
                stroke="var(--color-scheduled)"
                fill="url(#fillScheduled)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="published"
                stroke="var(--color-published)"
                fill="url(#fillPublished)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Posts this week</CardTitle>
            <CardDescription>
              System-wide published vs failed by day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={weeklyConfig} className="aspect-auto h-[260px] min-h-[260px] w-full">
              <BarChart data={adminWeeklyPosts}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
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
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Delivery success rate</CardTitle>
            <CardDescription>Posted vs failed across all users</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={{}} className="aspect-square mx-auto h-[240px] min-h-[240px] w-full max-w-[260px]">
              <PieChart>
                <Pie
                  data={successPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {successPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Post status breakdown</CardTitle>
            <CardDescription>Pending, published, and failed</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={{}} className="aspect-square mx-auto h-[240px] min-h-[240px] w-full max-w-[260px]">
              <PieChart>
                <Pie
                  data={statusPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {statusPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>X account connections</CardTitle>
            <CardDescription>Users with X linked vs not</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={{}} className="aspect-square mx-auto h-[240px] min-h-[240px] w-full max-w-[260px]">
              <PieChart>
                <Pie
                  data={xPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {xPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>User signups</CardTitle>
            <CardDescription>
              New registrations over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={signupConfig} className="aspect-auto h-[260px] min-h-[260px] w-full">
              <AreaChart data={adminSignups}>
                <defs>
                  <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2b6dcf" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#2b6dcf" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="signups"
                  stroke="var(--color-signups)"
                  fill="url(#fillSignups)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Peak posting times</CardTitle>
            <CardDescription>
              When posts go live most often across all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={timeConfig} className="aspect-auto h-[260px] min-h-[260px] w-full">
              <LineChart data={adminPostingTimes}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#2b6dcf" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
