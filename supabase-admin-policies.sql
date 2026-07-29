-- Quyền quản trị thật cho Mộc Nhiên.
-- Yêu cầu: đã chạy supabase-user-roles.sql và đã nâng ít nhất một tài khoản lên admin.

begin;

-- Chỉ chấp nhận ảnh sản phẩm có sẵn trong public/assets/images/products.
alter table public.products
drop constraint if exists products_local_image_check;

alter table public.products
add constraint products_local_image_check
check (image like '/assets/images/products/%');

-- Chuẩn hóa trạng thái đơn theo giao diện quản trị mới.
alter table public.orders
drop constraint if exists orders_status_check;

update public.orders
set status = case
  when status = 'Đã ghi nhận' then 'Mới'
  when status = 'Đang xử lý' then 'Đang giao'
  else status
end
where status in ('Đã ghi nhận', 'Đang xử lý');

alter table public.orders
alter column status set default 'Mới';

alter table public.orders
add constraint orders_status_check
check (status in ('Mới', 'Đang giao', 'Đã giao', 'Đã hủy'));

-- Giữ tương thích với hàm place_order đã tạo trước đây.
-- Checkout cũ gửi "Đã ghi nhận" sẽ được đổi thành "Mới" trước khi kiểm tra constraint.
create or replace function public.normalize_order_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'Đã ghi nhận' then
    new.status := 'Mới';
  elsif new.status = 'Đang xử lý' then
    new.status := 'Đang giao';
  end if;
  return new;
end;
$$;

drop trigger if exists normalize_order_status_before_write on public.orders;
create trigger normalize_order_status_before_write
before insert or update of status on public.orders
for each row execute function public.normalize_order_status();

revoke all on function public.normalize_order_status() from public, anon, authenticated;

-- Quyền SQL tối thiểu để Data API thực hiện thao tác được RLS cho phép.
grant select, insert, update, delete on table public.products to authenticated;
grant select on table public.orders to authenticated;
grant update (status) on table public.orders to authenticated;
grant select on table public.order_items to authenticated;

-- Sản phẩm: khách vẫn chỉ đọc theo policy cũ; admin được thêm, sửa, xóa.
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products
for insert
to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products
for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products
for delete
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- Đơn hàng: admin được đọc đơn, đọc chi tiết món và chỉ sửa cột status.
drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
on public.orders
for select
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update order status" on public.orders;
create policy "Admins can update order status"
on public.orders
for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can read order items" on public.order_items;
create policy "Admins can read order items"
on public.order_items
for select
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

commit;

-- Kiểm tra nhanh: phải có 6 policy admin.
select count(*) as admin_policy_count
from pg_catalog.pg_policies
where schemaname = 'public'
  and policyname like 'Admins can %';
