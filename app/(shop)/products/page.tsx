import Link from "next/link";
import { ProductCatalog } from "@/components/products/ProductCatalog";
import { getProductsFromSupabase } from "@/lib/supabase/products";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ q = "" }, products] = await Promise.all([searchParams, getProductsFromSupabase()]);
  return <main className="container product-page"><nav className="breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><span>Sản phẩm</span></nav><ProductCatalog initialQuery={q} products={products} /></main>;
}
