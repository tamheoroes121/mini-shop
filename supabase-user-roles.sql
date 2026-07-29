-- Phân vai người dùng cho Mộc Nhiên bằng Supabase Auth app_metadata.
-- Chạy toàn bộ phần thiết lập trong Supabase SQL Editor.

begin;

-- Mọi tài khoản mới không được hệ thống gán vai hợp lệ sẽ là customer.
create or replace function public.set_default_auth_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.raw_app_meta_data->>'role', '') not in ('customer', 'admin') then
    new.raw_app_meta_data := pg_catalog.jsonb_set(
      coalesce(new.raw_app_meta_data, '{}'::jsonb),
      '{role}',
      '"customer"'::jsonb,
      true
    );
  end if;

  return new;
end;
$$;

drop trigger if exists set_default_auth_role_on_signup on auth.users;
create trigger set_default_auth_role_on_signup
before insert on auth.users
for each row execute function public.set_default_auth_role();

-- Bổ sung vai customer cho các tài khoản cũ chưa có vai hợp lệ.
update auth.users
set raw_app_meta_data = pg_catalog.jsonb_set(
  coalesce(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"customer"'::jsonb,
  true
)
where coalesce(raw_app_meta_data->>'role', '') not in ('customer', 'admin');

-- Hàm này chỉ được trigger Auth sử dụng, không mở cho trình duyệt gọi.
revoke all on function public.set_default_auth_role() from public, anon, authenticated;

commit;

-- Kiểm tra phân bố vai hiện tại mà không hiển thị email hay thông tin cá nhân.
select
  coalesce(raw_app_meta_data->>'role', 'chưa có vai') as role,
  count(*) as user_count
from auth.users
group by coalesce(raw_app_meta_data->>'role', 'chưa có vai')
order by role;

-- ================================================================
-- NÂNG MỘT TÀI KHOẢN LÊN ADMIN
-- Thay email bên dưới bằng email thật, rồi chạy RIÊNG câu UPDATE này.
-- Sau khi chạy, tài khoản đó cần đăng xuất và đăng nhập lại.
-- ================================================================

-- update auth.users
-- set raw_app_meta_data = pg_catalog.jsonb_set(
--   coalesce(raw_app_meta_data, '{}'::jsonb),
--   '{role}',
--   '"admin"'::jsonb,
--   true
-- )
-- where lower(email) = lower('email-admin-cua-ban@example.com')
-- returning id, email, raw_app_meta_data->>'role' as role;
