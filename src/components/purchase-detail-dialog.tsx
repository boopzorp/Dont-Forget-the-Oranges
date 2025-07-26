
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order, Currency } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";


interface PurchaseDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  orders: Order[];
  currency: Currency;
  onDelete: (group: string) => void;
}

export function PurchaseDetailDialog({ isOpen, onClose, date, orders, currency, onDelete }: PurchaseDetailDialogProps) {
  const [selectedGroup, setSelectedGroup] = React.useState<string>("All");

  const uniqueGroups = React.useMemo(() => {
    const groups = new Set<string>(['All']);
    orders.forEach(order => {
      if (order.group) {
        groups.add(order.group);
      }
    });
    return Array.from(groups);
  }, [orders]);

  const filteredOrders = React.useMemo(() => {
    if (selectedGroup === "All") {
      return orders;
    }
    return orders.filter(order => order.group === selectedGroup);
  }, [orders, selectedGroup]);

  const totalSpend = filteredOrders.reduce((acc, order) => acc + (order.price * order.quantity), 0);
  
  React.useEffect(() => {
    if(isOpen) {
      setSelectedGroup("All");
    }
  }, [isOpen]);

  const handleDelete = () => {
    onDelete(selectedGroup);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Purchases on {format(date, "MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription>
            You purchased {orders.length} item(s) on this day. Filter by group below.
          </DialogDescription>
        </DialogHeader>
        
        {uniqueGroups.length > 1 && (
            <div className="my-2">
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by group..." />
                    </SelectTrigger>
                    <SelectContent>
                        {uniqueGroups.map(group => (
                            <SelectItem key={group} value={group}>
                                {group === "All" ? "All Groups" : group}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )}

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
              {filteredOrders.map((order, index) => (
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
            <div className="flex items-center justify-between w-full">
                <div className="flex items-baseline gap-2">
                    <p className="text-muted-foreground">{selectedGroup === "All" ? "Day's Total:" : `Total for ${selectedGroup}:`}</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(totalSpend, currency)}</p>
                </div>
                <div className="flex gap-2">
                    <ConfirmDeleteDialog
                        onConfirm={handleDelete}
                        title="Delete Purchase Entries?"
                        description={`Are you sure you want to delete all entries for the group '${selectedGroup}' on this date? This action cannot be undone.`}
                        disabled={filteredOrders.length === 0}
                    >
                        <Button variant="destructive" size="sm" disabled={filteredOrders.length === 0}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </ConfirmDeleteDialog>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" size="sm">Close</Button>
                    </DialogClose>
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    