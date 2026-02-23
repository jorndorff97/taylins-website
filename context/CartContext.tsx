"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface CartItemSize {
  sizeId: number;
  sizeLabel: string;
  quantity: number;
}

export interface CartShippingOption {
  id: number;
  label: string;
  price: number;
}

export interface CartItem {
  listingId: number;
  title: string;
  imageUrl: string | null;
  pricePerPair: number;
  totalPairs: number;
  productTotal: number;
  inventoryMode: "SIZE_RUN" | "MIXED_BATCH";
  items: CartItemSize[];
  shippingOption: CartShippingOption | null;
  addedAt: number;
}

interface CartContextValue {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (listingId: number) => void;
  updateShippingOption: (listingId: number, option: CartShippingOption) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "eforwarder_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // localStorage full or unavailable
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(cart);
  }, [cart, hydrated]);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const filtered = prev.filter((c) => c.listingId !== item.listingId);
      return [...filtered, item];
    });
  }, []);

  const removeFromCart = useCallback((listingId: number) => {
    setCart((prev) => prev.filter((c) => c.listingId !== listingId));
  }, []);

  const updateShippingOption = useCallback((listingId: number, option: CartShippingOption) => {
    setCart((prev) =>
      prev.map((c) => (c.listingId === listingId ? { ...c, shippingOption: option } : c))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, item) => sum + item.totalPairs, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.productTotal + (item.shippingOption?.price ?? 0),
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateShippingOption, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
