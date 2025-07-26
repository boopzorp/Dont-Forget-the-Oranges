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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { GroceryItem, Order, Category, StockStatus, Currency } from "@/lib/types";
import { CATEGORIES, CURRENCIES } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { SpendAnalysisChart } from "@/components/spend-analysis-chart";
import { ItemPriceHistoryChart } from "@/components/item-price-history-chart";
import { AddItemDialog } from "./add-item-dialog";
import { CategoryDetailDialog } from "./category-detail-dialog";

interface GroceryDashboardProps {
  initialItems: GroceryItem[];
}

export function GroceryDashboard({ initialItems }: GroceryDashboardProps) {
  const [items, setItems] = React.useState<GroceryItem[]>(initialItems);
  const [editingItem, setEditingItem] = React.useState<GroceryItem | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<Date>(new Date());
  const [currency, setCurrency] = React.useState<Currency>(CURRENCIES[1]); // Default to INR
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

  const handleStatusChange = (itemId: string, status: StockStatus) => {
    setItems(items.map(i => i.id === itemId ? { ...i, status } : i));
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

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };
  
  const closeCategoryDialog = () => {
    setSelectedCategory(null);
  };

  const ListLayout = ({ listItems }: { listItems: GroceryItem[] }) => (
    <Accordion type="multiple" className="w-full space-y-2">
      {listItems.map((item) => (
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
              <Select value={item.status} onValueChange={(value: StockStatus) => handleStatusChange(item.id, value)}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Need to Order">Need to Order</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="p-4 bg-muted/40">
                <h4 className="font-semibold mb-2 text-sm">Price History</h4>
                <ItemPriceHistoryChart orderHistory={item.orderHistory} currency={currency} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary/60">
      {selectedCategory && (
        <CategoryDetailDialog
          isOpen={!!selectedCategory}
          onClose={closeCategoryDialog}
          category={selectedCategory}
          items={items.filter(item => item.category === selectedCategory)}
          currency={currency}
        />
      )}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-headline">GrocerEase</span>
        </h1>
        <div className="ml-auto flex items-center gap-4">
           <Select onValueChange={(value) => setCurrency(CURRENCIES.find(c => c.code === value) || CURRENCIES[0])} value={currency.code}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol})</SelectItem>)}
              </SelectContent>
            </Select>
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
              Your monthly grocery spending by category. Click a bar to see details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpendAnalysisChart 
              items={items} 
              onCategoryClick={handleCategoryClick} 
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              currency={currency}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="shopping-list">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shopping-list">Shopping List ({shoppingList.length})</TabsTrigger>
              <TabsTrigger value="all-items">All Items ({items.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="shopping-list">
               <Card className="mt-4">
                  <CardHeader className="pt-4">
                      <CardTitle>Shopping List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {shoppingList.length > 0 ? (
                        <ListLayout listItems={shoppingList} />
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
                       {formatCurrency(shoppingListTotal, currency)}
                    </span>
                  </CardFooter>
               </Card>
            </TabsContent>
            <TabsContent value="all-items">
                <Card className="mt-4">
                    <CardHeader className="pt-4">
                      <CardTitle>All Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ListLayout listItems={items} />
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
      </main>
    </div>
  );
}
