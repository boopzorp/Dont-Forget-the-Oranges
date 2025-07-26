
"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { toDateString } from "@/lib/utils";
import type { ShoppingEvent, GiftItem } from "@/lib/types";
import { getYear } from "date-fns";

interface GiftCalendarViewProps {
  events: ShoppingEvent[];
  gifts: GiftItem[];
  onDateSelect: (date: Date) => void;
}

export function GiftCalendarView({ events, gifts, onDateSelect }: GiftCalendarViewProps) {
  const [month, setMonth] = React.useState<Date>(new Date());
  
  const { eventDates, purchaseDates } = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDateSet = new Set<string>();
    
    // Add all event dates, calculating next occurrence for recurring ones
    events.forEach(event => {
      let nextOccurrence = new Date(event.date);
      const isRecurring = event.category === "Birthday" || event.category === "Anniversary";

      if (isRecurring) {
        const currentYear = getYear(today);
        nextOccurrence.setFullYear(currentYear);
        if (nextOccurrence < today) {
            nextOccurrence.setFullYear(currentYear + 1);
        }
      }
      eventDateSet.add(toDateString(nextOccurrence));
    });

    const purchaseDateSet = new Set<string>();
    gifts.forEach(gift => {
      purchaseDateSet.add(toDateString(gift.purchaseDate));
    });
    
    return { 
        eventDates: Array.from(eventDateSet).map(d => new Date(d)),
        purchaseDates: Array.from(purchaseDateSet).map(d => new Date(d)),
     };
  }, [events, gifts]);

  const modifiers = {
    event: eventDates,
    purchase: purchaseDates,
  };

  const modifiersStyles = {
    event: {
      border: "2px solid hsl(var(--primary))",
    },
    purchase: {
      // This will add a dot using a pseudo-element
      position: 'relative',
    },
  };
  
  const CustomDay = (dayProps: any) => {
    const { date, displayMonth } = dayProps;
    if (!displayMonth) return null;
    
    const isPurchase = purchaseDates.some(pd => toDateString(pd) === toDateString(date));
    
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {dayProps.children}
        {isPurchase && 
          <div 
            style={{ 
              position: 'absolute', 
              bottom: '4px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              width: '5px', 
              height: '5px', 
              borderRadius: '50%',
              backgroundColor: 'hsl(var(--primary))' 
            }} 
          />
        }
      </div>
    );
  };
  
  const handleSelect = (date: Date | undefined) => {
    if(date) {
        onDateSelect(date);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <style>{`
        .rdp-day_event { border: 2px solid hsl(var(--primary)); }
      `}</style>
      <Calendar
        mode="single"
        selected={undefined}
        onSelect={handleSelect}
        month={month}
        onMonthChange={setMonth}
        modifiers={modifiers}
        modifiersClassNames={{ event: 'rdp-day_event' }}
        className="rounded-md border"
        components={{ DayContent: CustomDay }}
      />
       <div className="flex items-center gap-6 mt-4 p-4 bg-muted/50 rounded-lg w-full justify-center">
        <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-primary"></div>
            <span className="text-sm">Event Date</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <span className="text-sm">Gift Purchase</span>
        </div>
       </div>
    </div>
  );
}
