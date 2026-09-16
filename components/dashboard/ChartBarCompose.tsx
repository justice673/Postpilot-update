"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartData = [
  { date: "2026-09-01", drafts: 3, ai: 2 },
  { date: "2026-09-03", drafts: 4, ai: 3 },
  { date: "2026-09-05", drafts: 2, ai: 5 },
  { date: "2026-09-07", drafts: 5, ai: 4 },
  { date: "2026-09-09", drafts: 3, ai: 6 },
  { date: "2026-09-11", drafts: 6, ai: 5 },
  { date: "2026-09-13", drafts: 4, ai: 7 },
  { date: "2026-09-15", drafts: 5, ai: 8 },
];

const chartConfig = {
  compose: { label: "Compose" },
  drafts: { label: "Manual drafts", color: "var(--chart-1)" },
  ai: { label: "AI expands", color: "var(--chart-2)" },
} satisfies ChartConfig;

type MetricKey = "drafts" | "ai";

export function ChartBarCompose() {
  const [activeChart, setActiveChart] = React.useState<MetricKey>("drafts");

  const total = React.useMemo(
    () => ({
      drafts: chartData.reduce((acc, curr) => acc + curr.drafts, 0),
      ai: chartData.reduce((acc, curr) => acc + curr.ai, 0),
    }),
    [],
  );

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0">
          <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
            Compose mix
          </CardTitle>
          <CardDescription>Manual drafts vs Gemini expands</CardDescription>
        </div>
        <div className="flex">
          {(["drafts", "ai"] as const).map((key) => (
            <button
              key={key}
              type="button"
              data-active={activeChart === key}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-xs text-muted-foreground">
                {chartConfig[key].label}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {total[key].toLocaleString("en-US")}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] min-h-[250px] w-full">
          <BarChart data={chartData} accessibilityLayer>
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
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey={activeChart}
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
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
