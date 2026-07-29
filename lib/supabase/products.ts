import { categories } from "@/data/categories";
import type { CategoryId, Product } from "@/types";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category_id: CategoryId;
  price: number;
  compare_at_price: number | null;
  stock: number;
  image: string;
  images: string[] | null;
  description: string;
  featured: boolean;
  is_new: boolean;
};

const productFields = [
  "id",
  "slug",
  "name",
  "category_id",
  "price",
  "compare_at_price",
  "stock",
  "image",
  "images",
  "description",
  "featured",
  "is_new",
].join(",");

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Thiếu SUPABASE_URL hoặc SUPABASE_PUBLISHABLE_KEY trong file môi trường.");
  }

  return { url: url.replace(/\/$/, ""), publishableKey };
}

function toProduct(row: ProductRow): Product {
  const categoryLabel = categories.find((item) => item.id === row.category_id)?.label;

  if (!categoryLabel) {
    throw new Error(`Danh mục Supabase không hợp lệ: ${row.category_id}`);
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category_id,
    categoryLabel,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price === null ? undefined : Number(row.compare_at_price),
    stock: Number(row.stock),
    image: row.image,
    images: row.images?.length ? row.images : [row.image],
    description: row.description,
    featured: row.featured,
    isNew: row.is_new,
  };
}

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
