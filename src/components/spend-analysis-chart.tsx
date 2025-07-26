"use client";

import * as React from "react";
import { format, getMonth, getYear, subMonths } from "date-fns";
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts";
import { ChevronDown } from "lucide-react";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { GroceryItem, Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/data";

interface SpendAnalysisChartProps {
  items: GroceryItem[];
  onCategoryClick: (category: Category) => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function SpendAnalysisChart({ items, onCategoryClick, selectedMonth, onMonthChange }: SpendAnalysisChartProps) {
    const { chartData, chartConfig, availableMonths } = React.useMemo(() => {
    const spendingByCategory: { [key: string]: number } = {};
    const allMonths = new Set<string>();

    items.forEach((item) => {
        item.orderHistory.forEach(order => {
            const monthKey = format(order.date, 'yyyy-MM');
            allMonths.add(monthKey);
            if (getMonth(order.date) === getMonth(selectedMonth) && getYear(order.date) === getYear(selectedMonth)) {
                if (spendingByCategory[item.category]) {
                    spendingByCategory[item.category] += order.price;
                } else {
                    spendingByCategory[item.category] = order.price;
                }
            }
        })
    });
    
    // Add last 12 months for dropdown
    for(let i=0; i < 12; i++) {
        allMonths.add(format(subMonths(new Date(), i), 'yyyy-MM'));
    }

    const availableMonths = Array.from(allMonths)
        .map(monthStr => new Date(monthStr + '-02')) // Use day 02 to avoid timezone issues
        .sort((a,b) => b.getTime() - a.getTime());

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

    return { chartData, chartConfig, availableMonths };
  }, [items, selectedMonth]);

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
      <div className="absolute top-0 right-0">
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {format(selectedMonth, "MMMM yyyy")}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableMonths.map((month) => (
              <DropdownMenuItem key={month.toISOString()} onSelect={() => onMonthChange(month)}>
                {format(month, "MMMM yyyy")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="h-[250px] w-full pt-10">
        {chartData.length === 0 ? (
           <div className="flex h-full w-full items-center justify-center rounded-lg">
                <p className="text-muted-foreground">No spending data for {format(selectedMonth, "MMMM yyyy")}.</p>
            </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
