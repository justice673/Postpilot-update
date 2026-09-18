"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  PLATFORM_CHART_COLORS,
  type DashboardChartPoint,
} from "@/lib/types/analytics";

const chartConfig = {
  activity: { label: "Activity" },
  xPublished: {
    label: "X published",
    color: PLATFORM_CHART_COLORS.x,
  },
  linkedinPublished: {
    label: "LinkedIn published",
    color: PLATFORM_CHART_COLORS.linkedin,
  },
  xScheduled: {
    label: "X scheduled",
    color: PLATFORM_CHART_COLORS.xMuted,
  },
  linkedinScheduled: {
    label: "LinkedIn scheduled",
    color: PLATFORM_CHART_COLORS.linkedinMuted,
  },
} satisfies ChartConfig;

const SERIES = [
  {
    key: "xPublished" as const,
    gradientId: "fillXPublished",
  },
  {
    key: "linkedinPublished" as const,
    gradientId: "fillLinkedInPublished",
  },
  {
    key: "xScheduled" as const,
    gradientId: "fillXScheduled",
  },
  {
    key: "linkedinScheduled" as const,
    gradientId: "fillLinkedInScheduled",
  },
];

export function ChartAreaPosts({
  data,
  description = "Scheduled vs published by network",
}: {
  data: DashboardChartPoint[];
  description?: string;
}) {
  // Keep a floor of 1 so an all-zero series still draws a visible baseline.
  const yMax = useMemo(() => {
    const peak = data.reduce(
      (max, point) => Math.max(max, point.scheduled + point.published),
      0,
    );
    return Math.max(peak, 1);
  }, [data]);

  return (
    <Card className="border-border pt-0 shadow-none">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
            Publishing activity
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {data.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No activity yet — schedule your first post to see this chart.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] min-h-[250px] w-full"
          >
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
            >
              <defs>
                {SERIES.map(({ key, gradientId }) => (
                  <linearGradient
                    key={gradientId}
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={`var(--color-${key})`}
                      stopOpacity={0.85}
                    />
                    <stop
                      offset="95%"
                      stopColor={`var(--color-${key})`}
                      stopOpacity={0.08}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis hide domain={[0, yMax]} allowDecimals={false} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              {SERIES.map(({ key, gradientId }) => (
                <Area
                  key={key}
                  dataKey={key}
                  type="linear"
                  fill={`url(#${gradientId})`}
                  stroke={`var(--color-${key})`}
                  strokeWidth={2}
                  baseValue={0}
                  stackId="networks"
                  isAnimationActive={false}
                />
              ))}
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
