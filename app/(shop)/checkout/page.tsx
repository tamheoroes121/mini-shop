"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { getProductById } from "@/data/products";
import { formatCurrency, shippingFor } from "@/lib/format";
import { readStorage, storageKeys, writeStorage } from "@/lib/storage";
import type { CustomerInfo, Order } from "@/types";

export default function CheckoutPage() {
  const { cart, hydrated, clearCart } = useStore();
  const [successCode, setSuccessCode] = useState("");
  const lines = useMemo(() => cart.flatMap((line) => { const product = getProductById(line.productId); return product ? [{ ...line, product }] : []; }), [cart]);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shipping = shippingFor(subtotal);

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lines.length) return;
    const form = new FormData(event.currentTarget);
    const customer = Object.fromEntries(form.entries()) as unknown as CustomerInfo;
    const code = `MN${Date.now().toString().slice(-8)}`;
    const order: Order = { code, createdAt: new Date().toISOString(), customer, items: lines.map(({ product, quantity }) => ({ productId: product.id, quantity, name: product.name, price: product.price, image: product.image })), subtotal, shipping, total: subtotal + shipping, status: "Đã ghi nhận" };
    writeStorage(storageKeys.orders, [...readStorage<Order[]>(storageKeys.orders, []), order]);
    clearCart();
    setSuccessCode(code);
  };

  if (!hydrated) return <main className="container checkout-main"><p className="empty-results">Đang tải đơn hàng...</p></main>;
  return <><main className="container checkout-main"><nav className="breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><Link href="/cart">Giỏ hàng</Link><span>/</span><span>Thanh toán</span></nav><div className="checkout-title"><p className="eyebrow">Hoàn tất đơn hàng</p><h1>Thông tin giao hàng</h1></div>{lines.length ? <div className="checkout-layout"><form className="checkout-form" id="checkout-form" onSubmit={placeOrder}><section className="checkout-section"><div className="checkout-section__heading"><span>01</span><div><h2>Thông tin người nhận</h2><p>Vui lòng nhập thông tin giao hàng chính xác.</p></div></div><div className="form-grid"><label className="form-field form-field--full"><span>Họ và tên *</span><input name="fullName" autoComplete="name" minLength={2} required /></label><label className="form-field"><span>Số điện thoại *</span><input name="phone" type="tel" pattern="[0-9 +()-]{9,15}" required /></label><label className="form-field"><span>Email</span><input name="email" type="email" /></label><label className="form-field form-field--full"><span>Địa chỉ giao hàng *</span><input name="address" minLength={8} required /></label><label className="form-field form-field--full"><span>Ghi chú</span><textarea name="note" rows={3} /></label></div></section><section className="checkout-section"><div className="checkout-section__heading"><span>02</span><div><h2>Phương thức thanh toán</h2><p>Chưa phát sinh thanh toán trực tuyến.</p></div></div><label className="payment-option"><input type="radio" name="payment" value="cod" defaultChecked /><span className="payment-option__mark" /><span><strong>Thanh toán khi nhận hàng</strong><small>Thanh toán khi nhận được sản phẩm.</small></span></label></section></form><aside className="checkout-summary"><div className="checkout-summary__heading"><h2>Đơn hàng của bạn</h2><Link href="/cart">Chỉnh sửa</Link></div><div className="checkout-products">{lines.map(({ product, quantity }) => <div className="checkout-product" key={product.id}><div className="checkout-product__image"><Image src={product.image} alt={product.name} width={54} height={50} /><span>{quantity}</span></div><div><strong>{product.name}</strong><small>{formatCurrency(product.price)} × {quantity}</small></div><b>{formatCurrency(product.price * quantity)}</b></div>)}</div><dl><div><dt>Tạm tính</dt><dd>{formatCurrency(subtotal)}</dd></div><div><dt>Phí giao hàng</dt><dd>{shipping ? formatCurrency(shipping) : "Miễn phí"}</dd></div><div className="checkout-total"><dt>Tổng cộng</dt><dd>{formatCurrency(subtotal + shipping)}</dd></div></dl><button className="place-order-button" type="submit" form="checkout-form">Đặt hàng</button><p className="order-disclaimer">Đây là đơn hàng giả lập, không phát sinh thanh toán thật.</p></aside></div> : <div className="checkout-empty"><h2>Chưa có sản phẩm để thanh toán</h2><p>Giỏ hàng của bạn đang trống.</p><Link className="button button--primary" href="/products">Xem sản phẩm</Link></div>}</main>{successCode && <div className="order-success"><div className="order-success__card" role="dialog" aria-modal="true"><div className="success-mark">✓</div><p className="eyebrow">Đặt hàng thành công</p><h2>Cảm ơn bạn đã mua hàng</h2><p>Đơn hàng <strong>#{successCode}</strong> đã được ghi nhận. Mộc Nhiên sẽ sớm liên hệ xác nhận.</p><Link className="button button--primary" href="/">Về trang chủ</Link></div></div>}</>;
}
