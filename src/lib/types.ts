
export type Category = 'Pantry' | 'Produce' | 'Dairy' | 'Meat' | 'Bakery' | 'Frozen' | 'Cleaning' | 'Snacks' | 'Other';

export type StockStatus = 'In Stock' | 'Need to Order' | "Don't Need" | "Out of Stock";

export type Order = {
  date: Date;
  price: number;
  group?: string;
  quantity: number;
  name?: string; // Optional: Used for displaying in purchase detail dialog
};

export type GroceryItem = {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  orderHistory: Order[];
  status: StockStatus;
  price: number; // Represents the latest price per unit
  defaultGroup?: string;
};

export type Currency = {
    code: string;
    symbol: string;
}
