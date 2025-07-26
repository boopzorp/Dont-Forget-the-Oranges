
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
        // Get YYYY-MM-DD in UTC to avoid timezone shifts
        const utcDate = new Date(Date.UTC(order.date.getFullYear(), order.date.getMonth(), order.date.getDate()));
        dates.add(utcDate.toISOString().split('T')[0]);
      });
    });
    // When creating dates from the string, explicitly tell new Date() it's a UTC date string
    // by adding 'T00:00:00Z' to avoid it being parsed as local time.
    return Array.from(dates).map(d => new Date(`${d}T00:00:00Z`));
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
