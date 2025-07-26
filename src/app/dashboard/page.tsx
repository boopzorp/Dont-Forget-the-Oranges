
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { GroceryDashboard } from '@/components/grocery-dashboard';
import type { GroceryItem } from '@/lib/types';
import { getItems } from '@/lib/firebase/firestore';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = React.useState<GroceryItem[]>([]);
  const [initialLoad, setInitialLoad] = React.useState(true);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    if (user) {
      const unsubscribe = getItems(user.uid, (newItems) => {
        setItems(newItems);
        setInitialLoad(false);
      });
      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, [user]);

  if (loading || initialLoad) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <GroceryDashboard initialItems={items} />;
}
