
"use client";

import * as React from "react";
import { isSameDay } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import type { GroceryItem } from "@/lib/types";

interface CalendarViewProps {
  items: GroceryItem[];
}

export function CalendarView({ items }: CalendarViewProps) {
  const [month, setMonth] = React.useState<Date>(new Date());
  
  const purchaseDates = React.useMemo(() => {
    const dates = new Set<string>();
    items.forEach(item => {
      item.orderHistory.forEach(order => {
        dates.add(order.date.toISOString().split('T')[0]);
      });
    });
    return Array.from(dates).map(d => new Date(d));
  }, [items]);

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
    <div className="flex justify-center">
      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        className="rounded-md border"
      />
    </div>
  );
}
