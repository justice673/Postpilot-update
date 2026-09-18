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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  PLATFORM_CHART_COLORS,
  type PostingTimeBucket,
} from "@/lib/types/analytics";

const chartConfig = {
  x: { label: "X", color: PLATFORM_CHART_COLORS.x },
  linkedin: { label: "LinkedIn", color: PLATFORM_CHART_COLORS.linkedin },
} satisfies ChartConfig;

export function ChartBarCompose({
  data,
  bestTime,
}: {
  data: PostingTimeBucket[];
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
            ? `Peak window so far is ${bestTime}, split by network.`
            : "When your posts tend to go out, by network"}
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
                dataKey="x"
                stackId="networks"
                fill="var(--color-x)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="linkedin"
                stackId="networks"
                fill="var(--color-linkedin)"
                radius={[4, 4, 0, 0]}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
