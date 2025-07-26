export type Category = 'Pantry' | 'Produce' | 'Dairy' | 'Meat' | 'Bakery' | 'Frozen' | 'Other';

export type StockStatus = 'In Stock' | 'Need to Order';

export type GroceryItem = {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  lastOrdered?: Date;
  status: StockStatus;
  price: number;
};
