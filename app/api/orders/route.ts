import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

type CheckoutRequest = {
  customer?: {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
    note?: string;
  };
  items?: Array<{ productId?: string; quantity?: number }>;
};

type RpcResult = Array<{ order_code: string; order_total: number }>;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Bạn cần đăng nhập trước khi đặt hàng." }, { status: 401 });
  }

  let payload: CheckoutRequest;

  try {
    payload = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "Dữ liệu đặt hàng không hợp lệ." }, { status: 400 });
  }

  const customer = payload.customer;
  const items = payload.items;

  if (!customer || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Đơn hàng chưa có đủ thông tin." }, { status: 400 });
  }

  try {
    const { url, publishableKey } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/rpc/place_order`, {
      method: "POST",
      headers: {
        apikey: publishableKey,
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_customer_name: customer.fullName ?? "",
        p_customer_phone: customer.phone ?? "",
        p_shipping_address: customer.address ?? "",
        p_items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
        p_customer_email: customer.email || null,
        p_note: customer.note || null,
      }),
      cache: "no-store",
    });

    const result = (await response.json()) as RpcResult | { message?: string };

    if (!response.ok) {
      const message = !Array.isArray(result) && result.message
        ? result.message
        : "Không thể ghi nhận đơn hàng trên Supabase.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const order = Array.isArray(result) ? result[0] : undefined;
    if (!order?.order_code) {
      return NextResponse.json({ error: "Supabase không trả về mã đơn hàng." }, { status: 502 });
    }

    return NextResponse.json({ code: order.order_code, total: Number(order.order_total) });
  } catch (error) {
    console.error("Không thể kết nối Supabase khi đặt hàng:", error);
    return NextResponse.json({ error: "Không thể kết nối kho dữ liệu. Vui lòng thử lại." }, { status: 503 });
  }
}
