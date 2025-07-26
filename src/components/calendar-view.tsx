
"use client";

import * as React from "react";
import { format, getMonth, getYear } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import type { GroceryItem, Currency } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface CalendarViewProps {
  items: GroceryItem[];
  currency: Currency;
}

export function CalendarView({ items, currency }: CalendarViewProps) {
  const [month, setMonth] = React.useState<Date>(new Date());
  
  const { purchaseDates, totalSpend } = React.useMemo(() => {
    const dates = new Set<string>();
    let spend = 0;
    
    items.forEach(item => {
      item.orderHistory.forEach(order => {
        // Add date to highlighted set
        const utcDate = new Date(Date.UTC(order.date.getFullYear(), order.date.getMonth(), order.date.getDate()));
        dates.add(utcDate.toISOString().split('T')[0]);
        
        // Add to total spend if in the currently viewed month
        if (getMonth(order.date) === getMonth(month) && getYear(order.date) === getYear(month)) {
          spend += order.price * order.quantity;
        }
      });
    });

    return {
      purchaseDates: Array.from(dates).map(d => new Date(`${d}T00:00:00Z`)),
      totalSpend: spend,
    };
  }, [items, month]);

  const modifiers = {
    purchased: purchaseDates,
  };

  const modifiersStyles = {
    purchased: {
      fontWeight: 'bold',
      border: '2px solid hsl(var(--primary))',
      borderRadius: '50%',
    },
  };

  if (items.length === 0) {
    return (
        <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed py-12">
            <p className="text-muted-foreground">Add items with purchase dates to see them on the calendar.</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        className="rounded-md border"
      />
      <div className="w-full text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Spend for {format(month, 'MMMM yyyy')}</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalSpend, currency)}</p>
      </div>
    </div>
  );
}
