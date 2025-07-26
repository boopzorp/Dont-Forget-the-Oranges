"use client";

import * as React from "react";
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { GroceryItem, Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/data";


interface SpendAnalysisChartProps {
  items: GroceryItem[];
  onCategoryClick: (category: Category) => void;
}

export function SpendAnalysisChart({ items, onCategoryClick }: SpendAnalysisChartProps) {
  const { chartData, chartConfig } = React.useMemo(() => {
    const spendingByCategory: { [key: string]: number } = {};

    items.forEach((item) => {
      if (spendingByCategory[item.category]) {
        spendingByCategory[item.category] += item.price * item.quantity;
      } else {
        spendingByCategory[item.category] = item.price * item.quantity;
      }
    });

    const getCategoryEmoji = (category: string) => {
        return CATEGORIES.find((c) => c.name === category)?.emoji || '🛒';
    };

    const chartData = Object.entries(spendingByCategory).map(([name, total]) => ({
      name,
      emoji: getCategoryEmoji(name),
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

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const categoryName = data.activePayload[0].payload.name as Category;
      onCategoryClick(categoryName);
    }
  };


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
          onClick={handleBarClick}
        >
          <XAxis
            dataKey="emoji"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            
          />
          <YAxis
            tickFormatter={(value) => `$${value}`}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="total" fill="var(--color-total)" radius={4} className="cursor-pointer" />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

    