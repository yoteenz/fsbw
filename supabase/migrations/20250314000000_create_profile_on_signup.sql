-- Create profile row when a new user signs up (auth.users insert).
-- This lets unconfirmed users show up in the admin client list even when
-- "Confirm email" is enabled. You can keep confirm email ON and design
-- your marketing emails later; new sign-ups will still appear in admin.
--
-- Prerequisites:
-- - Your backend's admin client list (e.g. /api/admin/clients) must read
--   from public.profiles (or the table you use below).
-- - public.profiles must exist and have at least: id (uuid), and optionally
--   email, first_name, last_name, phone_number, birthday. Adjust the INSERT
--   to match your actual columns.

-- Function: insert one row into public.profiles using auth.users NEW row
-- and raw_user_meta_data from signUp({ options: { data: { ... } } }).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone_number,
    birthday
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone_number', ''),
    coalesce(new.raw_user_meta_data ->> 'birthday', '')
  );
  return new;
end;
$$;

-- Trigger: run after every insert on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
