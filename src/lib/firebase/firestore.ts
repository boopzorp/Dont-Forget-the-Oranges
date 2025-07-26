

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
import type { GroceryItem, ShoppingEvent, GiftItem } from '../types';

const GROCERY_COLLECTION = 'groceries';
const EVENTS_COLLECTION = 'events';
const GIFTS_COLLECTION = 'gifts';

// Firestore data converters
const groceryToFirestore = (item: Omit<GroceryItem, 'id'> | GroceryItem) => {
  return {
    ...item,
    orderHistory: item.orderHistory.map(h => ({
      ...h,
      date: Timestamp.fromDate(h.date),
    })),
  };
};

const groceryFromFirestore = (snapshot: any): GroceryItem => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    orderHistory: data.orderHistory.map((h: any) => ({
      ...h,
      date: h.date.toDate(),
    })),
  } as GroceryItem;
};

const eventToFirestore = (event: Omit<ShoppingEvent, 'id'> | ShoppingEvent) => ({
  ...event,
  date: Timestamp.fromDate(event.date),
});

const eventFromFirestore = (snapshot: any): ShoppingEvent => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    date: data.date.toDate(),
  } as ShoppingEvent;
};

const giftToFirestore = (gift: Omit<GiftItem, 'id'> | GiftItem) => ({
    ...gift,
    purchaseDate: Timestamp.fromDate(gift.purchaseDate),
});

const giftFromFirestore = (snapshot: any): GiftItem => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    purchaseDate: data.purchaseDate.toDate(),
  } as GiftItem;
};


// === Grocery Functions ===
export const addItem = async (userId: string, item: Omit<GroceryItem, 'id'>) => {
  const userGroceryCollection = collection(db, 'users', userId, GROCERY_COLLECTION);
  return await addDoc(userGroceryCollection, groceryToFirestore(item));
};

export const updateItem = async (userId: string, item: GroceryItem) => {
  const itemDoc = doc(db, 'users', userId, GROCERY_COLLECTION, item.id);
  return await updateDoc(itemDoc, groceryToFirestore(item));
};

export const deleteItem = async (userId: string, itemId: string) => {
  const itemDoc = doc(db, 'users', userId, GROCERY_COLLECTION, itemId);
  return await deleteDoc(itemDoc);
};

export const getItems = (userId: string, callback: (items: GroceryItem[]) => void) => {
  const userGroceryCollection = collection(db, 'users', userId, GROCERY_COLLECTION);
  const q = query(userGroceryCollection);

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const items: GroceryItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push(groceryFromFirestore(doc));
    });
    callback(items);
  });

  return unsubscribe;
};

// === Gift & Event Functions ===

// Shopping Events
export const addShoppingEvent = async (userId: string, event: Omit<ShoppingEvent, 'id'>) => {
  const userEventCollection = collection(db, 'users', userId, EVENTS_COLLECTION);
  return await addDoc(userEventCollection, eventToFirestore(event));
};

export const updateShoppingEvent = async (userId: string, event: ShoppingEvent) => {
  const eventDoc = doc(db, 'users', userId, EVENTS_COLLECTION, event.id);
  return await updateDoc(eventDoc, eventToFirestore(event));
};

export const deleteShoppingEvent = async (userId: string, eventId: string) => {
  const eventDoc = doc(db, 'users', userId, EVENTS_COLLECTION, eventId);
  return await deleteDoc(eventDoc);
};

export const getShoppingEvents = (userId: string, callback: (events: ShoppingEvent[]) => void) => {
  const userEventCollection = collection(db, 'users', userId, EVENTS_COLLECTION);
  const q = query(userEventCollection);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const events: ShoppingEvent[] = [];
    querySnapshot.forEach((doc) => {
      events.push(eventFromFirestore(doc));
    });
    callback(events);
  });
  return unsubscribe;
};

// Gift Items
export const addGiftItem = async (userId: string, gift: Omit<GiftItem, 'id'>) => {
  const userGiftCollection = collection(db, 'users', userId, GIFTS_COLLECTION);
  return await addDoc(userGiftCollection, giftToFirestore(gift));
};

export const updateGiftItem = async (userId: string, gift: GiftItem) => {
  const giftDoc = doc(db, 'users', userId, GIFTS_COLLECTION, gift.id);
  return await updateDoc(giftDoc, giftToFirestore(gift));
};

export const deleteGiftItem = async (userId: string, giftId: string) => {
  const giftDoc = doc(db, 'users', userId, GIFTS_COLLECTION, giftId);
  return await deleteDoc(giftDoc);
};

export const getGiftItems = (userId: string, callback: (gifts: GiftItem[]) => void) => {
  const userGiftCollection = collection(db, 'users', userId, GIFTS_COLLECTION);
  const q = query(userGiftCollection);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const gifts: GiftItem[] = [];
    querySnapshot.forEach((doc) => {
      gifts.push(giftFromFirestore(doc));
    });
    callback(gifts);
  });
  return unsubscribe;
};
