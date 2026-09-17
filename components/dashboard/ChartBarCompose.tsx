"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

const chartConfig = {
  count: { label: "Posts", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ChartBarCompose({
  data,
  bestTime,
}: {
  data: { hour: string; count: number }[];
  bestTime?: string;
}) {
  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card className="border-border shadow-none">
      <CardHeader>
        <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
          Best posting times
        </CardTitle>
        <CardDescription>
          {bestTime && bestTime !== "—"
            ? `Your strongest hour so far is ${bestTime}.`
            : "When your posts tend to go out"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Publish a few posts to unlock timing insights.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] min-h-[250px] w-full"
          >
            <BarChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="hour" tickLine={false} axisLine={false} />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
