
"use client";

import * as React from "react";
import { MoreHorizontal, Trash2, CheckCircle2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { GroceryItem, StockStatus, Currency } from "@/lib/types";
import { CATEGORIES } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";
import { ItemDetailView } from "./item-detail-view";


interface GroceryItemListingProps {
    items: GroceryItem[];
    currency: Currency;
    handleStatusChange: (itemId: string, status: StockStatus) => void;
    handleDeleteItem: (itemId: string) => void;
    openEditDialog: (item: GroceryItem) => void;
    isShoppingList?: boolean;
}

export function GroceryItemListing({ 
    items, 
    currency,
    handleStatusChange,
    handleDeleteItem,
    openEditDialog,
    isShoppingList = false
}: GroceryItemListingProps) {

  const getCategoryEmoji = (category: string) => {
    return CATEGORIES.find((c) => c.name === category)?.emoji || '🛒';
  };
  
  const getStatusClass = (status: StockStatus) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800";
      case "Need to Order":
        return "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800";
      case "Don't Need":
        return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700";
      default:
        return "bg-background";
    }
  };


  return (
    <Accordion type="multiple" className="w-full space-y-2">
      {items.map((item) => (
        <AccordionItem value={item.id} key={item.id} className="border-b-0 rounded-lg bg-card overflow-hidden shadow-sm">
           <div className="flex flex-col md:flex-row md:items-center p-2 md:p-4">
             <AccordionTrigger className="flex-1 p-0 hover:no-underline [&>svg]:hidden md:[&>svg]:block">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-2xl ml-2 md:ml-0">{getCategoryEmoji(item.category)}</span>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate pr-2">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.category}
                  </p>
                </div>
              </div>
            </AccordionTrigger>

            <div className="flex items-center justify-between gap-2 md:gap-4 mt-2 md:mt-0 md:ml-auto md:pl-4">
              <div className="flex-1 md:flex-none">
                {isShoppingList ? (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-300 w-full justify-center" onClick={() => handleStatusChange(item.id, 'In Stock')}>
                          <CheckCircle2 className="h-4 w-4 mr-2"/>
                          Got it
                      </Button>
                       <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-4 w-4 mr-2"/>
                          Remove
                      </Button>
                    </div>
                ) : (
                  <Select value={item.status} onValueChange={(value: StockStatus) => handleStatusChange(item.id, value)}>
                      <SelectTrigger className={cn("w-full md:w-[130px] h-9 font-semibold", getStatusClass(item.status))}>
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="Need to Order">Need to Order</SelectItem>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      <SelectItem value="Don't Need">Don't Need</SelectItem>
                      </SelectContent>
                  </Select>
                )}
              </div>
              <p className="font-bold w-[80px] text-right">
                {formatCurrency(item.price * item.quantity, currency)}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="w-8 h-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(item)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteItem(item.id)}
                  >
                      Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <AccordionContent>
            <ItemDetailView item={item} currency={currency} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
