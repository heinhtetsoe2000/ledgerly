alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy profiles_insert_own
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy categories_select_own
  on public.categories for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy categories_insert_own
  on public.categories for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy categories_update_own
  on public.categories for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy categories_delete_own
  on public.categories for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy transactions_select_own
  on public.transactions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy transactions_insert_own
  on public.transactions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy transactions_update_own
  on public.transactions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy transactions_delete_own
  on public.transactions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create function public.enforce_transaction_category_type()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  category_type public.transaction_type;
begin
  if new.category_id is null then
    return new;
  end if;

  select category.type
    into category_type
    from public.categories as category
   where category.id = new.category_id
     and category.user_id = new.user_id;

  if category_type is null then
    raise exception 'Category must belong to the transaction owner.'
      using errcode = '23514';
  end if;

  if category_type <> new.type then
    raise exception 'Category type must match transaction type.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger transactions_enforce_category_type
  before insert or update of category_id, type, user_id
  on public.transactions
  for each row execute function public.enforce_transaction_category_type();

create function public.prevent_category_type_mismatch()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.type <> old.type and exists (
    select 1
      from public.transactions as transaction_row
     where transaction_row.category_id = new.id
       and transaction_row.user_id = new.user_id
       and transaction_row.type <> new.type
  ) then
    raise exception 'Category type cannot change while it is assigned to incompatible transactions.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger categories_prevent_type_mismatch
  before update of type
  on public.categories
  for each row execute function public.prevent_category_type_mismatch();