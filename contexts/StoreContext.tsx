"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine } from "@/types";
import { storageKeys, readStorage, writeStorage } from "@/lib/storage";

type StoreContextValue = {
  hydrated: boolean;
  cart: CartLine[];
  wishlist: string[];
  cartCount: number;
  wishlistCount: number;
  addToCart: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const rawCart = readStorage<Array<CartLine | { id: string; quantity: number }>>(storageKeys.cart, []);
    setCart(rawCart.map((item) => ({ productId: "productId" in item ? item.productId : item.id, quantity: Math.max(1, Number(item.quantity) || 1) })));
    setWishlist(readStorage<string[]>(storageKeys.wishlist, []));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) writeStorage(storageKeys.cart, cart.map((item) => ({ id: item.productId, quantity: item.quantity }))); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) writeStorage(storageKeys.wishlist, wishlist); }, [wishlist, hydrated]);

  const value = useMemo<StoreContextValue>(() => ({
    hydrated,
    cart,
    wishlist,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    wishlistCount: wishlist.length,
    addToCart(productId, quantity = 1) { setCart((current) => current.some((item) => item.productId === productId) ? current.map((item) => item.productId === productId ? { ...item, quantity: Math.min(99, item.quantity + quantity) } : item) : [...current, { productId, quantity }]); },
    updateQuantity(productId, quantity) { setCart((current) => quantity <= 0 ? current.filter((item) => item.productId !== productId) : current.map((item) => item.productId === productId ? { ...item, quantity: Math.min(99, quantity) } : item)); },
    removeFromCart(productId) { setCart((current) => current.filter((item) => item.productId !== productId)); },
    clearCart() { setCart([]); },
    toggleWishlist(productId) { setWishlist((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]); },
    isFavorite(productId) { return wishlist.includes(productId); },
  }), [cart, hydrated, wishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
