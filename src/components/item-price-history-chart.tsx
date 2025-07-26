"use client"

import * as React from "react"
import { format } from "date-fns"
import { Line, LineChart, XAxis, YAxis, Tooltip } from "recharts"

import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { Order } from "@/lib/types"

interface ItemPriceHistoryChartProps {
  orderHistory: Order[]
}

export function ItemPriceHistoryChart({
  orderHistory,
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
      <div className="flex h-[150px] w-full items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground text-sm">
          Not enough price history to display a chart.
        </p>
      </div>
    )
  }

  return (
    <div className="h-[150px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
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
            tickFormatter={(value) => `$${value}`}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            domain={['dataMin', 'dataMax']}
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideIndicator />}
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
    </div>
  )
}
