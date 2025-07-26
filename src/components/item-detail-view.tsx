
"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { GroceryItem, Currency } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ItemPriceHistoryChart } from "@/components/item-price-history-chart";

interface ItemDetailViewProps {
  item: GroceryItem;
  currency: Currency;
}

export function ItemDetailView({ item, currency }: ItemDetailViewProps) {
  const sortedHistory = [...item.orderHistory].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="p-4 bg-muted/40 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                 <h4 className="font-semibold mb-2 text-sm">Purchase History</h4>
                 {sortedHistory.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden bg-background">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Group</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedHistory.map((order, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{format(order.date, "MMM d, yyyy")}</TableCell>
                                    <TableCell>{order.quantity}</TableCell>
                                    <TableCell>{formatCurrency(order.price, currency)}</TableCell>
                                    <TableCell>
                                        {order.group && <Badge variant="secondary">{order.group}</Badge>}
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                 ) : (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed">
                        <p className="text-muted-foreground text-sm">No purchase history.</p>
                    </div>
                 )}
            </div>
             <div>
                <h4 className="font-semibold mb-2 text-sm">Price Trend</h4>
                 <div className="h-[240px] bg-background rounded-lg p-2">
                    <ItemPriceHistoryChart orderHistory={item.orderHistory} currency={currency} />
                </div>
            </div>
        </div>
    </div>
  );
}
