"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatCurrency, normalizeText } from "@/lib/format";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { Order, OrderStatus } from "@/types";

type OrderItemRow = {
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  product_image: string | null;
};

type OrderRow = {
  id: string;
  code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  note: string | null;
  payment_method: "cod";
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  order_items: OrderItemRow[];
};

type AdminOrder = Order & { id: string };

const orderFields = "id,code,customer_name,customer_phone,customer_email,shipping_address,note,payment_method,subtotal,shipping_fee,total,status,created_at,order_items(product_id,product_name,unit_price,quantity,product_image)";
const statuses: OrderStatus[] = ["Mới", "Đang giao", "Đã giao", "Đã hủy"];

function toOrder(row: OrderRow): AdminOrder {
  return {
    id: row.id,
    code: row.code,
    createdAt: row.created_at,
    customer: {
      fullName: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email || undefined,
      address: row.shipping_address,
      note: row.note || undefined,
      payment: row.payment_method,
    },
    items: (row.order_items ?? []).map((item) => ({
      productId: item.product_id || "deleted-product",
      name: item.product_name,
      price: Number(item.unit_price),
      quantity: Number(item.quantity),
      image: item.product_image || "",
    })),
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping_fee),
    total: Number(row.total),
    status: row.status,
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabaseBrowser.from("orders").select(orderFields).order("created_at", { ascending: false });
    if (error) setMessage({ type: "error", text: `Không tải được đơn hàng: ${error.message}` });
    else setOrders(((data ?? []) as unknown as OrderRow[]).map(toOrder));
    setLoading(false);
  }, []);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const visible = useMemo(
    () => orders.filter((order) => normalizeText(`${order.code} ${order.customer.fullName} ${order.customer.phone}`).includes(normalizeText(query)) && (status === "all" || order.status === status)),
    [orders, query, status],
  );

  const updateStatus = async (order: AdminOrder, nextStatus: OrderStatus) => {
    setSavingId(order.id);
    setMessage(null);
    const { error } = await supabaseBrowser.from("orders").update({ status: nextStatus }).eq("id", order.id);
    if (error) {
      setMessage({ type: "error", text: `Không đổi được trạng thái: ${error.message}` });
    } else {
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: nextStatus } : item));
      setMessage({ type: "success", text: `Đơn #${order.code} đã chuyển sang “${nextStatus}”.` });
    }
    setSavingId(null);
  };

  return (
    <div className="admin-content admin-content--wide">
      <div className="admin-heading">
        <div><p className="eyebrow">Dữ liệu Supabase</p><h1>Quản lý đơn hàng</h1></div>
        <label className="admin-status-filter">Trạng thái <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">Tất cả</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <label className="admin-search" style={{ marginTop: 18 }}><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Tìm mã đơn, khách hàng..." /></label>
      {message && <p className={`admin-form-message ${message.type}`} role={message.type === "error" ? "alert" : "status"}>{message.text}</p>}
      <section className="admin-orders admin-orders--page">
        <div className="admin-section-heading"><div><h2>Danh sách đơn hàng</h2><p><strong>{visible.length}</strong> đơn thật từ Supabase.</p></div></div>
        <div className="admin-table-wrap">
          <table className="admin-orders-table">
            <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Liên hệ</th><th>Ngày đặt</th><th>Số món</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
            <tbody>{visible.map((order) => (
              <tr key={order.id}>
                <td><strong>#{order.code}</strong></td><td>{order.customer.fullName}</td>
                <td><span className="admin-contact-cell">{order.customer.phone}<small>{order.customer.email}</small></span></td>
                <td>{new Intl.DateTimeFormat("vi-VN").format(new Date(order.createdAt))}</td>
                <td title={order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}>{order.items.reduce((sum, item) => sum + item.quantity, 0)} món</td>
                <td><strong>{formatCurrency(order.total)}</strong></td>
                <td><select className="admin-order-state" value={order.status} disabled={savingId === order.id} onChange={(event) => void updateStatus(order, event.target.value as OrderStatus)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></td>
              </tr>
            ))}</tbody>
          </table>
          {loading && <div className="admin-empty-orders">Đang tải đơn hàng từ Supabase...</div>}
          {!loading && !visible.length && <div className="admin-empty-orders">Chưa có đơn hàng phù hợp.</div>}
        </div>
      </section>
    </div>
  );
}
