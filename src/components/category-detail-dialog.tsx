"use client";

import * as React from "react";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
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
import type { GroceryItem, Category, Currency } from "@/lib/types";
import { CATEGORIES } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";


interface CategoryDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  items: GroceryItem[];
  currency: Currency;
}

export function CategoryDetailDialog({ isOpen, onClose, category, items, currency }: CategoryDetailDialogProps) {
  const getCategoryEmoji = (categoryName: string) => {
    return CATEGORIES.find((c) => c.name === categoryName)?.emoji || '🛒';
  };
  
  const getPriceTrend = (item: GroceryItem) => {
    if (item.orderHistory.length < 2) {
      return { icon: <Minus className="h-4 w-4 text-muted-foreground" />, text: "N/A", color: "" };
    }
    const lastPrice = item.orderHistory[item.orderHistory.length - 1].price;
    const prevPrice = item.orderHistory[item.orderHistory.length - 2].price;

    if (lastPrice > prevPrice) {
      const diff = (((lastPrice - prevPrice) / prevPrice) * 100).toFixed(0);
      return { icon: <ArrowUp className="h-4 w-4 text-red-500" />, text: `${diff}%`, color: "text-red-500" };
    }
    if (lastPrice < prevPrice) {
      const diff = (((prevPrice - lastPrice) / prevPrice) * 100).toFixed(0);
      return { icon: <ArrowDown className="h-4 w-4 text-green-500" />, text: `${diff}%`, color: "text-green-500" };
    }
    return { icon: <Minus className="h-4 w-4 text-muted-foreground" />, text: "0%", color: "" };
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
             <span className="text-3xl">{getCategoryEmoji(category)}</span>
             {category} Spending Details
          </DialogTitle>
          <DialogDescription>
            A detailed look at all the items in the {category} category.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Last Price Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const trend = getPriceTrend(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.price, currency)}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${trend.color}`}>
                        {trend.icon}
                        <span>{trend.text}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
