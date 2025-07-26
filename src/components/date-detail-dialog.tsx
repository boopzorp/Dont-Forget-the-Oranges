
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ShoppingEvent, GiftItem, Currency } from "@/lib/types";
import { formatCurrency, toDateString } from "@/lib/utils";

interface DateDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: ShoppingEvent[];
  gifts: GiftItem[];
  currency: Currency;
}

export function DateDetailDialog({ isOpen, onClose, date, events, gifts, currency }: DateDetailDialogProps) {
  const { relevantEvents, relevantGifts } = React.useMemo(() => {
    const dateKey = toDateString(date);

    const relevantEvents = events.filter(event => {
        // Need to check both original date and displayDate for recurring events
        const eventDateKey = toDateString(event.date);
        const displayDateKey = event.displayDate ? toDateString(event.displayDate) : null;
        return eventDateKey === dateKey || displayDateKey === dateKey;
    });
    
    const relevantGifts = gifts.filter(gift => toDateString(gift.purchaseDate) === dateKey);
    
    return { relevantEvents, relevantGifts };
  }, [date, events, gifts]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl theme-gifts">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Details for {format(date, "MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription>
             All events and purchases for this day.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
            {relevantEvents.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2">Events</h4>
                    <div className="border rounded-lg p-2 space-y-2">
                        {relevantEvents.map(event => (
                            <div key={event.id} className="flex items-center gap-2">
                                <span className="text-xl">{event.emoji || '🗓️'}</span>
                                <span className="font-semibold">{event.name}</span>
                                <Badge variant="secondary">{event.category}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {relevantGifts.length > 0 && (
                 <div>
                    <h4 className="font-semibold mb-2">Gifts Purchased</h4>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Gift</TableHead>
                                <TableHead>Recipient</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                                {relevantGifts.map(gift => (
                                    <TableRow key={gift.id}>
                                        <TableCell className="font-medium">{gift.name}</TableCell>
                                        <TableCell>{gift.recipient}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(gift.price, currency)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                 </div>
            )}
        </div>
        
        {relevantEvents.length === 0 && relevantGifts.length === 0 && (
            <div className="flex h-24 items-center justify-center text-muted-foreground">
                No events or purchases for this day.
            </div>
        )}

        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Close</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

