"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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

const chartData = [
  { date: "2026-09-01", scheduled: 4, published: 2 },
  { date: "2026-09-02", scheduled: 6, published: 3 },
  { date: "2026-09-03", scheduled: 5, published: 4 },
  { date: "2026-09-04", scheduled: 8, published: 5 },
  { date: "2026-09-05", scheduled: 7, published: 6 },
  { date: "2026-09-06", scheduled: 9, published: 4 },
  { date: "2026-09-07", scheduled: 6, published: 5 },
  { date: "2026-09-08", scheduled: 10, published: 7 },
  { date: "2026-09-09", scheduled: 8, published: 6 },
  { date: "2026-09-10", scheduled: 11, published: 8 },
  { date: "2026-09-11", scheduled: 9, published: 7 },
  { date: "2026-09-12", scheduled: 12, published: 9 },
  { date: "2026-09-13", scheduled: 7, published: 5 },
  { date: "2026-09-14", scheduled: 10, published: 8 },
];

const chartConfig = {
  activity: { label: "Activity" },
  scheduled: { label: "Scheduled", color: "var(--chart-1)" },
  published: { label: "Published", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartAreaPosts() {
  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
            Publishing activity
          </CardTitle>
          <CardDescription>Scheduled vs published posts this month</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] min-h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillScheduled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-scheduled)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-scheduled)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillPublished" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-published)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-published)" stopOpacity={0.1} />
              </linearGradient>
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
            <Area
              dataKey="published"
              type="natural"
              fill="url(#fillPublished)"
              stroke="var(--color-published)"
              stackId="a"
            />
            <Area
              dataKey="scheduled"
              type="natural"
              fill="url(#fillScheduled)"
              stroke="var(--color-scheduled)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
