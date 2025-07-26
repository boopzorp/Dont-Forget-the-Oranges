
"use client";

import * as React from "react";
import { Leaf, MoreHorizontal, PlusCircle, Upload, Loader2 } from "lucide-react";
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

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { GroceryItem, Category, StockStatus, Currency } from "@/lib/types";
import { CURRENCIES, CATEGORIES } from "@/lib/data";
import { formatCurrency, cn } from "@/lib/utils";
import { SpendAnalysisChart } from "@/components/spend-analysis-chart";
import { AddItemDialog } from "./add-item-dialog";
import { CategoryDetailDialog } from "./category-detail-dialog";
import { GroceryItemListing } from "./grocery-item-listing";
import { ConfirmPurchaseDialog } from "./confirm-purchase-dialog";
import { extractGroceriesFromImage, ExtractedGroceryItem } from "@/ai/flows/extract-groceries-flow";

interface GroceryDashboardProps {
  initialItems: GroceryItem[];
}

export function GroceryDashboard({ initialItems }: GroceryDashboardProps) {
  const [items, setItems] = React.useState<GroceryItem[]>(initialItems);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<GroceryItem | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<Date>(new Date());
  const [currency, setCurrency] = React.useState<Currency>(CURRENCIES[1]); // Default to INR
  const [isProcessingImage, setIsProcessingImage] = React.useState(false);
  const [extractedItemsPendingConfirmation, setExtractedItemsPendingConfirmation] = React.useState<ExtractedGroceryItem[]>([]);
  const [isConfirmPurchaseDialogOpen, setIsConfirmPurchaseDialogOpen] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
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

  const handleDeleteItem = (itemId: string, fromShoppingList: boolean) => {
    const itemToUpdate = items.find(item => item.id === itemId);
    if (itemToUpdate) {
      if (fromShoppingList) {
        handleStatusChange(itemId, "Don't Need");
        toast({
          title: "Item Removed",
          description: `${itemToUpdate.name} has been moved to "Don't Need".`
        });
      } else {
        setItems(items.filter((i) => i.id !== itemId));
        toast({
          title: "Item Deleted",
          description: `${itemToUpdate.name} has been permanently removed.`,
          variant: "destructive"
        });
      }
    }
  };

  const handleStatusChange = (itemId: string, status: StockStatus) => {
    setItems(items.map(i => {
        if (i.id === itemId) {
            const updatedItem = { ...i, status };
            // If item is moved to "In Stock" from "Need to Order", add a new order history record
            if (status === 'In Stock' && i.status === 'Need to Order') {
                updatedItem.orderHistory = [...updatedItem.orderHistory, {date: new Date(), price: updatedItem.price}];
                toast({
                    title: "Item Stocked",
                    description: `${i.name} marked as "In Stock" and purchase recorded.`,
                });
            }
            return updatedItem;
        }
        return i;
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    toast({
      title: "Processing Image...",
      description: "The AI is analyzing your grocery list.",
    });

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const photoDataUri = reader.result as string;
        const extractedItems = await extractGroceriesFromImage({ photoDataUri });
        
        if (extractedItems.length > 0) {
            setExtractedItemsPendingConfirmation(extractedItems);
            setIsConfirmPurchaseDialogOpen(true);
        } else {
            toast({
              variant: "destructive",
              title: "No items found",
              description: "The AI could not find any grocery items in the image.",
            });
        }

      } catch (error) {
        console.error("Error processing image:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem processing your image. Please try again.",
        });
      } finally {
        setIsProcessingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "Could not read the selected file.",
      });
      setIsProcessingImage(false);
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleConfirmPurchase = (purchaseDate: Date) => {
    let updatedItemsCount = 0;
    let newItemsCount = 0;

    const updatedItems = items.map(existingItem => {
        const matchingExtractedItem = extractedItemsPendingConfirmation.find(
            (extracted) => extracted.name.toLowerCase() === existingItem.name.toLowerCase()
        );

        if (matchingExtractedItem) {
            updatedItemsCount++;
            return {
                ...existingItem,
                status: 'In Stock' as StockStatus,
                price: matchingExtractedItem.price ?? existingItem.price,
                orderHistory: [
                    ...existingItem.orderHistory,
                    { date: purchaseDate, price: matchingExtractedItem.price ?? existingItem.price },
                ],
            };
        }
        return existingItem;
    });

    const newItems: GroceryItem[] = extractedItemsPendingConfirmation
        .filter(extractedItem => 
            !items.some(existingItem => existingItem.name.toLowerCase() === extractedItem.name.toLowerCase())
        )
        .map((item: ExtractedGroceryItem) => {
            newItemsCount++;
            return {
                id: new Date().toISOString() + Math.random(),
                name: item.name,
                category: item.category,
                price: item.price ?? 0,
                quantity: 1,
                status: 'In Stock',
                orderHistory: [{ date: purchaseDate, price: item.price ?? 0 }],
            };
        });

    setItems([...updatedItems, ...newItems]);

    toast({
        title: "Success!",
        description: `${newItemsCount} new items added and ${updatedItemsCount} existing items updated.`,
    });
    setExtractedItemsPendingConfirmation([]);
    setIsConfirmPurchaseDialogOpen(false);
};


  const shoppingList = items.filter((item) => item.status === "Need to Order");
  const shoppingListTotal = shoppingList.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  
  const openEditDialog = (item: GroceryItem) => {
    setEditingItem(item);
    setIsAddItemDialogOpen(true);
  }

  const openNewItemDialog = () => {
    setEditingItem(undefined);
    setIsAddItemDialogOpen(true);
  }

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };
  
  const closeCategoryDialog = () => {
    setSelectedCategory(null);
  };

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
      <AddItemDialog 
        onConfirm={handleItemAction} 
        itemToEdit={editingItem}
        isOpen={isAddItemDialogOpen}
        onOpenChange={setIsAddItemDialogOpen}
        currency={currency}
      >
        {/* Empty child to use this as a controlled dialog */}
        <div/>
      </AddItemDialog>
      <ConfirmPurchaseDialog
        isOpen={isConfirmPurchaseDialogOpen}
        onClose={() => setIsConfirmPurchaseDialogOpen(false)}
        onConfirm={handleConfirmPurchase}
        itemCount={extractedItemsPendingConfirmation.length}
       />
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />

      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background px-4 md:px-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-headline hidden md:inline">GrocerEase</span>
        </h1>
        <div className="ml-auto flex items-center gap-2 md:gap-4">
           <Select onValueChange={(value) => setCurrency(CURRENCIES.find(c => c.code === value) || CURRENCIES[0])} value={currency.code}>
              <SelectTrigger className="w-[100px] md:w-[120px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol})</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isProcessingImage}>
                {isProcessingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin md:mr-2" />
                ) : (
                    <Upload className="h-4 w-4 md:mr-2" />
                )}
                <span className="hidden md:inline">Upload List</span>
            </Button>
            <Button size="sm" onClick={openNewItemDialog}>
                <PlusCircle className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Add Item</span>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-2 md:p-8">
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
                        <GroceryItemListing 
                          items={shoppingList} 
                          currency={currency}
                          handleStatusChange={handleStatusChange}
                          handleDeleteItem={(itemId) => handleDeleteItem(itemId, true)}
                          openEditDialog={openEditDialog}
                          isShoppingList={true}
                        />
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
                        <GroceryItemListing 
                           items={items} 
                           currency={currency}
                           handleStatusChange={handleStatusChange}
                           handleDeleteItem={(itemId) => handleDeleteItem(itemId, false)}
                           openEditDialog={openEditDialog}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
      </main>
    </div>
  );
}
