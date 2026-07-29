import type { Product } from "@/types";

const base = "/assets/images/products";

export const products: Product[] = [
  {
    id: "macrame", slug: "tranh-macrame-an-nhien", name: "Tranh Macramé An Nhiên",
    category: "trang-tri", categoryLabel: "Trang trí", price: 390000, stock: 14, featured: true, isNew: true,
    image: `${base}/do-thu-cong/tranh-treo-macrame.webp`,
    images: [`${base}/do-thu-cong/tranh-treo-macrame.webp`, `${base}/San_pham/tranh-treo-macrame-original.webp`],
    description: "Tranh macramé thắt tay từ sợi cotton, mang nét mềm mại và tự nhiên cho không gian sống.",
  },
  {
    id: "basket", slug: "gio-may-dan-moc", name: "Giỏ Mây Đan Mộc",
    category: "may-dan", categoryLabel: "Mây đan", price: 290000, stock: 21, featured: true,
    image: `${base}/do-thu-cong/gio-may-dan.webp`, images: [`${base}/do-thu-cong/gio-may-dan.webp`, `${base}/San_pham/gio-may-dan-original.webp`],
    description: "Giỏ mây đan thủ công, gọn nhẹ và phù hợp để lưu trữ những vật dụng nhỏ trong nhà.",
  },
  {
    id: "wooden-tray", slug: "khay-go-van-tu-nhien", name: "Khay Gỗ Vân Tự Nhiên",
    category: "go", categoryLabel: "Đồ gỗ", price: 320000, compareAtPrice: 355000, stock: 8, featured: true,
    image: `${base}/do-thu-cong/khay-go-trang-tri.webp`, images: [`${base}/do-thu-cong/khay-go-trang-tri.webp`, `${base}/do-thu-cong/khay-go-hoa-van.webp`],
    description: "Khay gỗ hoàn thiện thủ công, giữ nguyên đường vân ấm áp và vẻ đẹp mộc mạc của vật liệu.",
  },
  {
    id: "vase-set", slug: "bo-binh-gom-moc-sac", name: "Bộ Bình Gốm Mộc Sắc",
    category: "gom", categoryLabel: "Gốm thủ công", price: 590000, compareAtPrice: 720000, stock: 16, featured: true, isNew: true,
    image: `${base}/do-my-nghe/bo-binh-gom-minimal.webp`,
    images: [`${base}/do-my-nghe/bo-binh-gom-minimal.webp`, `${base}/San_pham/bo-binh-gom-minimal-original.webp`, `${base}/do-my-nghe/binh-gom-trang-tri.webp`],
    description: "Bộ bình gốm tạo hình và hoàn thiện thủ công, phối các sắc độ tự nhiên cho bàn trà hoặc kệ sách.",
  },
  {
    id: "bamboo-lamp", slug: "den-tre-binh-minh", name: "Đèn Tre Bình Minh",
    category: "may-dan", categoryLabel: "Mây đan", price: 690000, stock: 6, featured: true,
    image: `${base}/do-my-nghe/den-tre-thu-cong.webp`, images: [`${base}/do-my-nghe/den-tre-thu-cong.webp`, `${base}/San_pham/den-tre-thu-cong-original.webp`],
    description: "Đèn tre đan tạo ánh sáng dịu, mang bầu không khí ấm cúng vào phòng khách và phòng ngủ.",
  },
  {
    id: "decor-vase", slug: "binh-gom-vet-nang", name: "Bình Gốm Vệt Nắng",
    category: "gom", categoryLabel: "Gốm thủ công", price: 450000, stock: 12, featured: true,
    image: `${base}/do-my-nghe/binh-gom-trang-tri.webp`, images: [`${base}/do-my-nghe/binh-gom-trang-tri.webp`, `${base}/San_pham/binh-gom-trang-tri-original.webp`],
    description: "Bình gốm trang trí với màu men nhẹ và bề mặt giàu cảm giác thủ công.",
  },
  {
    id: "wooden-shelf", slug: "ke-go-da-nang", name: "Kệ Gỗ Đa Năng",
    category: "go", categoryLabel: "Đồ gỗ", price: 1290000, stock: 0,
    image: `${base}/noi-that-gia-dung/ke-go-trang-tri.webp`, images: [`${base}/noi-that-gia-dung/ke-go-trang-tri.webp`, `${base}/San_pham/ke-go-trang-tri-original.webp`],
    description: "Kệ gỗ nhiều tầng giúp sắp xếp sách và đồ trang trí gọn gàng.",
  },
  {
    id: "plant-pot", slug: "chau-cay-de-ban", name: "Chậu Cây Để Bàn",
    category: "trang-tri", categoryLabel: "Trang trí", price: 240000, stock: 0,
    image: `${base}/noi-that-gia-dung/chau-cay-de-ban.webp`, images: [`${base}/noi-that-gia-dung/chau-cay-de-ban.webp`, `${base}/San_pham/chau-cay-de-ban-original.webp`],
    description: "Chậu cây nhỏ dành cho bàn làm việc, kệ sách và những góc cần thêm sắc xanh.",
  },
];

export const getProductById = (id: string) => products.find((product) => product.id === id);
export const getProductBySlug = (slug: string) => products.find((product) => product.slug === slug);
