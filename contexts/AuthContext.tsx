"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { User } from "@/types";

type AuthResult = {
  ok: boolean;
  user?: User;
  message?: string;
  needsEmailConfirmation?: boolean;
};

type AuthValue = {
  user: User | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

function toAppUser(authUser: SupabaseUser): User {
  const metadataName = authUser.user_metadata?.full_name;
  const email = authUser.email ?? "";

  return {
    id: authUser.id,
    name: typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : email.split("@")[0] || "Khách hàng",
    email,
    role: authUser.app_metadata?.role === "admin" ? "admin" : "customer",
  };
}

function authErrorMessage(code?: string) {
  switch (code) {
    case "invalid_credentials": return "Email hoặc mật khẩu chưa đúng.";
    case "email_not_confirmed": return "Bạn cần xác nhận email trước khi đăng nhập.";
    case "user_already_exists": return "Email này đã được đăng ký.";
    case "weak_password": return "Mật khẩu chưa đủ mạnh.";
    case "over_request_rate_limit": return "Bạn thao tác quá nhanh. Vui lòng thử lại sau.";
    default: return "Không thể xác thực tài khoản. Vui lòng thử lại.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Xóa dữ liệu đăng nhập giả cũ, trong đó có mật khẩu từng lưu ở localStorage.
    window.localStorage.removeItem("moc-nhien-users-v1");
    window.localStorage.removeItem("moc-nhien-session-v1");

    let active = true;
    void supabaseBrowser.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ? toAppUser(data.user) : null);
      setHydrated(true);
    });

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ? toAppUser(session.user) : null);
      setHydrated(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      return { ok: false, message: authErrorMessage(error?.code) };
    }

    const signedInUser = toAppUser(data.user);
    setUser(signedInUser);
    return { ok: true, user: signedInUser };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabaseBrowser.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: name.trim() } },
    });

    if (error || !data.user) {
      return { ok: false, message: authErrorMessage(error?.code) };
    }

    if (!data.session) {
      return {
        ok: true,
        needsEmailConfirmation: true,
        message: "Đăng ký thành công. Hãy kiểm tra email để xác nhận tài khoản.",
      };
    }

    const registeredUser = toAppUser(data.user);
    setUser(registeredUser);
    return { ok: true, user: registeredUser };
  }, []);

  const logout = useCallback(async () => {
    await supabaseBrowser.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(() => ({ user, hydrated, login, register, logout }), [user, hydrated, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
