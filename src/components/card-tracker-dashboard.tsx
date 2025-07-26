
"use client";

import * as React from "react";
import Link from "next/link";
import { Gift, LogOut, Menu, PlusCircle, ShoppingCart } from "lucide-react";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { ShoppingEvent, GiftItem } from "@/lib/types";
import { ThemeToggleButton } from "./theme-toggle-button";
import { Logo } from "./logo";
import { useAuth } from "@/hooks/use-auth";
import type { AppName } from "@/app/dashboard/page";

interface CardTrackerDashboardProps {
  events: ShoppingEvent[];
  gifts: GiftItem[];
  onAppChange: (appName: AppName) => void;
}

export function CardTrackerDashboard({ events, gifts, onAppChange }: CardTrackerDashboardProps) {
  const { signOut } = useAuth();
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-30 flex h-20 items-center border-b bg-background">
        <div className="container mx-auto flex h-full items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
              <Logo />
              <div className="font-headline text-xl hidden sm:block">
                Don't Forget the Card!
              </div>
          </Link>
          <div className="ml-auto flex items-center gap-2 md:gap-4">
            <Button size="sm">
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
                    <nav className="grid gap-4 text-lg font-medium mt-8">
                        <Button variant="ghost" className="justify-start gap-2 text-muted-foreground" onClick={() => onAppChange('groceries')}>
                            <ShoppingCart className="h-5 w-5" />
                            GrocerEase
                        </Button>
                        <Button variant="ghost" className="justify-start gap-2 text-muted-foreground" onClick={() => onAppChange('gifts')}>
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
        <div className="container mx-auto space-y-4 p-4 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to "Don't Forget the Card!"</CardTitle>
              <CardDescription>This is a placeholder for the new gift tracking application.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Upcoming features will be implemented here!</p>
               <div className="mt-4">
                    <h3 className="font-semibold">Events ({events.length})</h3>
                    <p className="text-sm text-muted-foreground">This will show your saved events.</p>
                </div>
                <div className="mt-4">
                    <h3 className="font-semibold">Gifts ({gifts.length})</h3>
                    <p className="text-sm text-muted-foreground">This will show your purchased gifts.</p>
                </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
