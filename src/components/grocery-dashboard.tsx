

"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, PlusCircle, Upload, Loader2, LogOut, ChevronDown, X, Menu, ShoppingCart, Gift } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { GroceryItem, Category, StockStatus, Currency } from "@/lib/types";
import { CURRENCIES, getAvailableMonths, CATEGORIES } from "@/lib/data";
import { formatCurrency, cn, toDateString } from "@/lib/utils";
import { SpendAnalysisChart } from "@/components/spend-analysis-chart";
import { GroupSpendChart } from "@/components/group-spend-chart";
import { CalendarView } from "@/components/calendar-view";
import { AddItemDialog } from "./add-item-dialog";
import { CategoryDetailDialog } from "./category-detail-dialog";
import { GroceryItemListing } from "./grocery-item-listing";
import { ConfirmPurchaseDialog } from "./confirm-purchase-dialog";
import { extractGroceriesFromImage, ExtractedGroceryItem } from "@/ai/flows/extract-groceries-flow";
import { ThemeToggleButton } from "./theme-toggle-button";
import { Logo } from "./logo";
import { useAuth } from "@/hooks/use-auth";
import { addItem, updateItem, deleteItem } from "@/lib/firebase/firestore";
import type { AppName } from "@/app/dashboard/page";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

interface GroceryDashboardProps {
  initialItems: GroceryItem[];
  onAppChange: (appName: AppName) => void;
}

export function GroceryDashboard({ initialItems, onAppChange }: GroceryDashboardProps) {
  const { user, signOut } = useAuth();
  const [items, setItems] = React.useState<GroceryItem[]>(initialItems);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<GroceryItem | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<Date>(new Date());
  const [currency, setCurrency] = React.useState<Currency>(CURRENCIES[1]); // Default to INR
  const [isProcessingImage, setIsProcessingImage] = React.useState(false);
  const [extractedItemsPendingConfirmation, setExtractedItemsPendingConfirmation] = React.useState<ExtractedGroceryItem[]>([]);
  const [isConfirmPurchaseDialogOpen, setIsConfirmPurchaseDialogOpen] = React.useState(false);

  const [allItemsCategoryFilter, setAllItemsCategoryFilter] = React.useState<string>('All');
  const [allItemsStatusFilter, setAllItemsStatusFilter] = React.useState<string>('All');
  const [shoppingListCategoryFilter, setShoppingListCategoryFilter] = React.useState<string>('All');

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleItemAction = async (itemData: Omit<GroceryItem, 'id' | 'orderHistory'> & { id?: string }) => {
    if (!user) return;
    if (itemData.id) {
      const existingItem = items.find(i => i.id === itemData.id);
      if (!existingItem) return;
      
      const updatedItem: GroceryItem = { ...existingItem, ...itemData };
      if (itemData.status === 'In Stock' && existingItem.status !== 'In Stock') {
        updatedItem.orderHistory.push({
          date: new Date(),
          price: updatedItem.price,
          group: updatedItem.defaultGroup || "Personal",
          quantity: updatedItem.quantity
        });
      }
      await updateItem(user.uid, updatedItem);

    } else {
      const newItem: Omit<GroceryItem, 'id'> = { 
        ...itemData, 
        orderHistory: []
      };
      if (newItem.status === 'In Stock') {
        newItem.orderHistory.push({
            date: new Date(), 
            price: itemData.price, 
            group: itemData.defaultGroup || 'Personal',
            quantity: itemData.quantity
        });
      }
      await addItem(user.uid, newItem);
    }
  };

  const handleDeleteItem = async (itemId: string, fromShoppingList: boolean) => {
    if (!user) return;
    const itemToDelete = items.find(item => item.id === itemId);
    if (itemToDelete) {
      if (fromShoppingList) {
        await handleStatusChange(itemId, "Don't Need");
        toast({
          title: "Item Removed",
          description: `${itemToDelete.name} has been moved to "Don't Need".`
        });
      } else {
        await deleteItem(user.uid, itemId);
        toast({
          title: "Item Deleted",
          description: `${itemToDelete.name} has been permanently removed.`,
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteByDateAndGroup = async (date: Date, group: string) => {
    if (!user) return;

    const dateKeyToDelete = toDateString(date);
    const itemsToUpdate: GroceryItem[] = [];

    items.forEach(item => {
      const originalHistoryLength = item.orderHistory.length;
      const newOrderHistory = item.orderHistory.filter(order => {
        const orderDateKey = toDateString(order.date);
        if (orderDateKey !== dateKeyToDelete) {
          return true; // Keep orders from other dates
        }
        // For the target date, check the group
        if (group === "All") {
          return false; // Delete all entries for this date
        }
        return order.group !== group; // Keep if group doesn't match
      });

      if (newOrderHistory.length < originalHistoryLength) {
        itemsToUpdate.push({ ...item, orderHistory: newOrderHistory });
      }
    });

    if (itemsToUpdate.length > 0) {
      const updatePromises = itemsToUpdate.map(item => updateItem(user.uid, item));
      await Promise.all(updatePromises);
      toast({
        title: "Entries Deleted",
        description: `Purchase history for ${format(date, 'PPP')} (${group}) has been removed.`,
      });
    } else {
       toast({
        variant: "destructive",
        title: "No Entries Found",
        description: `No purchase history found for ${format(date, 'PPP')} with the group '${group}'.`,
      });
    }
  };

  const handleUpdateGroupForDate = async (date: Date, currentGroup: string, newGroup: string) => {
    if (!user || !newGroup) return;

    const dateKeyToUpdate = toDateString(date);
    const itemsToUpdate: GroceryItem[] = [];

    items.forEach(item => {
      let itemModified = false;
      const newOrderHistory = item.orderHistory.map(order => {
        const orderDateKey = toDateString(order.date);
        if (orderDateKey === dateKeyToUpdate) {
          if (currentGroup === "All" || order.group === currentGroup) {
            if (order.group !== newGroup) {
              itemModified = true;
              return { ...order, group: newGroup };
            }
          }
        }
        return order;
      });

      if (itemModified) {
        itemsToUpdate.push({ ...item, orderHistory: newOrderHistory });
      }
    });
    
    if (itemsToUpdate.length > 0) {
      const updatePromises = itemsToUpdate.map(item => updateItem(user.uid, item));
      await Promise.all(updatePromises);
      toast({
        title: "Entries Updated",
        description: `Group for purchases on ${format(date, 'PPP')} changed to '${newGroup}'.`,
      });
    } else {
      toast({
        title: "No Changes Made",
        description: `No entries needed to be updated for the selected criteria.`,
      });
    }
  };


  const handleStatusChange = async (itemId: string, status: StockStatus, newQuantity?: number) => {
    if (!user) return;
    const itemToUpdate = items.find(i => i.id === itemId);
    if (itemToUpdate) {
        const updatedItem = { ...itemToUpdate, status };
        
        // When moving to shopping list, reset quantity to 1
        if (status === 'Need to Order') {
          updatedItem.quantity = 1;
        }

        if (status === 'In Stock' && itemToUpdate.status !== 'In Stock') {
            updatedItem.orderHistory = [
              ...updatedItem.orderHistory,
              {
                date: new Date(),
                price: itemToUpdate.price,
                group: itemToUpdate.defaultGroup || 'Personal',
                quantity: newQuantity || itemToUpdate.quantity
              }
            ];
            toast({
                title: "Item Stocked",
                description: `${itemToUpdate.name} marked as "In Stock" and purchase recorded.`,
            });
        }
        await updateItem(user.uid, updatedItem);
    }
  };

   const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (!user) return;
    if (newQuantity < 1) return; // Prevent quantity from going below 1

    const itemToUpdate = items.find(i => i.id === itemId);
    if (itemToUpdate) {
      const updatedItem = { ...itemToUpdate, quantity: newQuantity };
      await updateItem(user.uid, updatedItem);
    }
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
    reader.onload = async (e) => {
      try {
        const photoDataUri = e.target?.result as string;
        if (!photoDataUri) {
          throw new Error("Could not read file");
        }
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
  
  const handleConfirmPurchase = async (purchaseDate: Date, group: string) => {
    if (!user) return;

    const promises: Promise<any>[] = [];

    let updatedItemsCount = 0;
    let newItemsCount = 0;
    
    items.forEach(existingItem => {
        const matchingExtractedItem = extractedItemsPendingConfirmation.find(
            (extracted) => extracted.name.toLowerCase() === existingItem.name.toLowerCase()
        );

        if (matchingExtractedItem) {
            updatedItemsCount++;
            const updated = {
                ...existingItem,
                status: 'In Stock' as StockStatus,
                price: matchingExtractedItem.price ?? existingItem.price,
                quantity: (existingItem.quantity || 1) + (matchingExtractedItem.quantity || 1) -1, // Simple addition for now
                orderHistory: [
                    ...existingItem.orderHistory,
                    { date: purchaseDate, price: matchingExtractedItem.price ?? existingItem.price, group, quantity: matchingExtractedItem.quantity || 1 },
                ],
            };
            promises.push(updateItem(user.uid, updated));
        }
    });
    
    const newItemsToAdd: Omit<GroceryItem, 'id'>[] = extractedItemsPendingConfirmation
      .filter(extractedItem => 
          !items.some(existingItem => existingItem.name.toLowerCase() === extractedItem.name.toLowerCase())
      )
      .map((item: ExtractedGroceryItem) => {
          newItemsCount++;
          return {
              name: item.name,
              category: item.category,
              price: item.price ?? 0,
              quantity: item.quantity || 1,
              status: 'In Stock',
              orderHistory: [{ date: purchaseDate, price: item.price ?? 0, group, quantity: item.quantity || 1 }],
              defaultGroup: group,
          };
      });

    newItemsToAdd.forEach(newItem => {
        promises.push(addItem(user.uid, newItem));
    });
    
    await Promise.all(promises);

    toast({
        title: "Success!",
        description: `${newItemsCount} new items added and ${updatedItemsCount} existing items updated.`,
    });
    setExtractedItemsPendingConfirmation([]);
    setIsConfirmPurchaseDialogOpen(false);
  };


  const shoppingList = items.filter((item) => item.status === "Need to Order");

  const filteredShoppingList = React.useMemo(() => {
    return shoppingList.filter(item => {
      const categoryMatch = shoppingListCategoryFilter === 'All' || item.category === shoppingListCategoryFilter;
      return categoryMatch;
    });
  }, [shoppingList, shoppingListCategoryFilter]);


  const shoppingListTotal = filteredShoppingList.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const filteredItems = React.useMemo(() => {
    return items.filter(item => {
      const categoryMatch = allItemsCategoryFilter === 'All' || item.category === allItemsCategoryFilter;
      const statusMatch = allItemsStatusFilter === 'All' || item.status === allItemsStatusFilter;
      return categoryMatch && statusMatch;
    });
  }, [items, allItemsCategoryFilter, allItemsStatusFilter]);
  
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
  
  const availableMonths = React.useMemo(() => getAvailableMonths(items), [items]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
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

      <header className="sticky top-0 z-30 flex h-20 items-center border-b bg-background">
        <div className="container mx-auto flex h-full items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
              <Logo />
              <div className="font-headline text-xl hidden sm:block">
                Don't Forget the Oranges!
              </div>
          </Link>
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
            <ThemeToggleButton />
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle className="sr-only">Main Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="grid gap-4 text-lg font-medium mt-8">
                      <Button variant="ghost" className="justify-start gap-2" onClick={() => onAppChange('groceries')}>
                          <Logo />
                          Don't Forget the Oranges!
                      </Button>
                      <Button variant="ghost" className="justify-start gap-2" onClick={() => onAppChange('gifts')}>
                          <Image src="/card-logo.png" alt="Card App Logo" width={32} height={32} className="h-8 w-8" />
                          Don't Forget the Card!
                      </Button>
                        <Button variant="ghost" className="justify-start gap-2 text-muted-foreground" onClick={signOut}>
                          <LogOut className="h-5 w-5" />
                          Log Out
                      </Button>
                  </nav>
                </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto space-y-4 p-4 sm:p-6">
          {/* Desktop view: Grid */}
          <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                 <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Spending Overview</CardTitle>
                    <CardDescription>
                      Your monthly grocery spending by category.
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        {format(selectedMonth, "MMMM yyyy")}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {availableMonths.map((month) => (
                        <DropdownMenuItem key={month.toISOString()} onSelect={() => setSelectedMonth(month)}>
                          {format(month, "MMMM yyyy")}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                <SpendAnalysisChart 
                  items={items} 
                  onCategoryClick={handleCategoryClick} 
                  selectedMonth={selectedMonth}
                  currency={currency}
                />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Spending by Group</CardTitle>
                <CardDescription>
                  Your monthly grocery spending by custom group.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GroupSpendChart 
                  items={items} 
                  selectedMonth={selectedMonth}
                  currency={currency}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Mobile view: Tabs */}
          <div className="md:hidden">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Spending Overview</TabsTrigger>
                <TabsTrigger value="groups">Group Spending</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <Card className="mt-4">
                  <CardHeader>
                     <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Spending Overview</CardTitle>
                        <CardDescription>
                          Monthly spending by category.
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            {format(selectedMonth, "MMM yy")}
                            <ChevronDown className="ml-1 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {availableMonths.map((month) => (
                            <DropdownMenuItem key={month.toISOString()} onSelect={() => setSelectedMonth(month)}>
                              {format(month, "MMMM yyyy")}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <SpendAnalysisChart 
                      items={items} 
                      onCategoryClick={handleCategoryClick} 
                      selectedMonth={selectedMonth}
                      currency={currency}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="groups">
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Spending by Group</CardTitle>
                    <CardDescription>
                      Monthly spending by custom group.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GroupSpendChart 
                      items={items} 
                      selectedMonth={selectedMonth}
                      currency={currency}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>


          <Tabs defaultValue="shopping-list">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="shopping-list">
                  Shopping List
                  <span className="hidden sm:inline-block ml-1">({filteredShoppingList.length})</span>
                </TabsTrigger>
                <TabsTrigger value="all-items">
                  All Items
                  <span className="hidden sm:inline-block ml-1">({filteredItems.length})</span>
                </TabsTrigger>
                <TabsTrigger value="calendar-view">Calendar</TabsTrigger>
              </TabsList>
              <TabsContent value="shopping-list">
                <Card className="mt-4">
                    <CardHeader className="flex flex-row items-center justify-between pt-4">
                        <CardTitle>Shopping List</CardTitle>
                        <div className="flex items-center gap-2">
                            <Select value={shoppingListCategoryFilter} onValueChange={setShoppingListCategoryFilter}>
                                <SelectTrigger className="w-[150px] h-9">
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Categories</SelectItem>
                                    {CATEGORIES.map(cat => <SelectItem key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             {shoppingListCategoryFilter !== 'All' && (
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShoppingListCategoryFilter('All')}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                      <GroceryItemListing 
                        items={filteredShoppingList} 
                        currency={currency}
                        handleStatusChange={handleStatusChange}
                        handleQuantityChange={handleQuantityChange}
                        handleDeleteItem={(itemId) => handleDeleteItem(itemId, true)}
                        openEditDialog={openEditDialog}
                        isShoppingList={true}
                        hasActiveFilter={shoppingListCategoryFilter !== 'All'}
                      />
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
                      <CardHeader className="flex flex-row items-center justify-between pt-4">
                        <CardTitle>All Items</CardTitle>
                        <div className="flex items-center gap-2">
                             <Select value={allItemsStatusFilter} onValueChange={setAllItemsStatusFilter}>
                                <SelectTrigger className="w-[150px] h-9">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Statuses</SelectItem>
                                    <SelectItem value="In Stock">In Stock</SelectItem>
                                    <SelectItem value="Need to Order">Need to Order</SelectItem>
                                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                    <SelectItem value="Don't Need">Don't Need</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={allItemsCategoryFilter} onValueChange={setAllItemsCategoryFilter}>
                                <SelectTrigger className="w-[150px] h-9">
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Categories</SelectItem>
                                    {CATEGORIES.map(cat => <SelectItem key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {(allItemsCategoryFilter !== 'All' || allItemsStatusFilter !== 'All') && (
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setAllItemsCategoryFilter('All'); setAllItemsStatusFilter('All'); }}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                      </CardHeader>
                      <CardContent>
                          <GroceryItemListing 
                            items={filteredItems} 
                            currency={currency}
                            handleStatusChange={handleStatusChange}
                            handleQuantityChange={handleQuantityChange}
                            handleDeleteItem={(itemId) => handleDeleteItem(itemId, false)}
                            openEditDialog={openEditDialog}
                            hasActiveFilter={allItemsCategoryFilter !== 'All' || allItemsStatusFilter !== 'All'}
                          />
                      </CardContent>
                  </Card>
              </TabsContent>
              <TabsContent value="calendar-view">
                  <Card className="mt-4">
                      <CardHeader className="pt-4">
                        <CardTitle>Purchase Calendar</CardTitle>
                        <CardDescription>
                          Days you went grocery shopping are highlighted.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                          <CalendarView 
                            items={items} 
                            currency={currency} 
                            onDeleteByDateAndGroup={handleDeleteByDateAndGroup}
                            onUpdateGroupByDate={handleUpdateGroupForDate}
                           />
                      </CardContent>
                  </Card>
              </TabsContent>
            </Tabs>
        </div>
      </main>
    </div>
  );
}
