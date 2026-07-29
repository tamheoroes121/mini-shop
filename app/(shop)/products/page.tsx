import Link from "next/link";
import { ProductCatalog } from "@/components/products/ProductCatalog";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <main className="container product-page"><nav className="breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><span>Sản phẩm</span></nav><ProductCatalog initialQuery={q} /></main>;
}
