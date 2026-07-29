import { categories } from "@/data/categories";
import type { CategoryId, Product } from "@/types";

export type ProductRow = {
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

export const productFields = [
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

export function toProduct(row: ProductRow): Product {
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

export function toProductRow(product: Product): ProductRow {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category_id: product.category,
    price: product.price,
    compare_at_price: product.compareAtPrice ?? null,
    stock: product.stock,
    image: product.image,
    images: product.images,
    description: product.description,
    featured: Boolean(product.featured),
    is_new: Boolean(product.isNew),
  };
}
