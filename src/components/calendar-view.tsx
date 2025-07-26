
"use client";

import * as React from "react";
import { format, getMonth, getYear, parseISO } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import type { GroceryItem, Currency, Order } from "@/lib/types";
import { formatCurrency, toDateString } from "@/lib/utils";
import { PurchaseDetailDialog } from "./purchase-detail-dialog";

interface CalendarViewProps {
  items: GroceryItem[];
  currency: Currency;
  onDeleteByDateAndGroup: (date: Date, group: string) => void;
  onUpdateGroupByDate: (date: Date, currentGroup: string, newGroup: string) => void;
}

export function CalendarView({ items, currency, onDeleteByDateAndGroup, onUpdateGroupByDate }: CalendarViewProps) {
  const [month, setMonth] = React.useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [purchasesForSelectedDate, setPurchasesForSelectedDate] = React.useState<Order[]>([]);

  const { purchaseDates, totalSpend, purchasesByDate } = React.useMemo(() => {
    const dates = new Set<string>();
    const byDate = new Map<string, Order[]>();
    let spend = 0;

    items.forEach(item => {
      item.orderHistory.forEach(order => {
        const dateKey = toDateString(order.date);
        
        dates.add(dateKey);

        const existingOrders = byDate.get(dateKey) || [];
        byDate.set(dateKey, [...existingOrders, { ...order, name: item.name }]);

        if (getMonth(order.date) === getMonth(month) && getYear(order.date) === getYear(month)) {
          spend += order.price * order.quantity;
        }
      });
    });
    
    const purchaseDateObjects = Array.from(dates).map(d => parseISO(d));

    return {
      purchaseDates: purchaseDateObjects,
      totalSpend: spend,
      purchasesByDate: byDate
    };
  }, [items, month]);
  
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const dateKey = toDateString(date);
    const purchases = purchasesByDate.get(dateKey);
    
    if (purchases && purchases.length > 0) {
      setPurchasesForSelectedDate(purchases);
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
      setPurchasesForSelectedDate([]);
    }
  };

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
  
  const handleDelete = (group: string) => {
    if (selectedDate) {
      onDeleteByDateAndGroup(selectedDate, group);
      setSelectedDate(null);
    }
  };

  const handleUpdateGroup = (currentGroup: string, newGroup: string) => {
     if (selectedDate) {
      onUpdateGroupByDate(selectedDate, currentGroup, newGroup);
      setSelectedDate(null);
    }
  }

  return (
    <>
      {selectedDate && (
        <PurchaseDetailDialog
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          date={selectedDate}
          orders={purchasesForSelectedDate}
          currency={currency}
          onDelete={handleDelete}
          onUpdateGroup={handleUpdateGroup}
        />
      )}
      <div className="flex flex-col items-center gap-4">
        <Calendar
          mode="single"
          onSelect={handleDateSelect}
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
    </>
  );
}

    