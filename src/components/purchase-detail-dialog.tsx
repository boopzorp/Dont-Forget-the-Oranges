
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Trash2, Edit } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  onUpdateGroup: (currentGroup: string, newGroup: string) => void;
}

export function PurchaseDetailDialog({ isOpen, onClose, date, orders, currency, onDelete, onUpdateGroup }: PurchaseDetailDialogProps) {
  const [selectedGroup, setSelectedGroup] = React.useState<string>("All");
  const [newGroupName, setNewGroupName] = React.useState("");

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
      setNewGroupName("");
    }
  }, [isOpen]);

  const handleDelete = () => {
    onDelete(selectedGroup);
  };

  const handleUpdateGroup = () => {
    if (newGroupName.trim()) {
      onUpdateGroup(selectedGroup, newGroupName.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Purchases on {format(date, "MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription>
            View, filter, and manage purchase entries for this day.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            <div>
                <Label>Filter by group</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger>
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
            <div>
                <Label>Change selected group to</Label>
                <div className="flex gap-2">
                     <Input 
                        placeholder="New group name..." 
                        value={newGroupName} 
                        onChange={(e) => setNewGroupName(e.target.value)}
                        disabled={filteredOrders.length === 0}
                    />
                    <Button onClick={handleUpdateGroup} disabled={!newGroupName.trim() || filteredOrders.length === 0}>
                        <Edit className="mr-2 h-4 w-4" />
                        Update
                    </Button>
                </div>
            </div>
        </div>

        <div className="max-h-[40vh] overflow-y-auto my-4 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? filteredOrders.map((order, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{order.name}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{formatCurrency(order.price, currency)}</TableCell>
                  <TableCell>{order.group || 'N/A'}</TableCell>
                  <TableCell className="font-semibold text-right">{formatCurrency(order.price * order.quantity, currency)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No items match the current filter.
                    </TableCell>
                </TableRow>
              )}
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
                        title={`Delete entries from ${selectedGroup}?`}
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

    