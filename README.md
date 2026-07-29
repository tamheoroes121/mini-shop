# Mộc Nhiên — Next.js

Phiên bản Next.js của cửa hàng đồ thủ công Mộc Nhiên. Toàn bộ mã nguồn mới nằm trong thư mục này; phiên bản HTML/CSS/JavaScript cũ ở thư mục cha được giữ nguyên.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

Kiểm tra production:

```bash
npm run typecheck
npm run build
npm run start
```

## Tài khoản giả lập

- Khách hàng: `khach@mocnhien.vn` / `123456`
- Quản trị: `admin@mocnhien.vn` / `admin123`

Giỏ hàng, yêu thích, phiên đăng nhập và đơn hàng được lưu trong `localStorage`. Không có thanh toán thật hoặc máy chủ dữ liệu.
