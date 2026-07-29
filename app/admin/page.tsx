"use client";

import { useEffect, useState } from "react";
import { products } from "@/data/products";
import { formatCurrency } from "@/lib/format";
import { readStorage, storageKeys } from "@/lib/storage";
import type { Order, StoredUser } from "@/types";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]); const [customers, setCustomers] = useState(1);
  useEffect(() => { setOrders(readStorage<Order[]>(storageKeys.orders, [])); setCustomers(readStorage<StoredUser[]>(storageKeys.users, []).length + 1); }, []);
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  return <div className="admin-content"><div className="admin-heading"><div><p className="eyebrow">Bảng điều khiển</p><h1>Tổng quan cửa hàng</h1></div><p>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(new Date())}</p></div><section className="admin-stats"><article><span>Sản phẩm</span><strong>{products.length}</strong><small>Trong cửa hàng</small></article><article><span>Đơn hàng</span><strong>{orders.length}</strong><small>Đã ghi nhận</small></article><article><span>Khách hàng</span><strong>{customers}</strong><small>Tài khoản cục bộ</small></article><article><span>Doanh thu giả lập</span><strong>{formatCurrency(revenue)}</strong><small>Từ đơn đã đặt</small></article></section><section className="admin-orders"><div className="admin-section-heading"><div><h2>Đơn hàng gần đây</h2><p>Dữ liệu đặt hàng lưu trên trình duyệt này.</p></div></div><div className="admin-table-wrap"><table><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>{orders.slice().reverse().slice(0,8).map((order) => <tr key={order.code}><td>#{order.code}</td><td>{order.customer.fullName}</td><td>{new Intl.DateTimeFormat("vi-VN").format(new Date(order.createdAt))}</td><td>{order.items.reduce((sum,item) => sum + item.quantity,0)} món</td><td>{formatCurrency(order.total)}</td><td><span className="admin-status">{order.status || "Đã ghi nhận"}</span></td></tr>)}</tbody></table>{!orders.length && <div className="admin-empty-orders">Chưa có đơn hàng nào được ghi nhận.</div>}</div></section></div>;
}
