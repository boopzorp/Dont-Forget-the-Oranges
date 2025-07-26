
"use client";

import * as React from "react";
import { format, getMonth, getYear, subMonths } from "date-fns";
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { GroceryItem, Currency } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface GroupSpendChartProps {
  items: GroceryItem[];
  selectedMonth: Date;
  currency: Currency;
}

export function GroupSpendChart({ items, selectedMonth, currency }: GroupSpendChartProps) {
    const { chartData, chartConfig } = React.useMemo(() => {
        const spendingByGroup: { [key: string]: number } = {};

        items.forEach((item) => {
            item.orderHistory.forEach(order => {
                if (getMonth(order.date) === getMonth(selectedMonth) && getYear(order.date) === getYear(selectedMonth)) {
                    const group = order.group || 'Uncategorized';
                    if (spendingByGroup[group]) {
                        spendingByGroup[group] += order.price * order.quantity;
                    } else {
                        spendingByGroup[group] = order.price * order.quantity;
                    }
                }
            })
        });

        const chartData = [{
            month: format(selectedMonth, "MMM"),
            ...spendingByGroup
        }];

        const chartConfig: ChartConfig = {};
        Object.keys(spendingByGroup).forEach((group, index) => {
            chartConfig[group] = {
                label: group,
                color: `hsl(var(--chart-${(index % 5) + 1}))`,
            };
        });

        return { chartData, chartConfig };
  }, [items, selectedMonth]);

  if (Object.keys(chartConfig).length === 0) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground text-center">No spending data with groups for this month.</p>
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <XAxis
            type="number"
            tickFormatter={(value) => formatCurrency(value, currency, 0)}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            dataKey="month"
            type="category"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <Tooltip 
            cursor={false} 
            content={<ChartTooltipContent 
                formatter={(value, name) => (
                    <div className="flex items-center justify-between gap-4">
                        <span className="capitalize">{name}</span>
                        <span className="font-bold">{formatCurrency(value as number, currency)}</span>
                    </div>
                )}
                hideLabel 
            />} 
          />
          <Legend content={<ChartLegendContent />} />
          {Object.keys(chartConfig).map((group) => (
              <Bar 
                key={group}
                dataKey={group} 
                stackId="a" 
                fill={`var(--color-${group})`} 
                radius={[0, 4, 4, 0]} 
              />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
