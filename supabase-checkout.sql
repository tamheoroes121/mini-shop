-- Bổ sung cổng đặt hàng an toàn cho checkout Mộc Nhiên.
-- Yêu cầu: đã chạy supabase-schema.sql để có products, orders và order_items.

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
  v_order_id uuid := gen_random_uuid();
  v_code text;
  v_subtotal bigint;
  v_shipping_fee bigint;
  v_total bigint;
begin
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
    and (pg_catalog.char_length(p_customer_email) > 254 or p_customer_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') then
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
    'Đã ghi nhận'
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

-- Không cấp quyền ghi trực tiếp vào orders/order_items.
-- Khách chỉ được gọi đúng hàm đã kiểm tra dữ liệu ở trên.
revoke all on function public.place_order(text, text, text, jsonb, text, text) from public;
revoke all on function public.place_order(text, text, text, jsonb, text, text) from anon, authenticated;
grant execute on function public.place_order(text, text, text, jsonb, text, text) to anon, authenticated;

-- Sau khi chạy, dòng này phải trả về true.
select pg_catalog.has_function_privilege(
  'anon',
  'public.place_order(text,text,text,jsonb,text,text)',
  'EXECUTE'
) as checkout_ready;
