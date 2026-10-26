create function public.initialize_user_finances()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'display_name'), '')
  )
  on conflict (id) do nothing;

  insert into public.categories (user_id, name, type, icon, color, is_default)
  values
    (new.id, 'Food', 'expense', 'utensils', '#e76f51', true),
    (new.id, 'Transportation', 'expense', 'car-front', '#457b9d', true),
    (new.id, 'Shopping', 'expense', 'shopping-bag', '#9c6644', true),
    (new.id, 'Housing', 'expense', 'house', '#6a994e', true),
    (new.id, 'Bills', 'expense', 'receipt', '#f4a261', true),
    (new.id, 'Health', 'expense', 'heart-pulse', '#d1495b', true),
    (new.id, 'Entertainment', 'expense', 'clapperboard', '#735d78', true),
    (new.id, 'Other', 'expense', 'circle', '#64748b', true),
    (new.id, 'Salary', 'income', 'briefcase-business', '#2a9d8f', true),
    (new.id, 'Freelance', 'income', 'laptop', '#457b9d', true),
    (new.id, 'Business', 'income', 'building-2', '#6a994e', true),
    (new.id, 'Gifts', 'income', 'gift', '#e9c46a', true),
    (new.id, 'Other', 'income', 'circle', '#64748b', true)
  on conflict (user_id, type, (lower(name))) do nothing;

  return new;
end;
$$;

revoke all on function public.initialize_user_finances() from public, anon, authenticated;

create trigger auth_user_initialize_finances
  after insert on auth.users
  for each row execute function public.initialize_user_finances();