"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { formatCurrency, shippingFor } from "@/lib/format";
import type { CustomerInfo } from "@/types";

export default function CheckoutPage() {
  const { cart, hydrated, products, clearCart } = useStore();
  const [successCode, setSuccessCode] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const lines = useMemo(
    () => cart.flatMap((line) => {
      const product = products.find((item) => item.id === line.productId);
      return product ? [{ ...line, product }] : [];
    }),
    [cart, products],
  );
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shipping = shippingFor(subtotal);

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lines.length || placingOrder) return;

    setOrderError("");
    setPlacingOrder(true);
    const form = new FormData(event.currentTarget);
    const customer = Object.fromEntries(form.entries()) as unknown as CustomerInfo;

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items: lines.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        }),
      });
      const result = (await response.json()) as { code?: string; error?: string };

      if (!response.ok || !result.code) {
        throw new Error(result.error || "Không thể đặt hàng.");
      }

      clearCart();
      setSuccessCode(result.code);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Không thể đặt hàng. Vui lòng thử lại.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!hydrated) {
    return <main className="container checkout-main"><p className="empty-results">Đang tải đơn hàng...</p></main>;
  }

  return (
    <>
      <main className="container checkout-main">
        <nav className="breadcrumb">
          <Link href="/">Trang chủ</Link><span>/</span>
          <Link href="/cart">Giỏ hàng</Link><span>/</span><span>Thanh toán</span>
        </nav>
        <div className="checkout-title">
          <p className="eyebrow">Hoàn tất đơn hàng</p>
          <h1>Thông tin giao hàng</h1>
        </div>

        {lines.length ? (
          <div className="checkout-layout">
            <form className="checkout-form" id="checkout-form" onSubmit={placeOrder}>
              <section className="checkout-section">
                <div className="checkout-section__heading">
                  <span>01</span>
                  <div><h2>Thông tin người nhận</h2><p>Vui lòng nhập thông tin giao hàng chính xác.</p></div>
                </div>
                <div className="form-grid">
                  <label className="form-field form-field--full">
                    <span>Họ và tên *</span>
                    <input name="fullName" autoComplete="name" minLength={2} maxLength={100} required />
                  </label>
                  <label className="form-field">
                    <span>Số điện thoại *</span>
                    <input name="phone" type="tel" pattern="[0-9 +()-]{9,15}" required />
                  </label>
                  <label className="form-field">
                    <span>Email</span>
                    <input name="email" type="email" maxLength={254} />
                  </label>
                  <label className="form-field form-field--full">
                    <span>Địa chỉ giao hàng *</span>
                    <input name="address" minLength={8} maxLength={300} required />
                  </label>
                  <label className="form-field form-field--full">
                    <span>Ghi chú</span>
                    <textarea name="note" rows={3} maxLength={500} />
                  </label>
                </div>
              </section>

              <section className="checkout-section">
                <div className="checkout-section__heading">
                  <span>02</span>
                  <div><h2>Phương thức thanh toán</h2><p>Chưa phát sinh thanh toán trực tuyến.</p></div>
                </div>
                <label className="payment-option">
                  <input type="radio" name="payment" value="cod" defaultChecked />
                  <span className="payment-option__mark" />
                  <span><strong>Thanh toán khi nhận hàng</strong><small>Thanh toán khi nhận được sản phẩm.</small></span>
                </label>
              </section>
            </form>

            <aside className="checkout-summary">
              <div className="checkout-summary__heading"><h2>Đơn hàng của bạn</h2><Link href="/cart">Chỉnh sửa</Link></div>
              <div className="checkout-products">
                {lines.map(({ product, quantity }) => (
                  <div className="checkout-product" key={product.id}>
                    <div className="checkout-product__image">
                      <Image src={product.image} alt={product.name} width={54} height={50} />
                      <span>{quantity}</span>
                    </div>
                    <div><strong>{product.name}</strong><small>{formatCurrency(product.price)} × {quantity}</small></div>
                    <b>{formatCurrency(product.price * quantity)}</b>
                  </div>
                ))}
              </div>
              <dl>
                <div><dt>Tạm tính</dt><dd>{formatCurrency(subtotal)}</dd></div>
                <div><dt>Phí giao hàng</dt><dd>{shipping ? formatCurrency(shipping) : "Miễn phí"}</dd></div>
                <div className="checkout-total"><dt>Tổng cộng</dt><dd>{formatCurrency(subtotal + shipping)}</dd></div>
              </dl>
              {orderError && <p className="checkout-error" role="alert">{orderError}</p>}
              <button className="place-order-button" type="submit" form="checkout-form" disabled={placingOrder}>
                {placingOrder ? "Đang ghi nhận..." : "Đặt hàng"}
              </button>
              <p className="order-disclaimer">Đơn hàng sẽ được ghi nhận trên hệ thống. Thanh toán khi nhận hàng.</p>
            </aside>
          </div>
        ) : (
          <div className="checkout-empty">
            <h2>Chưa có sản phẩm để thanh toán</h2>
            <p>Giỏ hàng của bạn đang trống.</p>
            <Link className="button button--primary" href="/products">Xem sản phẩm</Link>
          </div>
        )}
      </main>

      {successCode && (
        <div className="order-success">
          <div className="order-success__card" role="dialog" aria-modal="true">
            <div className="success-mark">✓</div>
            <p className="eyebrow">Đặt hàng thành công</p>
            <h2>Cảm ơn bạn đã mua hàng</h2>
            <p>Đơn hàng <strong>#{successCode}</strong> đã được ghi nhận trên Supabase. Mộc Nhiên sẽ sớm liên hệ xác nhận.</p>
            <Link className="button button--primary" href="/">Về trang chủ</Link>
          </div>
        </div>
      )}
    </>
  );
}
