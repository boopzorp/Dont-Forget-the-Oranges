"use client";

import * as React from "react";
import { Leaf, MoreHorizontal, PlusCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { GroceryItem, Order } from "@/lib/types";
import { CATEGORIES } from "@/lib/data";
import { SpendAnalysisChart } from "@/components/spend-analysis-chart";
import { ItemPriceHistoryChart } from "@/components/item-price-history-chart";
import { AddItemDialog } from "./add-item-dialog";

interface GroceryDashboardProps {
  initialItems: GroceryItem[];
}

export function GroceryDashboard({ initialItems }: GroceryDashboardProps) {
  const [items, setItems] = React.useState<GroceryItem[]>(initialItems);
  const [editingItem, setEditingItem] = React.useState<GroceryItem | undefined>(undefined);
  const { toast } = useToast();

  const handleItemAction = (itemData: Omit<GroceryItem, 'id' | 'orderHistory'> & { id?: string }) => {
    if (itemData.id) {
      // Update
      setItems(items.map((i) => {
        if (i.id === itemData.id) {
          const updatedItem = { ...i, ...itemData };
          // If price changed, add to history
          if (i.price !== updatedItem.price || i.orderHistory.length === 0) {
            updatedItem.orderHistory = [...updatedItem.orderHistory, {date: new Date(), price: updatedItem.price}]
          }
          return updatedItem;
        }
        return i;
      }));
    } else {
      // Add
      const newItem: GroceryItem = { 
        ...itemData, 
        id: new Date().toISOString(),
        orderHistory: [{date: new Date(), price: itemData.price}]
      };
      setItems([newItem, ...items]);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = items.find(item => item.id === itemId);
    if (itemToDelete) {
      setItems(items.filter((i) => i.id !== itemId));
      toast({
        title: "Item Deleted",
        description: `${itemToDelete.name} has been removed from your list.`,
        variant: "destructive"
      });
    }
  };
  
  const shoppingList = items.filter((item) => item.status === "Need to Order");
  const shoppingListTotal = shoppingList.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const getCategoryEmoji = (category: string) => {
    return CATEGORIES.find((c) => c.name === category)?.emoji || '🛒';
  };
  
  const openEditDialog = (item: GroceryItem) => {
    setEditingItem(item);
    document.getElementById('add-item-dialog-trigger')?.click();
  }

  const ListTable = ({ listItems }: { listItems: GroceryItem[] }) => (
     <Accordion type="multiple" className="w-full">
      {listItems.map((item) => (
        <AccordionItem value={item.id} key={item.id}>
           <div className="flex items-center pr-4">
             <AccordionTrigger className="flex-1">
                <Table className="w-full">
                  <TableBody>
                    <TableRow className="border-none hover:bg-transparent">
                      <TableCell className="w-[60%] p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getCategoryEmoji(item.category)}</span>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Qty: {item.quantity} &bull; {item.category}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <Badge variant={item.status === 'In Stock' ? 'secondary' : 'outline'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right p-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </AccordionTrigger>
              <div className="w-[50px]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
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
            <div className="p-4 bg-muted/50 rounded-md">
                <h4 className="font-semibold mb-2 text-sm">Price History</h4>
                <ItemPriceHistoryChart orderHistory={item.orderHistory} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-headline">GrocerEase</span>
        </h1>
        <div className="ml-auto">
          <AddItemDialog onConfirm={handleItemAction} itemToEdit={editingItem}>
             <Button id="add-item-dialog-trigger" onClick={() => setEditingItem(undefined)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </AddItemDialog>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
            <CardDescription>
              Your monthly grocery spending by category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpendAnalysisChart items={items} />
          </CardContent>
        </Card>

        <Card>
          <Tabs defaultValue="shopping-list">
            <div className="flex items-center p-4">
                <TabsList>
                  <TabsTrigger value="shopping-list">Shopping List</TabsTrigger>
                  <TabsTrigger value="all-items">All Items</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="shopping-list">
              <CardHeader className="pt-0">
                  <CardTitle>Shopping List</CardTitle>
              </CardHeader>
              <CardContent>
                {shoppingList.length > 0 ? (
                    <ListTable listItems={shoppingList} />
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Your shopping list is empty!</p>
                        <p className="text-sm">Items marked "Need to Order" will appear here.</p>
                    </div>
                )}
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t pt-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  ${shoppingListTotal.toFixed(2)}
                </span>
              </CardFooter>
            </TabsContent>
            <TabsContent value="all-items">
                <CardHeader className="pt-0">
                  <CardTitle>All Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <ListTable listItems={items} />
                </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
