BEGIN;
SELECT plan(5);

insert into auth.users (
	id, aud, role, email, encrypted_password, raw_user_meta_data, created_at, updated_at
)
values (
	'99999999-9999-4999-8999-999999999999',
	'authenticated',
	'authenticated',
	'default-categories@example.com',
	'',
	'{"display_name":"New Member"}'::jsonb,
	now(),
	now()
);

select results_eq(
	$$select display_name from public.profiles where id = '99999999-9999-4999-8999-999999999999'$$,
	array['New Member'::text],
	'creates a profile with the requested display name'
);

select is(
	(select count(*) from public.categories where user_id = '99999999-9999-4999-8999-999999999999'),
	13::bigint,
	'creates all 13 default categories'
);

select is(
	(select count(*) from public.categories where user_id = '99999999-9999-4999-8999-999999999999' and type = 'expense'),
	8::bigint,
	'creates eight default expense categories'
);

select is(
	(select count(*) from public.categories where user_id = '99999999-9999-4999-8999-999999999999' and type = 'income'),
	5::bigint,
	'creates five default income categories'
);

create temporary table retry_auth_event (
	id uuid not null,
	raw_user_meta_data jsonb
);

create trigger retry_finance_initialization
	after insert on retry_auth_event
	for each row execute function private.initialize_user_finances();

insert into retry_auth_event (id, raw_user_meta_data)
values ('99999999-9999-4999-8999-999999999999', '{"display_name":"Retry Name"}'::jsonb);

select is(
	(select count(*) from public.categories where user_id = '99999999-9999-4999-8999-999999999999'),
	13::bigint,
	'a repeated initializer does not duplicate default categories'
);

SELECT * FROM finish();
ROLLBACK;
