"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { OrderStatus } from "@/types";

type DashboardOrder = {
  id: string;
  code: string;
  customer_name: string;
  created_at: string;
  total: number;
  status: OrderStatus;
  order_items: Array<{ quantity: number }>;
};

export default function AdminDashboardPage() {
  const [productCount, setProductCount] = useState(0);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const [productsResult, ordersResult] = await Promise.all([
        supabaseBrowser.from("products").select("id", { count: "exact", head: true }),
        supabaseBrowser.from("orders").select("id,code,customer_name,created_at,total,status,order_items(quantity)").order("created_at", { ascending: false }),
      ]);
      if (productsResult.error || ordersResult.error) {
        setMessage(productsResult.error?.message || ordersResult.error?.message || "Không tải được dữ liệu Supabase.");
        return;
      }
      setProductCount(productsResult.count ?? 0);
      setOrders((ordersResult.data ?? []) as unknown as DashboardOrder[]);
    };
    void load();
  }, []);

  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  return (
    <div className="admin-content">
      <div className="admin-heading"><div><p className="eyebrow">Bảng điều khiển</p><h1>Tổng quan cửa hàng</h1></div><p>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(new Date())}</p></div>
      {message && <p className="admin-form-message error" role="alert">Không tải được thống kê: {message}</p>}
      <section className="admin-stats">
        <article><span>Sản phẩm</span><strong>{productCount}</strong><small>Trên Supabase</small></article>
        <article><span>Đơn hàng</span><strong>{orders.length}</strong><small>Đơn thật đã ghi nhận</small></article>
        <article><span>Tài khoản</span><strong>Auth</strong><small>Quản lý bởi Supabase</small></article>
        <article><span>Doanh thu</span><strong>{formatCurrency(revenue)}</strong><small>Từ đơn trên Supabase</small></article>
      </section>
      <section className="admin-orders">
        <div className="admin-section-heading"><div><h2>Đơn hàng gần đây</h2><p>Dữ liệu trực tiếp từ kho Supabase.</p></div></div>
        <div className="admin-table-wrap">
          <table><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
            <tbody>{orders.slice(0, 8).map((order) => <tr key={order.id}><td>#{order.code}</td><td>{order.customer_name}</td><td>{new Intl.DateTimeFormat("vi-VN").format(new Date(order.created_at))}</td><td>{(order.order_items ?? []).reduce((sum, item) => sum + Number(item.quantity), 0)} món</td><td>{formatCurrency(order.total)}</td><td><span className="admin-status">{order.status}</span></td></tr>)}</tbody>
          </table>
          {!orders.length && !message && <div className="admin-empty-orders">Chưa có đơn hàng nào trên Supabase.</div>}
        </div>
      </section>
    </div>
  );
}
