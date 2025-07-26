
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ConfirmPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date, group: string) => void;
  itemCount: number;
}

export function ConfirmPurchaseDialog({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
}: ConfirmPurchaseDialogProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [group, setGroup] = React.useState("Personal");

  const handleConfirm = () => {
    if (date) {
      onConfirm(date, group);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            The AI found {itemCount} items in your list. Confirm the purchase date and assign a spending group.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div>
                <Label htmlFor="purchase-date" className="mb-2 block">Purchase Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="purchase-date"
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(d) => d > new Date()}
                    />
                    </PopoverContent>
                </Popover>
            </div>
            <div>
                <Label htmlFor="group-name" className="mb-2 block">Spending Group</Label>
                 <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="group-name"
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                        placeholder="e.g., Personal, Groceries, Work"
                        className="pl-9"
                    />
                 </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!date || !group}>
            Confirm Purchase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
