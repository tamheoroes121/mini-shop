"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/contexts/StoreContext";
import { formatCurrency } from "@/lib/format";

export default function WishlistPage() {
  const { wishlist, hydrated, products, toggleWishlist, addToCart } = useStore();
  const saved = products.filter((product) => wishlist.includes(product.id));
  if (!hydrated) return <main className="container wishlist-main"><p className="empty-results">Đang tải danh sách yêu thích...</p></main>;
  return <main className="container wishlist-main"><nav className="breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><span>Yêu thích</span></nav><div className="wishlist-title-row"><div><p className="eyebrow">Bộ sưu tập của bạn</p><h1>Sản phẩm yêu thích</h1><p><strong>{saved.length}</strong> sản phẩm đã lưu</p></div><Link className="text-link" href="/products">Khám phá thêm <span>→</span></Link></div>{saved.length ? <div className="wishlist-grid">{saved.map((product) => <article className="wishlist-card" key={product.id}><Link className="wishlist-card__image" href={`/products/${product.slug}`}><Image src={product.image} alt={product.name} fill sizes="(max-width:540px) 45vw, 24vw" /></Link><div className="wishlist-card__body"><Link href={`/products/${product.slug}`}><h2>{product.name}</h2></Link><p>{formatCurrency(product.price)}</p><div className="wishlist-card__actions"><button className="wishlist-add-cart" type="button" disabled={product.stock === 0} onClick={() => addToCart(product.id)}>Thêm vào giỏ</button><button className="wishlist-remove" type="button" onClick={() => toggleWishlist(product.id)} aria-label={`Bỏ ${product.name} khỏi yêu thích`}>Xóa</button></div></div></article>)}</div> : <div className="empty-wishlist"><h2>Chưa có sản phẩm yêu thích</h2><p>Bấm vào biểu tượng trái tim để lưu lại những món đồ bạn quan tâm.</p><Link className="button button--primary" href="/products">Xem sản phẩm</Link></div>}</main>;
}
