export const storageKeys = {
  cart: "moc-nhien-cart-v1",
  wishlist: "moc-nhien-wishlist-v1",
  orders: "moc-nhien-orders-v1",
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage can be disabled. */ }
}
