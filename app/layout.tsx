import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { StoreProvider } from "@/contexts/StoreContext";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: { default: "Mộc Nhiên", template: "%s | Mộc Nhiên" },
  description: "Đồ thủ công và trang trí cho không gian sống.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body><AuthProvider><StoreProvider>{children}</StoreProvider></AuthProvider></body>
    </html>
  );
}
