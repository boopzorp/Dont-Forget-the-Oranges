"use client"

import * as React from "react"
import { format } from "date-fns"
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { Order, Currency } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface ItemPriceHistoryChartProps {
  orderHistory: Order[],
  currency: Currency
}

export function ItemPriceHistoryChart({
  orderHistory,
  currency
}: ItemPriceHistoryChartProps) {
  const { chartData, chartConfig } = React.useMemo(() => {
    const data = orderHistory.map((order) => ({
      date: format(order.date, "MMM d"),
      price: order.price,
    }))

    const config = {
      price: {
        label: "Price",
        color: "hsl(var(--primary))",
      },
    } satisfies ChartConfig

    return { chartData: data, chartConfig: config }
  }, [orderHistory])

  if (chartData.length < 2) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed p-4">
        <p className="text-muted-foreground text-sm text-center">
          Not enough price history to display a chart.
        </p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-full w-full min-h-[150px]">
        <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
            <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value}
            />
            <YAxis
            tickFormatter={(value) => formatCurrency(value, currency, 0)}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            domain={['dataMin', 'dataMax']}
            />
            <Tooltip
            cursor={false}
            content={<ChartTooltipContent 
                formatter={(value, name, props) => (
                    <div className="flex flex-col">
                        <span>{props.payload.date}</span>
                        <span className="font-bold">{formatCurrency(value as number, currency)}</span>
                    </div>
                )}
                hideIndicator 
                />}
            />
            <Line
            dataKey="price"
            type="monotone"
            stroke="var(--color-price)"
            strokeWidth={2}
            dot={true}
            />
        </LineChart>
    </ChartContainer>
  )
}
