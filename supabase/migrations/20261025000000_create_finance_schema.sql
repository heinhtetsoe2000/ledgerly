create type public.transaction_type as enum ('income', 'expense');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  default_currency text not null default 'USD'
    check (default_currency ~ '^[A-Z]{3}$'),
  theme text not null default 'system'
    check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  type public.transaction_type not null,
  icon text not null default 'circle',
  color text not null default '#64748b',
  is_default boolean not null default false,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint categories_id_user_unique unique (id, user_id)
);

create unique index categories_owner_type_name_unique
  on public.categories (user_id, type, lower(name));

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid,
  type public.transaction_type not null,
  amount numeric(14, 2) not null check (amount > 0),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  description text not null check (char_length(btrim(description)) between 1 and 240),
  occurred_on date not null,
  notes text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint transactions_category_owner_fkey
    foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete restrict
);

create index categories_user_type_name_idx
  on public.categories (user_id, type, name);

create index transactions_user_date_idx
  on public.transactions (user_id, occurred_on desc);

create index transactions_user_type_date_idx
  on public.transactions (user_id, type, occurred_on desc);

create index transactions_user_category_idx
  on public.transactions (user_id, category_id)
  where category_id is not null;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

revoke all on table public.profiles, public.categories, public.transactions
  from public, anon, authenticated, service_role;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();