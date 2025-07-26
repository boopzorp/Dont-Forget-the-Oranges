
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { format, formatDistanceToNow, getYear } from "date-fns";
import { LogOut, Menu, PlusCircle, CalendarDays, Users, Package, MoreHorizontal, Trash2, Pencil, Archive } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { ShoppingEvent, GiftItem, AppName, Currency } from "@/lib/types";
import { ThemeToggleButton } from "./theme-toggle-button";
import { useAuth } from "@/hooks/use-auth";
import { addShoppingEvent, updateShoppingEvent, deleteShoppingEvent, addGiftItem, updateGiftItem, deleteGiftItem } from "@/lib/firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { AddEventDialog } from "./add-event-dialog";
import { AddGiftDialog } from "./add-gift-dialog";
import { GiftCalendarView } from "./gift-calendar-view";
import { DateDetailDialog } from "./date-detail-dialog";
import { formatCurrency, toDateString } from "@/lib/utils";
import { CURRENCIES } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Logo } from "./logo";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { EventDetailDialog } from "./event-detail-dialog";


interface CardTrackerDashboardProps {
  events: ShoppingEvent[];
  gifts: GiftItem[];
  onAppChange: (appName: AppName) => void;
}

export function CardTrackerDashboard({ events, gifts, onAppChange }: CardTrackerDashboardProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [currency, setCurrency] = React.useState<Currency>(CURRENCIES[1]); // Default to INR

  const [isEventDialogOpen, setIsEventDialogOpen] = React.useState(false);
  const [isGiftDialogOpen, setIsGiftDialogOpen] = React.useState(false);
  const [isDateDetailOpen, setIsDateDetailOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<ShoppingEvent | undefined>(undefined);
  const [editingGift, setEditingGift] = React.useState<GiftItem | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = React.useState<ShoppingEvent | undefined>(undefined);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);


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
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Could not save the event." });
    }
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;
    try {
      await deleteShoppingEvent(user.uid, eventId);
      toast({ title: "Event Deleted", description: "The event has been removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete the event." });
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
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Could not save the gift." });
    }
  };
  
  const handleDeleteGift = async (giftId: string) => {
    if (!user) return;
    try {
      await deleteGiftItem(user.uid, giftId);
      toast({ title: "Gift Deleted", description: "The gift has been removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete the gift." });
    }
  };

  const openNewEventDialog = () => {
    setEditingEvent(undefined);
    setIsEventDialogOpen(true);
  };
  
  const openEditEventDialog = (event: ShoppingEvent) => {
    setEditingEvent(event);
    setIsEventDialogOpen(true);
  };
  
  const openNewGiftDialog = () => {
    setEditingGift(undefined);
    setIsGiftDialogOpen(true);
  };
  
  const openEditGiftDialog = (gift: GiftItem) => {
    setEditingGift(gift);
    setIsGiftDialogOpen(true);
  };
  
  const openDateDetailDialog = (date: Date) => {
    setSelectedDate(date);
    setIsDateDetailOpen(true);
  }

  const { upcomingEvents, pastEvents } = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming: ShoppingEvent[] = [];
    const past: ShoppingEvent[] = [];

    events.forEach(event => {
      let nextOccurrence = new Date(event.date);
      const isRecurring = event.category === "Birthday" || event.category === "Anniversary";

      if (isRecurring) {
        const currentYear = getYear(today);
        nextOccurrence.setFullYear(currentYear);
        if (nextOccurrence < today) {
            nextOccurrence.setFullYear(currentYear + 1);
        }
        upcoming.push({ ...event, displayDate: nextOccurrence });
      } else {
        // Non-recurring events
        if (nextOccurrence >= today) {
          upcoming.push({ ...event, displayDate: nextOccurrence });
        } else {
          past.push({ ...event, displayDate: nextOccurrence });
        }
      }
    });

    upcoming.sort((a, b) => a.displayDate!.getTime() - b.displayDate!.getTime());
    past.sort((a, b) => b.displayDate!.getTime() - a.displayDate!.getTime());

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);


  const sortedGifts = React.useMemo(() =>
    [...gifts].sort((a,b) => b.purchaseDate.getTime() - a.purchaseDate.getTime()),
  [gifts]);

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "Birthday":
        return "default";
      case "Anniversary":
        return "secondary";
      default:
        return "outline";
    }
  }

  const EventListItem = ({ event }: { event: ShoppingEvent }) => (
     <li className="flex items-center justify-between">
        <button className="flex items-center gap-4 text-left flex-1" onClick={() => setSelectedEvent(event)}>
            <div className="text-2xl w-8 text-center">
              {event.emoji ? (
                  <span>{event.emoji}</span>
              ) : (
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
              )}
          </div>
          <div>
              <p className="font-semibold">{event.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{format(event.displayDate || event.date, "MMMM do, yyyy")}</p>
                <Badge variant={getCategoryBadgeVariant(event.category)}>{event.category}</Badge>
              </div>
          </div>
        </button>
        <div className="flex items-center gap-2 pl-2">
          {event.displayDate && event.displayDate >= new Date() && (
            <p className="font-semibold text-primary hidden sm:block">{formatDistanceToNow(event.displayDate, { addSuffix: true })}</p>
          )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More actions</span>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditEventDialog(event)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <ConfirmDeleteDialog
                      onConfirm={() => handleDeleteEvent(event.id)}
                      title="Delete Event?"
                      description={`Are you sure you want to delete the event "${event.name}"? This action cannot be undone.`}
                  >
                      <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-600 px-2 py-1.5 h-auto text-sm font-normal relative flex cursor-default select-none items-center rounded-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                  </ConfirmDeleteDialog>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
    </li>
  );

  return (
    <div className="theme-gifts">
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
      {selectedEvent && (
        <EventDetailDialog
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(undefined)}
            event={selectedEvent}
            gifts={gifts}
            currency={currency}
        />
      )}
      {selectedDate && (
        <DateDetailDialog
          isOpen={isDateDetailOpen}
          onClose={() => setIsDateDetailOpen(false)}
          date={selectedDate}
          events={events}
          gifts={gifts}
          currency={currency}
        />
      )}
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-20 items-center border-b bg-background">
          <div className="container mx-auto flex h-full items-center gap-4 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/card-logo.png" 
                alt="Don't Forget the Card! Logo" 
                width={32} 
                height={32} 
                className="h-8 w-8"
              />
              <div className="font-headline text-xl hidden sm:block">
                Don't Forget the Card!
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
          <div className="container mx-auto p-4 sm:p-6">
            <Tabs defaultValue="dashboard">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                    <Card className="lg:col-span-4">
                      <CardHeader>
                        <CardTitle>Upcoming Events</CardTitle>
                        <CardDescription>Don't forget these important dates!</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {upcomingEvents.length > 0 ? (
                          <ScrollArea className="h-72">
                            <ul className="space-y-4 pr-4">
                              {upcomingEvents.map(event => (
                                <EventListItem key={event.id} event={event} />
                              ))}
                            </ul>
                          </ScrollArea>
                        ) : (
                          <div className="text-center py-10 text-muted-foreground">
                            <p>No upcoming events.</p>
                            <p className="text-sm">Click "Add Event" to get started.</p>
                          </div>
                        )}
                        {pastEvents.length > 0 && (
                            <Accordion type="single" collapsible className="w-full mt-4">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <Archive className="h-4 w-4" />
                                            Archived Events ({pastEvents.length})
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ScrollArea className="h-60">
                                            <ul className="space-y-4 pr-4">
                                                {pastEvents.map(event => (
                                                    <EventListItem key={event.id} event={event} />
                                                ))}
                                            </ul>
                                        </ScrollArea>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
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
                            {sortedGifts.map(gift => (
                              <li key={gift.id} className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">{gift.name}</p>
                                        <p className="text-sm text-muted-foreground">For {gift.recipient}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <p className="font-semibold">{formatCurrency(gift.price, currency)}</p>
                                      <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                                  <MoreHorizontal className="h-4 w-4" />
                                                  <span className="sr-only">More actions</span>
                                              </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                              <DropdownMenuItem onClick={() => openEditGiftDialog(gift)}>
                                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                              </DropdownMenuItem>
                                              <ConfirmDeleteDialog
                                                  onConfirm={() => handleDeleteGift(gift.id)}
                                                  title="Delete Gift?"
                                                  description={`Are you sure you want to delete the gift "${gift.name}" for ${gift.recipient}? This action cannot be undone.`}
                                              >
                                                  <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-600 px-2 py-1.5 h-auto text-sm font-normal relative flex cursor-default select-none items-center rounded-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                  </Button>
                                              </ConfirmDeleteDialog>
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
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
                </TabsContent>
                <TabsContent value="calendar">
                   <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Calendar View</CardTitle>
                        <CardDescription>
                          Events and gift purchases at a glance.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                          <GiftCalendarView 
                            events={events} 
                            gifts={gifts} 
                            onDateSelect={openDateDetailDialog}
                          />
                      </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
