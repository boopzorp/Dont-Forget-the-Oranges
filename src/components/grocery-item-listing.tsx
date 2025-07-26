
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { GroceryItem, StockStatus, Currency } from "@/lib/types";
import { CATEGORIES } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { ItemPriceHistoryChart } from "@/components/item-price-history-chart";


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
  
  return (
    <Accordion type="multiple" className="w-full space-y-2">
      {items.map((item) => (
        <AccordionItem value={item.id} key={item.id} className="border-b-0 rounded-lg bg-card overflow-hidden shadow-sm">
          <div className="flex items-center px-4 py-2">
            <AccordionTrigger className="flex-1 p-0 hover:no-underline">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-2xl">{getCategoryEmoji(item.category)}</span>
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} &bull; {item.category}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <div className="flex items-center gap-4 ml-4">
              {isShoppingList ? (
                <TooltipProvider>
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="w-9 h-9 text-green-600 hover:text-green-700" onClick={() => handleStatusChange(item.id, 'In Stock')}>
                                    <CheckCircle2 className="h-5 w-5"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Mark as "In Stock"</p>
                            </TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="w-9 h-9 text-red-600 hover:text-red-700" onClick={() => handleStatusChange(item.id, 'In Stock')}>
                                    <Trash2 className="h-5 w-5"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Remove from Shopping List</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
              ) : (
                <Select value={item.status} onValueChange={(value: StockStatus) => handleStatusChange(item.id, value)}>
                    <SelectTrigger className="w-[130px] h-9">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Need to Order">Need to Order</SelectItem>
                    </SelectContent>
                </Select>
              )}
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
                  {!isShoppingList && 
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteItem(item.id)}
                    >
                        Delete
                    </DropdownMenuItem>
                  }
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <AccordionContent>
            <div className="p-4 bg-muted/40">
                <h4 className="font-semibold mb-2 text-sm">Price History</h4>
                <ItemPriceHistoryChart orderHistory={item.orderHistory} currency={currency} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
