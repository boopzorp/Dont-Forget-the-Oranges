
import type { GroceryItem, Category, Currency } from './types';

export const CATEGORIES: { name: Category; emoji: string }[] = [
  { name: 'Pantry', emoji: '🥫' },
  { name: 'Produce', emoji: '🍎' },
  { name: 'Dairy', emoji: '🥛' },
  { name: 'Meat', emoji: '🥩' },
  { name: 'Bakery', emoji: '🍞' },
  { name: 'Frozen', emoji: '🧊' },
  { name: 'Cleaning', emoji: '🧼' },
  { name: 'Snacks', emoji: '🍿' },
  { name: 'Other', emoji: '🛒' },
];

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$' },
  { code: 'INR', symbol: '₹' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
]

export const DUMMY_GROCERIES: GroceryItem[] = [
  {
    id: '1',
    name: 'Organic Milk',
    category: 'Dairy',
    quantity: 1,
    orderHistory: [
      { date: new Date('2023-08-20'), price: 3.4 },
      { date: new Date('2023-09-20'), price: 3.45 },
      { date: new Date('2023-10-20'), price: 3.5 },
    ],
    status: 'In Stock',
    price: 3.5,
  },
  {
    id: '2',
    name: 'Sourdough Bread',
    category: 'Bakery',
    quantity: 1,
    orderHistory: [
        { date: new Date('2023-10-01'), price: 4.15 },
        { date: new Date('2023-10-15'), price: 4.20 },
        { date: new Date('2023-10-22'), price: 4.25 },
    ],
    status: 'Out of Stock',
    price: 4.25,
  },
  {
    id: '3',
    name: 'Avocados',
    category: 'Produce',
    quantity: 4,
    orderHistory: [],
    status: 'Need to Order',
    price: 1.5,
  },
  {
    id: '4',
    name: 'Free-range Eggs',
    category: 'Dairy',
    quantity: 12,
    orderHistory: [
      { date: new Date('2023-09-20'), price: 4.8 },
      { date: new Date('2023-10-20'), price: 5.0 },
    ],
    status: 'In Stock',
    price: 5.0,
  },
  {
    id: '5',
    name: 'Chicken Breast',
    category: 'Meat',
    quantity: 2,
    orderHistory: [],
    status: 'Need to Order',
    price: 9.99,
  },
  {
    id: '6',
    name: 'Pasta',
    category: 'Pantry',
    quantity: 2,
    orderHistory: [
        { date: new Date('2023-07-15'), price: 1.29 },
        { date: new Date('2023-09-15'), price: 1.29 },
    ],
    status: "Don't Need",
    price: 1.29,
  },
    {
    id: '7',
    name: 'Frozen Peas',
    category: 'Frozen',
    quantity: 1,
    orderHistory: [],
    status: 'Need to Order',
    price: 2.19,
  },
    {
    id: '8',
    name: 'Tomato Sauce',
    category: 'Pantry',
    quantity: 3,
    orderHistory: [],
    status: 'Need to Order',
    price: 2.5,
  },
];
