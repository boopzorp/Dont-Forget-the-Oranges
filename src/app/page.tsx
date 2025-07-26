import { DUMMY_GROCERIES } from '@/lib/data';
import { GroceryDashboard } from '@/components/grocery-dashboard';

export default function Home() {
  return (
    <main>
      <GroceryDashboard initialItems={DUMMY_GROCERIES} />
    </main>
  );
}
