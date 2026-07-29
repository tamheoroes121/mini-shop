"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/format";
import { useStore } from "@/contexts/StoreContext";

const HeartIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" /></svg>;

export function ProductCard({ product, variant = "home" }: { product: Product; variant?: "home" | "listing" }) {
  const { addToCart, toggleWishlist, isFavorite } = useStore();
  const favorite = isFavorite(product.id);
  if (variant === "listing") {
    return (
      <article className="listing-card" data-product-id={product.id}>
        <Link className="listing-card__image" href={`/products/${product.slug}`}>
          <Image src={product.image} alt={product.name} fill sizes="(max-width:540px) 45vw, (max-width:1050px) 30vw, 20vw" />
          {product.isNew && <span className="status-badge">Mới</span>}
        </Link>
        <button className={`favorite-button${favorite ? " active" : ""}`} type="button" onClick={() => toggleWishlist(product.id)} aria-pressed={favorite} aria-label={`${favorite ? "Bỏ" : "Thêm"} ${product.name} ${favorite ? "khỏi" : "vào"} yêu thích`}><HeartIcon /></button>
        <div className="listing-card__body">
          <h2>{product.name}</h2>
          <p className="listing-price">{formatCurrency(product.price)} {product.compareAtPrice && <del>{formatCurrency(product.compareAtPrice)}</del>}</p>
          <span className={`stock-label${product.stock === 0 ? " stock-label--out" : ""}`}>{product.stock > 0 ? "Còn hàng" : "Tạm hết hàng"}</span>
          <Link className="detail-button" href={`/products/${product.slug}`}>Chi tiết <span>→</span></Link>
          {product.stock > 0 && <button className="quick-add-button" type="button" onClick={() => addToCart(product.id)}>Thêm vào giỏ</button>}
        </div>
      </article>
    );
  }

  return (
    <article className="product-card" data-product-id={product.id}>
      <Link className="product-card__image" href={`/products/${product.slug}`}>
        <Image src={product.image} alt={product.name} fill sizes="(max-width:540px) 45vw, (max-width:900px) 45vw, 31vw" />
        {product.isNew && <span className="product-card__badge">Thủ công</span>}
      </Link>
      <button className={`favorite-button product-favorite-button${favorite ? " active" : ""}`} type="button" onClick={() => toggleWishlist(product.id)} aria-pressed={favorite} aria-label={`${favorite ? "Bỏ" : "Thêm"} ${product.name} ${favorite ? "khỏi" : "vào"} yêu thích`}><HeartIcon /></button>
      <div className="product-card__body">
        <p className="product-card__type">{product.categoryLabel}</p><h3>{product.name}</h3><p className="product-card__price">{formatCurrency(product.price)}</p>
        <Link className="product-card__link" href={`/products/${product.slug}`}>Xem chi tiết <span>→</span></Link>
        {product.stock > 0 && <button className="quick-add-button" type="button" onClick={() => addToCart(product.id)}>Thêm vào giỏ</button>}
      </div>
    </article>
  );
}
