"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Brand } from "@/components/layout/Brand";

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, hydrated, logout } = useAuth(); const pathname = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false);
  useEffect(() => { if (hydrated && user?.role !== "admin") router.replace("/login"); }, [hydrated, router, user]);
  if (!hydrated || user?.role !== "admin") return <main className="empty-results">Đang kiểm tra quyền quản trị...</main>;
  const links = [["/admin","Tổng quan"],["/admin/products","Sản phẩm"],["/admin/orders","Đơn hàng"]];
  return <div className="admin-page"><aside className={`admin-sidebar${open ? " open" : ""}`}><div className="admin-brand"><Brand /></div><p className="admin-sidebar__label">Khu quản trị</p><nav className="admin-nav">{links.map(([href,label]) => <Link key={href} className={pathname === href ? "active" : ""} href={href} onClick={() => setOpen(false)}>{label}</Link>)}<Link href="/">Xem cửa hàng</Link></nav><button className="admin-logout" type="button" onClick={() => { logout(); router.push("/login"); }}>Đăng xuất</button></aside><main className="admin-main"><header className="admin-topbar"><button className="admin-menu-toggle" type="button" aria-label="Mở menu" onClick={() => setOpen((value) => !value)}><span /><span /><span /></button><div><p>Xin chào,</p><strong>{user.name}</strong></div><span className="admin-avatar">QT</span></header>{children}</main></div>;
}
