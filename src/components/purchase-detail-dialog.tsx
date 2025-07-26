
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
import type { Order, Currency } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface PurchaseDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  orders: Order[];
  currency: Currency;
}

export function PurchaseDetailDialog({ isOpen, onClose, date, orders, currency }: PurchaseDetailDialogProps) {
  const totalSpend = orders.reduce((acc, order) => acc + (order.price * order.quantity), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Purchases on {format(date, "MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription>
            You purchased {orders.length} item(s) on this day.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-y-auto my-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{order.name}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{formatCurrency(order.price, currency)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(order.price * order.quantity, currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter className="sm:justify-between border-t pt-4">
            <div className="flex items-baseline gap-2">
                <p className="text-muted-foreground">Day's Total:</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalSpend, currency)}</p>
            </div>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Close</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
