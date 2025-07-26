export type Category = 'Pantry' | 'Produce' | 'Dairy' | 'Meat' | 'Bakery' | 'Frozen' | 'Other';

export type StockStatus = 'In Stock' | 'Need to Order';

export type Order = {
  date: Date;
  price: number;
};

export type GroceryItem = {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  orderHistory: Order[];
  status: StockStatus;
  price: number;
};

    