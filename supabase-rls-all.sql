-- RLS đầy đủ cho kho Mộc Nhiên.
-- Dán toàn bộ file này vào Supabase > SQL Editor > New query, sau đó bấm Run.
-- Yêu cầu: các bảng categories, products, orders, order_items và hàm place_order đã tồn tại.

begin;

-- auth.users thuộc schema nội bộ của Supabase Auth và không được mở qua Data API.
-- Đơn hàng chỉ lưu khóa ngoại tới auth.users; không tạo bảng mật khẩu/người dùng riêng.
alter table public.orders
add column if not exists user_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'orders_user_id_fkey'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
    add constraint orders_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete set null;
  end if;
end;
$$;

create index if not exists orders_user_id_idx
on public.orders(user_id);

-- Bật RLS cho toàn bộ bảng ứng dụng đang được Data API truy cập.
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Xóa policy cũ trên đúng bốn bảng để luật sau đây là nguồn quyền duy nhất.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select tablename, policyname
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename in ('categories', 'products', 'orders', 'order_items')
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      policy_record.policyname,
      policy_record.tablename
    );
  end loop;
end;
$$;

-- Thu hồi quyền cũ trước khi cấp lại quyền tối thiểu.
revoke all on table public.categories from anon, authenticated;
revoke all on table public.products from anon, authenticated;
revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;

-- Ai cũng được xem danh mục và sản phẩm.
grant select on table public.categories to anon, authenticated;
grant select on table public.products to anon, authenticated;

create policy "Everyone can read categories"
on public.categories
for select
to anon, authenticated
using (true);

create policy "Everyone can read products"
on public.products
for select
to anon, authenticated
using (true);

-- Chỉ admin được thêm, sửa, xóa sản phẩm.
grant insert, update, delete on table public.products to authenticated;

create policy "Admins can insert products"
on public.products
for insert
to authenticated
with check (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins can update products"
on public.products
for update
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins can delete products"
on public.products
for delete
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

-- Người đăng nhập được xem đơn của chính mình; admin xem mọi đơn.
grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;

create policy "Customers can read own orders"
on public.orders
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Admins can read all orders"
on public.orders
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Customers can read own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = (select auth.uid())
  )
);

create policy "Admins can read all order items"
on public.order_items
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

-- Admin chỉ được đổi cột trạng thái, không được sửa tên khách hay tổng tiền.
grant update (status) on table public.orders to authenticated;

create policy "Admins can process orders"
on public.orders
for update
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

-- Đặt hàng qua RPC để giá và tổng tiền luôn được tính từ bảng products.
-- SECURITY DEFINER chỉ bỏ qua RLS sau khi đã bắt buộc có auth.uid().
create or replace function public.place_order(
  p_customer_name text,
  p_customer_phone text,
  p_shipping_address text,
  p_items jsonb,
  p_customer_email text default null,
  p_note text default null
)
returns table(order_code text, order_total bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_order_id uuid := gen_random_uuid();
  v_code text;
  v_subtotal bigint;
  v_shipping_fee bigint;
  v_total bigint;
begin
  if v_user_id is null then
    raise exception 'Bạn cần đăng nhập trước khi đặt hàng.' using errcode = '42501';
  end if;

  p_customer_name := pg_catalog.btrim(p_customer_name);
  p_customer_phone := pg_catalog.btrim(p_customer_phone);
  p_shipping_address := pg_catalog.btrim(p_shipping_address);
  p_customer_email := nullif(pg_catalog.btrim(p_customer_email), '');
  p_note := nullif(pg_catalog.btrim(p_note), '');

  if pg_catalog.char_length(p_customer_name) not between 2 and 100 then
    raise exception 'Họ tên phải có từ 2 đến 100 ký tự.' using errcode = '22023';
  end if;

  if p_customer_phone !~ '^[0-9 +()\-]{9,15}$' then
    raise exception 'Số điện thoại không hợp lệ.' using errcode = '22023';
  end if;

  if pg_catalog.char_length(p_shipping_address) not between 8 and 300 then
    raise exception 'Địa chỉ phải có từ 8 đến 300 ký tự.' using errcode = '22023';
  end if;

  if p_customer_email is not null
    and (
      pg_catalog.char_length(p_customer_email) > 254
      or p_customer_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ) then
    raise exception 'Email không hợp lệ.' using errcode = '22023';
  end if;

  if p_note is not null and pg_catalog.char_length(p_note) > 500 then
    raise exception 'Ghi chú không được vượt quá 500 ký tự.' using errcode = '22023';
  end if;

  if p_items is null
    or pg_catalog.jsonb_typeof(p_items) <> 'array'
    or pg_catalog.jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'Đơn hàng phải có từ 1 đến 50 món.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(p_items) as item
    where pg_catalog.jsonb_typeof(item) <> 'object'
      or nullif(pg_catalog.btrim(item->>'product_id'), '') is null
      or pg_catalog.char_length(item->>'product_id') > 100
      or case
        when pg_catalog.jsonb_typeof(item->'quantity') = 'number'
          and (item->>'quantity') ~ '^[0-9]+$'
        then (item->>'quantity')::numeric not between 1 and 20
        else true
      end
  ) then
    raise exception 'Danh sách sản phẩm không hợp lệ.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from (
      select item->>'product_id' as product_id
      from pg_catalog.jsonb_array_elements(p_items) as item
      group by item->>'product_id'
      having count(*) > 1
    ) as duplicated_items
  ) then
    raise exception 'Một sản phẩm không được xuất hiện nhiều lần trong đơn.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(p_items) as item
    left join public.products as product
      on product.id = item->>'product_id'
    where product.id is null
       or product.stock < (item->>'quantity')::integer
  ) then
    raise exception 'Có sản phẩm không tồn tại hoặc không đủ tồn kho.' using errcode = '22023';
  end if;

  select sum(product.price * (item->>'quantity')::integer)::bigint
  into v_subtotal
  from pg_catalog.jsonb_array_elements(p_items) as item
  join public.products as product
    on product.id = item->>'product_id';

  v_shipping_fee := case when v_subtotal >= 500000 then 0 else 30000 end;
  v_total := v_subtotal + v_shipping_fee;
  v_code := 'MN' || pg_catalog.upper(
    pg_catalog.substr(pg_catalog.replace(v_order_id::text, '-', ''), 1, 10)
  );

  insert into public.orders (
    id,
    user_id,
    code,
    customer_name,
    customer_phone,
    customer_email,
    shipping_address,
    note,
    payment_method,
    subtotal,
    shipping_fee,
    total,
    status
  )
  values (
    v_order_id,
    v_user_id,
    v_code,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_shipping_address,
    p_note,
    'cod',
    v_subtotal,
    v_shipping_fee,
    v_total,
    'Mới'
  );

  insert into public.order_items (
    order_id,
    product_id,
    product_name,
    unit_price,
    quantity,
    product_image
  )
  select
    v_order_id,
    product.id,
    product.name,
    product.price,
    (item->>'quantity')::integer,
    product.image
  from pg_catalog.jsonb_array_elements(p_items) as item
  join public.products as product
    on product.id = item->>'product_id';

  return query select v_code, v_total;
end;
$$;

-- Khách ẩn danh không được đặt hàng; người đã đăng nhập được gọi RPC.
revoke all on function public.place_order(text, text, text, jsonb, text, text)
from public, anon, authenticated;

grant execute on function public.place_order(text, text, text, jsonb, text, text)
to authenticated;

commit;

-- Kiểm tra sau khi chạy: 4 bảng phải có rowsecurity = true.
select schemaname, tablename, rowsecurity
from pg_catalog.pg_tables
where schemaname = 'public'
  and tablename in ('categories', 'products', 'orders', 'order_items')
order by tablename;

-- Xem toàn bộ policy vừa áp dụng.
select tablename, policyname, roles, cmd
from pg_catalog.pg_policies
where schemaname = 'public'
  and tablename in ('categories', 'products', 'orders', 'order_items')
order by tablename, policyname;

-- Kết quả mong đợi: anon_can_checkout = false, user_can_checkout = true.
select
  pg_catalog.has_function_privilege(
    'anon',
    'public.place_order(text,text,text,jsonb,text,text)',
    'EXECUTE'
  ) as anon_can_checkout,
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.place_order(text,text,text,jsonb,text,text)',
    'EXECUTE'
  ) as user_can_checkout;
