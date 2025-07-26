
"use client";

import * as React from "react";
import { format, getMonth, getYear } from "date-fns";
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { GroceryItem, Category, Currency } from "@/lib/types";
import { CATEGORIES } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

interface SpendAnalysisChartProps {
  items: GroceryItem[];
  onCategoryClick: (category: Category) => void;
  selectedMonth: Date;
  currency: Currency;
}

export function SpendAnalysisChart({ items, onCategoryClick, selectedMonth, currency }: SpendAnalysisChartProps) {
    const { chartData, chartConfig } = React.useMemo(() => {
    const spendingByCategory: { [key: string]: number } = {};
    
    items.forEach((item) => {
        item.orderHistory.forEach(order => {
            if (getMonth(order.date) === getMonth(selectedMonth) && getYear(order.date) === getYear(selectedMonth)) {
                if (spendingByCategory[item.category]) {
                    spendingByCategory[item.category] += order.price * item.quantity;
                } else {
                    spendingByCategory[item.category] = order.price * item.quantity;
                }
            }
        })
    });
    
    const getCategoryEmoji = (category: string) => {
        return CATEGORIES.find((c) => c.name === category)?.emoji || '🛒';
    };

    const chartData = Object.entries(spendingByCategory)
    .map(([name, total]) => {
      const categoryIndex = CATEGORIES.findIndex(c => c.name === name);
      return {
        name,
        emoji: getCategoryEmoji(name),
        total,
        fill: `hsl(var(--chart-${(categoryIndex % 5) + 1}))`
      }
    })
    .sort((a,b) => b.total - a.total);


    const chartConfig: ChartConfig = {
      total: {
        label: "Total Spent",
      },
    };

    chartData.forEach((d) => {
      const categoryIndex = CATEGORIES.findIndex(c => c.name === d.name);
      const colorKey = `chart-${(categoryIndex % 5) + 1}`;
      chartConfig[d.name as keyof typeof chartConfig] = {
          label: d.name,
          color: `hsl(var(--${colorKey}))`
      }
    });

    return { chartData, chartConfig };
  }, [items, selectedMonth, currency]);

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const categoryName = data.activePayload[0].payload.name as Category;
      onCategoryClick(categoryName);
    }
  };


  if (items.length === 0) {
    return (
        <div className="flex h-[250px] w-full items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground">Add items to see your spending analysis.</p>
        </div>
    )
  }

  return (
    <div className="relative">
      <div className="h-[250px] w-full">
        {chartData.length === 0 ? (
           <div className="flex h-full w-full items-center justify-center rounded-lg">
                <p className="text-muted-foreground">No spending data for {format(selectedMonth, "MMMM yyyy")}.</p>
            </div>
        ) : (
        <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 5, right: 0, left: -10, bottom: 5 }}
            onClick={handleBarClick}
            >
            <XAxis
                dataKey="emoji"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{fontSize: 20}}
            />
            <YAxis
                tickFormatter={(value) => formatCurrency(value, currency, 0)}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={80}
            />
            <Tooltip 
                cursor={false} 
                content={<ChartTooltipContent 
                    formatter={(value, name, props) => (
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{props.payload.emoji}</span>
                            <div>
                                <div>{props.payload.name}</div>
                                <div className="font-bold">{formatCurrency(value as number, currency)}</div>
                            </div>
                        </div>
                    )}
                    hideLabel
                    hideIndicator
                />} 
             />
            <Bar dataKey="total" radius={8} className="cursor-pointer">
                 {chartData.map((d) => (
                    <Bar key={d.name} dataKey="total" fill={d.fill} />
                ))}
            </Bar>
            </BarChart>
        </ChartContainer>
        )}
      </div>
    </div>
  );
}
