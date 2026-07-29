import type { Product } from "@/types";
import { getSupabaseConfig } from "./config";
import { productFields, toProduct, type ProductRow } from "./product-record";

export async function getProductsFromSupabase(): Promise<Product[]> {
  const { url, publishableKey } = getSupabaseConfig();
  const endpoint = new URL(`${url}/rest/v1/products`);
  endpoint.searchParams.set("select", productFields);
  endpoint.searchParams.set("order", "created_at.asc");

  const response = await fetch(endpoint, {
    headers: { apikey: publishableKey },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Không đọc được sản phẩm từ Supabase (${response.status}): ${detail}`);
  }

  const rows = (await response.json()) as ProductRow[];
  return rows.map(toProduct);
}

export async function getProductBySlugFromSupabase(slug: string): Promise<Product | null> {
  const { url, publishableKey } = getSupabaseConfig();
  const endpoint = new URL(`${url}/rest/v1/products`);
  endpoint.searchParams.set("select", productFields);
  endpoint.searchParams.set("slug", `eq.${slug}`);
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint, {
    headers: { apikey: publishableKey },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Không đọc được chi tiết sản phẩm từ Supabase (${response.status}).`);
  const rows = (await response.json()) as ProductRow[];
  return rows[0] ? toProduct(rows[0]) : null;
}
