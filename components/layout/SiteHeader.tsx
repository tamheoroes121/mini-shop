"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Brand } from "./Brand";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";

const SearchIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>;
const UserIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
const HeartIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" /></svg>;
const CartIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 4h2l2 11h11l2-8H6" /><circle cx="9" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></svg>;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { cartCount, wishlistCount } = useStore();
  const { user, logout } = useAuth();

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    router.push(`/products${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  };

  return (
    <header className="site-header">
      <div className="header-inner container">
        <Brand />
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "Đóng menu" : "Mở menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
          <span /><span /><span />
        </button>
        <nav className={`main-nav${menuOpen ? " open" : ""}`} aria-label="Điều hướng chính">
          <Link className={pathname === "/" ? "active" : ""} href="/" onClick={() => setMenuOpen(false)}>Trang chủ</Link>
          <Link className={pathname.startsWith("/products") ? "active" : ""} href="/products" onClick={() => setMenuOpen(false)}>Sản phẩm</Link>
          <Link href="/#story">Về chúng tôi</Link>
          <Link href="/#footer-contact">Liên hệ</Link>
        </nav>
        <div className="header-actions">
          <form className="search-box" onSubmit={submitSearch} role="search">
            <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Tìm sản phẩm..." aria-label="Tìm sản phẩm" />
            <SearchIcon />
          </form>
          {user ? <div className="account-session"><Link className="icon-button account-link account-link--signed-in" href={user.role === "admin" ? "/admin" : "/"} aria-label={user.role === "admin" ? "Mở khu quản trị" : "Tài khoản đang đăng nhập"}><UserIcon /><span className="account-name">{user.name}</span></Link><button className="header-signout" type="button" onClick={async () => { await logout(); router.push("/"); }}>Đăng xuất</button></div> : <Link className="icon-button account-link" href="/login" aria-label="Đăng nhập"><UserIcon /></Link>}
          <Link className="icon-button wishlist-link" href="/wishlist" aria-label="Mở danh sách yêu thích"><HeartIcon /><span className="wishlist-count">{wishlistCount}</span></Link>
          <Link className="icon-button" href="/cart" aria-label="Mở giỏ hàng"><CartIcon /><span className="cart-count">{cartCount}</span></Link>
        </div>
      </div>
    </header>
  );
}
