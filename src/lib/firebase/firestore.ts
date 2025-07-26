
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { GroceryItem, Order } from '../types';

const GROCERY_COLLECTION = 'groceries';

// Firestore data converters
const toFirestore = (item: Omit<GroceryItem, 'id'> | GroceryItem) => {
  return {
    ...item,
    orderHistory: item.orderHistory.map(h => ({
      ...h,
      date: Timestamp.fromDate(h.date),
    })),
  };
};

const fromFirestore = (snapshot: any, options: any): GroceryItem => {
  const data = snapshot.data(options);
  return {
    id: snapshot.id,
    ...data,
    orderHistory: data.orderHistory.map((h: any) => ({
      ...h,
      date: h.date.toDate(),
    })),
  } as GroceryItem;
};

// Add a new item
export const addItem = async (userId: string, item: Omit<GroceryItem, 'id'>) => {
  const userGroceryCollection = collection(db, 'users', userId, GROCERY_COLLECTION);
  return await addDoc(userGroceryCollection, toFirestore(item));
};

// Update an item
export const updateItem = async (userId: string, item: GroceryItem) => {
  const itemDoc = doc(db, 'users', userId, GROCERY_COLLECTION, item.id);
  return await updateDoc(itemDoc, toFirestore(item));
};

// Delete an item
export const deleteItem = async (userId: string, itemId: string) => {
  const itemDoc = doc(db, 'users', userId, GROCERY_COLLECTION, itemId);
  return await deleteDoc(itemDoc);
};

// Get all items with real-time updates
export const getItems = (userId: string, callback: (items: GroceryItem[]) => void) => {
  const userGroceryCollection = collection(db, 'users', userId, GROCERY_COLLECTION);
  const q = query(userGroceryCollection);

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const items: GroceryItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push(fromFirestore(doc, {}));
    });
    callback(items);
  });

  return unsubscribe;
};
