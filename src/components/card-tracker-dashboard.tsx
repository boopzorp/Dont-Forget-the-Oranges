
"use client";

import * as React from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Gift, LogOut, Menu, PlusCircle, ShoppingCart, CalendarDays, Users, Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { ShoppingEvent, GiftItem } from "@/lib/types";
import { ThemeToggleButton } from "./theme-toggle-button";
import { useAuth } from "@/hooks/use-auth";
import type { AppName } from "@/app/dashboard/page";
import { addShoppingEvent, updateShoppingEvent, deleteShoppingEvent, addGiftItem, updateGiftItem, deleteGiftItem } from "@/lib/firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { AddEventDialog } from "./add-event-dialog";
import { AddGiftDialog } from "./add-gift-dialog";
import { formatCurrency } from "@/lib/utils";
import { CURRENCIES } from "@/lib/data";

interface CardTrackerDashboardProps {
  events: ShoppingEvent[];
  gifts: GiftItem[];
  onAppChange: (appName: AppName) => void;
}

export function CardTrackerDashboard({ events, gifts, onAppChange }: CardTrackerDashboardProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [currency, setCurrency] = React.useState(CURRENCIES[0]); // Default USD for gifts for now

  const [isEventDialogOpen, setIsEventDialogOpen] = React.useState(false);
  const [isGiftDialogOpen, setIsGiftDialogOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<ShoppingEvent | undefined>(undefined);
  const [editingGift, setEditingGift] = React.useState<GiftItem | undefined>(undefined);

  const handleEventSave = async (eventData: Omit<ShoppingEvent, 'id'> & { id?: string }) => {
    if (!user) return;
    try {
      if (eventData.id) {
        await updateShoppingEvent(user.uid, eventData as ShoppingEvent);
        toast({ title: "Event Updated", description: `${eventData.name} has been updated.` });
      } else {
        await addShoppingEvent(user.uid, eventData);
        toast({ title: "Event Added", description: `${eventData.name} has been added to your calendar.` });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save the event." });
    }
  };

  const handleGiftSave = async (giftData: Omit<GiftItem, 'id'> & { id?: string }) => {
    if (!user) return;
    try {
      if (giftData.id) {
        await updateGiftItem(user.uid, giftData as GiftItem);
        toast({ title: "Gift Updated", description: `Details for ${giftData.name} have been updated.` });
      } else {
        await addGiftItem(user.uid, giftData);
        toast({ title: "Gift Added", description: `${giftData.name} has been tracked.` });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save the gift." });
    }
  };

  const openNewEventDialog = () => {
    setEditingEvent(undefined);
    setIsEventDialogOpen(true);
  };
  
  const openNewGiftDialog = () => {
    setEditingGift(undefined);
    setIsGiftDialogOpen(true);
  };

  const sortedEvents = React.useMemo(() => 
    [...events].sort((a, b) => a.date.getTime() - b.date.getTime()), 
  [events]);

  const sortedGifts = React.useMemo(() =>
    [...gifts].sort((a,b) => b.purchaseDate.getTime() - a.purchaseDate.getTime()),
  [gifts]);

  return (
    <>
      <AddEventDialog
        isOpen={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        onConfirm={handleEventSave}
        eventToEdit={editingEvent}
      />
      <AddGiftDialog
        isOpen={isGiftDialogOpen}
        onOpenChange={setIsGiftDialogOpen}
        onConfirm={handleGiftSave}
        giftToEdit={editingGift}
        events={events}
        currency={currency}
      />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-20 items-center border-b bg-background">
          <div className="container mx-auto flex h-full items-center gap-4 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <Gift className="h-8 w-8 text-primary" />
              <div className="font-headline text-xl hidden sm:block">
                Don't Forget the Card!
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-2 md:gap-4">
              <Button size="sm" variant="outline" onClick={openNewGiftDialog}>
                  <Package className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Add Gift</span>
              </Button>
              <Button size="sm" onClick={openNewEventDialog}>
                  <PlusCircle className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Add Event</span>
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
                      <ShoppingCart className="h-5 w-5" />
                      GrocerEase
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2" onClick={() => onAppChange('gifts')}>
                      <Gift className="h-5 w-5" />
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
          <div className="container mx-auto grid gap-4 p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-7">
            
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Don't forget these important dates!</CardDescription>
              </CardHeader>
              <CardContent>
                {sortedEvents.length > 0 ? (
                  <ul className="space-y-4">
                    {sortedEvents.slice(0, 5).map(event => (
                      <li key={event.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">{event.name}</p>
                                <p className="text-sm text-muted-foreground">{format(event.date, "MMMM do, yyyy")}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-primary">{formatDistanceToNow(event.date, { addSuffix: true })}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No upcoming events.</p>
                    <p className="text-sm">Click "Add Event" to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Gifts</CardTitle>
                <CardDescription>A log of your recent gift purchases.</CardDescription>
              </CardHeader>
              <CardContent>
                {sortedGifts.length > 0 ? (
                   <ul className="space-y-4">
                    {sortedGifts.slice(0, 5).map(gift => (
                      <li key={gift.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">{gift.name}</p>
                                <p className="text-sm text-muted-foreground">For {gift.recipient}</p>
                            </div>
                          </div>
                          <p className="font-semibold">{formatCurrency(gift.price, currency)}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                   <div className="text-center py-10 text-muted-foreground">
                    <p>No gifts tracked yet.</p>
                    <p className="text-sm">Click "Add Gift" to log a purchase.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
