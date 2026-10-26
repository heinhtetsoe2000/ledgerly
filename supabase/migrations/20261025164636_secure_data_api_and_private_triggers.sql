create schema if not exists private;

revoke all on schema private from public, anon, authenticated, service_role;
grant usage on schema private to authenticated, supabase_auth_admin;

grant usage on schema public to authenticated;
revoke all on type public.transaction_type from public, anon, authenticated, service_role;
grant usage on type public.transaction_type to authenticated;

revoke all on table public.profiles, public.categories, public.transactions
	from public, anon, authenticated, service_role;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.categories to authenticated;
grant select, insert, update, delete on table public.transactions to authenticated;

alter function public.set_updated_at() set schema private;
alter function public.enforce_transaction_category_type() set schema private;
alter function public.prevent_category_type_mismatch() set schema private;
alter function public.initialize_user_finances() set schema private;

create or replace function private.enforce_transaction_category_type()
returns trigger
language plpgsql
security invoker
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

create or replace function private.prevent_category_type_mismatch()
returns trigger
language plpgsql
security invoker
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

revoke all on function private.set_updated_at() from public, anon, authenticated, service_role;
revoke all on function private.enforce_transaction_category_type() from public, anon, authenticated, service_role;
revoke all on function private.prevent_category_type_mismatch() from public, anon, authenticated, service_role;
revoke all on function private.initialize_user_finances() from public, anon, authenticated, service_role;

grant execute on function private.set_updated_at() to authenticated;
grant execute on function private.enforce_transaction_category_type() to authenticated;
grant execute on function private.prevent_category_type_mismatch() to authenticated;
grant execute on function private.initialize_user_finances() to supabase_auth_admin;
