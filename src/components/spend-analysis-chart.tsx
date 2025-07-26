"use client";

import * as React from "react";
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { GroceryItem } from "@/lib/types";

interface SpendAnalysisChartProps {
  items: GroceryItem[];
}

export function SpendAnalysisChart({ items }: SpendAnalysisChartProps) {
  const { chartData, chartConfig } = React.useMemo(() => {
    const spendingByCategory: { [key: string]: number } = {};

    items.forEach((item) => {
      if (spendingByCategory[item.category]) {
        spendingByCategory[item.category] += item.price * item.quantity;
      } else {
        spendingByCategory[item.category] = item.price * item.quantity;
      }
    });

    const chartData = Object.entries(spendingByCategory).map(([name, total]) => ({
      name,
      total,
    }));

    const chartConfig = {
      total: {
        label: "Total Spent",
        color: "hsl(var(--primary))",
      },
    } satisfies ChartConfig;

    return { chartData, chartConfig };
  }, [items]);

  if (chartData.length === 0) {
    return (
        <div className="flex h-[250px] w-full items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground">Not enough data to display chart.</p>
        </div>
    )
  }

  return (
    <div className="h-[250px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis
            tickFormatter={(value) => `$${value}`}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="total" fill="var(--color-total)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
