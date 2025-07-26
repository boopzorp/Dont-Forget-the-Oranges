
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { GroceryDashboard } from '@/components/grocery-dashboard';
import { CardTrackerDashboard } from '@/components/card-tracker-dashboard';
import type { GroceryItem, ShoppingEvent, GiftItem } from '@/lib/types';
import { getItems, getShoppingEvents, getGiftItems } from '@/lib/firebase/firestore';

export type AppName = 'groceries' | 'gifts';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [currentApp, setCurrentApp] = React.useState<AppName>('groceries');
  
  const [groceryItems, setGroceryItems] = React.useState<GroceryItem[]>([]);
  const [shoppingEvents, setShoppingEvents] = React.useState<ShoppingEvent[]>([]);
  const [giftItems, setGiftItems] = React.useState<GiftItem[]>([]);

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    if (user) {
      setIsLoading(true);
      
      const subscriptions: (() => void)[] = [];

      if (currentApp === 'groceries') {
        const unsubscribeGroceries = getItems(user.uid, (newItems) => {
          setGroceryItems(newItems);
          setIsLoading(false);
        });
        subscriptions.push(unsubscribeGroceries);
      } else if (currentApp === 'gifts') {
        // We need to wait for both subscriptions to report back before setting loading to false
        let eventsLoaded = false;
        let giftsLoaded = false;

        const checkBothLoaded = () => {
          if (eventsLoaded && giftsLoaded) {
            setIsLoading(false);
          }
        }
        
        const unsubscribeEvents = getShoppingEvents(user.uid, (newEvents) => {
          setShoppingEvents(newEvents);
          eventsLoaded = true;
          checkBothLoaded();
        });
        subscriptions.push(unsubscribeEvents);

        const unsubscribeGifts = getGiftItems(user.uid, (newGifts) => {
          setGiftItems(newGifts);
          giftsLoaded = true;
          checkBothLoaded();
        });
        subscriptions.push(unsubscribeGifts);
      }

      // Cleanup function
      return () => {
        subscriptions.forEach(unsub => unsub());
      };
    }
  }, [user, currentApp]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (currentApp === 'groceries') {
    return <GroceryDashboard initialItems={groceryItems} onAppChange={setCurrentApp} />;
  }
  
  if (currentApp === 'gifts') {
    return <CardTrackerDashboard events={shoppingEvents} gifts={giftItems} onAppChange={setCurrentApp} />;
  }

  return null;
}
