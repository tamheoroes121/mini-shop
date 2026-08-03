# Mộc Nhiên — Next.js

Cửa hàng đồ thủ công Mộc Nhiên, xây dựng bằng Next.js và kết nối Supabase.

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

## Xác thực và dữ liệu

- Đăng ký, đăng nhập, duy trì phiên và đăng xuất sử dụng Supabase Auth.
- Tên khách hàng được lưu trong metadata của người dùng Supabase Auth; mật khẩu không được lưu trong bảng ứng dụng.
- Sản phẩm và đơn hàng được đọc/ghi từ Supabase.
- Giỏ hàng và danh sách yêu thích được lưu tạm trong bộ nhớ trình duyệt.
- Quyền quản trị được xác định bằng vai trò `admin` trong Supabase Auth.
