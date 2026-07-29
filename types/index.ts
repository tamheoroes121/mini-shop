export type CategoryId = "gom" | "may-dan" | "go" | "trang-tri";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  categoryLabel: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image: string;
  images: string[];
  description: string;
  featured?: boolean;
  isNew?: boolean;
};

export type CartLine = { productId: string; quantity: number };
export type Role = "customer" | "admin";
export type User = { id: string; name: string; email: string; role: Role };

export type CustomerInfo = {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  note?: string;
  payment: "cod";
};

export type OrderStatus = "Mới" | "Đang giao" | "Đã giao" | "Đã hủy";
export type Order = {
  code: string;
  createdAt: string;
  customer: CustomerInfo;
  items: Array<CartLine & { name: string; price: number; image: string }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
};
