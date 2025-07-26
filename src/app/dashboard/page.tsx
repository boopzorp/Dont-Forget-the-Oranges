
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
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [currentApp, setCurrentApp] = React.useState<AppName>('groceries');
  
  const [groceryItems, setGroceryItems] = React.useState<GroceryItem[]>([]);
  const [shoppingEvents, setShoppingEvents] = React.useState<ShoppingEvent[]>([]);
  const [giftItems, setGiftItems] = React.useState<GiftItem[]>([]);

  const [initialLoad, setInitialLoad] = React.useState(true);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    if (user) {
      setInitialLoad(true);
      let unsubscribe: () => void = () => {};
      let unsubscribe2: () => void = () => {};
      let unsubscribe3: () => void = () => {};

      if (currentApp === 'groceries') {
        unsubscribe = getItems(user.uid, (newItems) => {
          setGroceryItems(newItems);
          setInitialLoad(false);
        });
      } else if (currentApp === 'gifts') {
         unsubscribe2 = getShoppingEvents(user.uid, (newEvents) => {
          setShoppingEvents(newEvents);
        });
         unsubscribe3 = getGiftItems(user.uid, (newGifts) => {
          setGiftItems(newGifts);
          setInitialLoad(false);
        });
      }

      // Cleanup subscription on unmount or when app changes
      return () => {
        unsubscribe();
        unsubscribe2();
        unsubscribe3();
      };
    }
  }, [user, currentApp]);

  if (loading || initialLoad) {
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
