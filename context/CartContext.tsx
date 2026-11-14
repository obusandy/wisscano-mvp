"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  brand?: string;
  note?: string;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  total: number;
  addItem: (item: CartItem) => void;
  setQuantity: (id: string, quantity: number) => void;
  setNote: (id: string, note: string) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const KEY = "wisscano_quote_cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore a broken saved cart
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // storage can be blocked; the cart still works for this visit
    }
  }, [items, ready]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, Math.min(999, quantity)) } : i
      )
    );
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, note: note.slice(0, 500) } : i))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.quantity, 0),
      total: items.reduce((n, i) => n + i.price * i.quantity, 0),
      addItem,
      setQuantity,
      setNote,
      removeItem,
      clear,
    }),
    [items, ready, addItem, setQuantity, setNote, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}