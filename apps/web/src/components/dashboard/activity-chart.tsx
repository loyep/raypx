"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@raypx/design-system/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  sessions: {
    label: "Sessions",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

type ActivityData = {
  date: string;
  count: number;
};

type ActivityChartProps = {
  data: ActivityData[];
};

export function ActivityChart({ data }: ActivityChartProps) {
  const formattedData = data.map((item) => {
    const date = new Date(item.date);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    return {
      ...item,
      dayName,
    };
  });

  return (
    <ChartContainer className="h-[200px] w-full" config={chartConfig}>
      <BarChart data={formattedData}>
        <CartesianGrid vertical={false} />
        <XAxis axisLine={false} dataKey="dayName" tickLine={false} tickMargin={10} />
        <YAxis axisLine={false} tickLine={false} tickMargin={10} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-sessions)" name="Sessions" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
