
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
import { formatCurrency } from "@/lib/utils";

interface EventDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: ShoppingEvent;
  gifts: GiftItem[];
  currency: Currency;
}

export function EventDetailDialog({ isOpen, onClose, event, gifts, currency }: EventDetailDialogProps) {
  const linkedGifts = React.useMemo(() => {
    return gifts.filter(gift => gift.forEventId === event.id);
  }, [gifts, event]);
  
  const totalGiftSpend = linkedGifts.reduce((acc, gift) => acc + gift.price, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl theme-gifts">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-3xl">{event.emoji || '🗓️'}</span>
            {event.name}
          </DialogTitle>
          <DialogDescription>
             Details for {event.name} on {format(event.displayDate || event.date, 'MMMM d, yyyy')}.
             {event.notes && <p className="pt-2 italic">Notes: "{event.notes}"</p>}
          </DialogDescription>
        </DialogHeader>
        
        <h4 className="font-semibold">Linked Gifts</h4>
        <div className="max-h-[40vh] overflow-y-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gift</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Purchased On</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linkedGifts.length > 0 ? (
                linkedGifts.map(gift => (
                  <TableRow key={gift.id}>
                    <TableCell className="font-medium">{gift.name}</TableCell>
                    <TableCell>{gift.recipient}</TableCell>
                    <TableCell>{format(gift.purchaseDate, "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(gift.price, currency)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No gifts have been linked to this event yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="sm:justify-between border-t pt-4">
            <div className="flex items-baseline gap-2">
                <p className="text-muted-foreground">Total Spend for Event:</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalGiftSpend, currency)}</p>
            </div>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Close</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
