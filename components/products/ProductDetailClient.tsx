"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/format";
import { useStore } from "@/contexts/StoreContext";

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleWishlist, isFavorite } = useStore();
  const favorite = isFavorite(product.id);
  return (
    <>
      <div className="product-gallery">
        <div className="thumbnail-list" aria-label="Ảnh sản phẩm">
          {product.images.map((image) => <button key={image} className={`thumbnail${selectedImage === image ? " active" : ""}`} type="button" onClick={() => setSelectedImage(image)}><Image src={image} alt="" width={76} height={76} /></button>)}
        </div>
        <div className="main-product-image"><Image src={selectedImage} alt={product.name} fill priority sizes="(max-width:820px) 95vw, 42vw" /></div>
      </div>
      <div className="product-summary">
        <div className="summary-badges"><span className="stock-label">Còn hàng</span><span className="category-label">{product.categoryLabel}</span></div>
        <h1 id="detail-title">{product.name}</h1>
        <div className="rating-row"><span className="rating-stars" aria-hidden="true">★★★★★</span><span>4,8 (36 đánh giá)</span></div>
        <div className="detail-price"><strong>{formatCurrency(product.price)}</strong>{product.compareAtPrice && <del>{formatCurrency(product.compareAtPrice)}</del>}{product.compareAtPrice && <span>-{Math.round((1 - product.price / product.compareAtPrice) * 100)}%</span>}</div>
        <p className="product-intro">{product.description}</p>
        <div className="quantity-row"><span>Số lượng</span><div className="quantity-control"><button type="button" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><output>{quantity}</output><button type="button" onClick={() => setQuantity((value) => Math.min(20, value + 1))}>+</button></div></div>
        <div className="purchase-actions"><button className="add-cart-button" type="button" onClick={() => addToCart(product.id, quantity)}>Thêm vào giỏ</button><button className={`wishlist-button${favorite ? " active" : ""}`} type="button" onClick={() => toggleWishlist(product.id)} aria-pressed={favorite}>{favorite ? "Đã yêu thích" : "Yêu thích"}</button></div>
        <div className="product-assurances"><div><span><strong>Miễn phí giao hàng</strong><small>Đơn từ 500.000đ</small></span></div><div><span><strong>Đổi trả 7 ngày</strong><small>Dễ dàng, nhanh chóng</small></span></div><div><span><strong>Thanh toán an toàn</strong><small>Bảo mật thông tin</small></span></div></div>
      </div>
    </>
  );
}
