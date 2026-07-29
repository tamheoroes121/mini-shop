import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";
import { ProductCard } from "@/components/products/ProductCard";
import { getProductsFromSupabase } from "@/lib/supabase/products";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getProductsFromSupabase();
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();
  const related = products.filter((item) => item.id !== product.id && (item.category === product.category || item.featured)).slice(0, 4);
  return <main className="container product-detail-page"><nav className="breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><Link href="/products">Sản phẩm</Link><span>/</span><span>{product.name}</span></nav><section className="product-detail" aria-labelledby="detail-title"><ProductDetailClient product={product} /><aside className="product-facts"><section className="fact-card"><h2>Chi tiết</h2><dl><div><dt>Chất liệu</dt><dd>Vật liệu tự nhiên</dd></div><div><dt>Danh mục</dt><dd>{product.categoryLabel}</dd></div><div><dt>Tồn kho</dt><dd>{product.stock} sản phẩm</dd></div><div><dt>Xuất xứ</dt><dd>Việt Nam</dd></div></dl></section><section className="fact-card"><h2>Giao hàng</h2><ul><li>Giao tiêu chuẩn: 2–5 ngày</li><li>Giao nhanh: 1–2 ngày</li><li>Đóng gói chống va đập</li></ul></section></aside></section><section className="related-products"><div className="section-heading"><div><p className="eyebrow">Có thể bạn sẽ thích</p><h2>Sản phẩm liên quan</h2></div></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section></main>;
}
