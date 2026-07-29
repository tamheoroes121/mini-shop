import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/products/ProductCard";
import { getProductsFromSupabase } from "@/lib/supabase/products";

export default async function HomePage() {
  const products = await getProductsFromSupabase();

  return (
    <main className="home-page">
      <section className="hero container" aria-labelledby="hero-title"><div className="hero__content"><p className="eyebrow">Không gian mang dấu ấn riêng</p><h1 id="hero-title">Sống đẹp mỗi ngày<br />cùng Mộc Nhiên</h1><p className="hero__description">Những món đồ thủ công tinh tế, được chọn lựa để mang sự ấm áp và bình yên vào ngôi nhà của bạn.</p><Link className="button button--primary" href="/products">Mua sắm ngay</Link><div className="benefits"><div className="benefit"><span><strong>Giao hàng nhanh</strong><small>Toàn quốc</small></span></div><div className="benefit"><span><strong>Đổi trả dễ dàng</strong><small>Trong 7 ngày</small></span></div><div className="benefit"><span><strong>Hỗ trợ tận tâm</strong><small>8:00 – 21:00</small></span></div></div></div></section>
      <section className="catalog container" aria-labelledby="featured-title"><div className="section-heading"><div><p className="eyebrow">Được yêu thích</p><h2 id="featured-title">Sản phẩm nổi bật</h2></div><Link className="text-link" href="/products">Xem tất cả <span>→</span></Link></div><div className="product-grid">{products.filter((product) => product.featured).map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
      <section className="story container" id="story" aria-labelledby="story-title"><div className="story__image"><Image src="/assets/images/products/do-thu-cong/khay-go-hoa-van.webp" alt="Nghệ thuật làm đồ gỗ thủ công" width={700} height={500} /></div><div className="story__content"><p className="eyebrow">Câu chuyện của chúng tôi</p><h2 id="story-title">Vẻ đẹp đến từ những điều mộc mạc</h2><p>Mỗi sản phẩm tại Mộc Nhiên được tuyển chọn từ những người thợ lành nghề, trân trọng vật liệu tự nhiên và kỹ thuật thủ công truyền thống.</p><Link className="text-link" href="/products">Khám phá Mộc Nhiên <span>→</span></Link></div></section>
    </main>
  );
}
