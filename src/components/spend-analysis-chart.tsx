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
import type { GroceryItem, Category, Currency } from "@/lib/types";
import { CATEGORIES } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

interface SpendAnalysisChartProps {
  items: GroceryItem[];
  onCategoryClick: (category: Category) => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  currency: Currency;
}

export function SpendAnalysisChart({ items, onCategoryClick, selectedMonth, onMonthChange, currency }: SpendAnalysisChartProps) {
    const { chartData, chartConfig, availableMonths } = React.useMemo(() => {
    const spendingByCategory: { [key: string]: number } = {};
    const allMonths = new Set<string>();

    items.forEach((item) => {
        item.orderHistory.forEach(order => {
            const monthKey = format(order.date, 'yyyy-MM');
            allMonths.add(monthKey);
            if (getMonth(order.date) === getMonth(selectedMonth) && getYear(order.date) === getYear(selectedMonth)) {
                if (spendingByCategory[item.category]) {
                    spendingByCategory[item.category] += order.price * order.quantity;
                } else {
                    spendingByCategory[item.category] = order.price * order.quantity;
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

    const chartData = Object.entries(spendingByCategory)
    .map(([name, total]) => ({
      name,
      emoji: getCategoryEmoji(name),
      total,
      fill: `hsl(var(--chart-${(Object.keys(CATEGORIES).findIndex(c => c === name) % 5) + 1}))`
    }))
    .sort((a,b) => b.total - a.total);


    const chartConfig = {
      total: {
        label: "Total Spent",
      },
    } satisfies ChartConfig;

    chartData.forEach((d, i) => {
        chartConfig[d.name as keyof typeof chartConfig] = {
            label: d.name,
            color: `hsl(var(--chart-${(i % 5) + 1}))`
        }
    });

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
      <div className="absolute -top-10 right-0">
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
