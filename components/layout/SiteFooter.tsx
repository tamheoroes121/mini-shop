import Link from "next/link";
import { Brand } from "./Brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner container">
        <div className="footer-brand"><Brand /><p>Đồ thủ công và trang trí cho một không gian sống ấm áp, tự nhiên và đầy dấu ấn riêng.</p></div>
        <div className="footer-column"><h2>Thông tin</h2><Link href="/#story">Về chúng tôi</Link><Link href="/products">Câu chuyện sản phẩm</Link><Link href="/cart">Chính sách đổi trả</Link></div>
        <div className="footer-column"><h2>Hỗ trợ</h2><Link href="/products">Hướng dẫn mua hàng</Link><Link href="/checkout">Thanh toán & giao hàng</Link><Link href="/">Câu hỏi thường gặp</Link></div>
        <div className="footer-column" id="footer-contact"><h2>Liên hệ</h2><p>24 Nguyễn Du, Hà Nội</p><a href="tel:0123456789">0123 456 789</a><a href="mailto:xinchao@mocnhien.vn">xinchao@mocnhien.vn</a><p>08:00 – 21:00, hằng ngày</p></div>
      </div>
      <div className="footer-bottom container">© 2026 Mộc Nhiên. Mọi quyền được bảo lưu.</div>
    </footer>
  );
}
