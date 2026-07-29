"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { StoredUser, User } from "@/types";
import { readStorage, storageKeys, writeStorage } from "@/lib/storage";

const demos: StoredUser[] = [
  { id: "admin-demo", name: "Quản trị viên", email: "admin@mocnhien.vn", password: "admin123", role: "admin" },
  { id: "customer-demo", name: "Khách Mộc Nhiên", email: "khach@mocnhien.vn", password: "123456", role: "customer" },
];

type AuthValue = {
  user: User | null;
  hydrated: boolean;
  login: (email: string, password: string) => { ok: boolean; user?: User; message?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; user?: User; message?: string };
  logout: () => void;
};
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setUser(readStorage<User | null>(storageKeys.session, null)); setHydrated(true); }, []);

  const value = useMemo<AuthValue>(() => ({
    user, hydrated,
    login(email, password) {
      const allUsers = [...demos, ...readStorage<StoredUser[]>(storageKeys.users, [])];
      const found = allUsers.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
      if (!found) return { ok: false, message: "Email hoặc mật khẩu chưa đúng." };
      const session: User = { id: found.id, name: found.name, email: found.email, role: found.role };
      writeStorage(storageKeys.session, session); setUser(session); return { ok: true, user: session };
    },
    register(name, email, password) {
      const stored = readStorage<StoredUser[]>(storageKeys.users, []);
      if ([...demos, ...stored].some((item) => item.email.toLowerCase() === email.trim().toLowerCase())) return { ok: false, message: "Email này đã được sử dụng." };
      const created: StoredUser = { id: `user-${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), password, role: "customer" };
      writeStorage(storageKeys.users, [...stored, created]);
      const session: User = { id: created.id, name: created.name, email: created.email, role: created.role };
      writeStorage(storageKeys.session, session); setUser(session); return { ok: true, user: session };
    },
    logout() { try { window.localStorage.removeItem(storageKeys.session); } catch {} setUser(null); },
  }), [hydrated, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
