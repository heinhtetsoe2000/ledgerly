BEGIN;
SELECT plan(14);

insert into auth.users (id, aud, role, email, encrypted_password, created_at, updated_at)
values
	('11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'category-owner@example.com', '', now(), now()),
	('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'category-stranger@example.com', '', now(), now());

insert into public.categories (id, user_id, name, type)
values
	('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', 'Owner custom', 'expense'),
	('44444444-4444-4444-8444-444444444444', '22222222-2222-4222-8222-222222222222', 'Stranger custom', 'expense'),
	('55555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111', 'Income custom', 'income');

insert into public.transactions (user_id, category_id, type, amount, currency_code, description, occurred_on)
values ('11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', 'expense', 5, 'USD', 'Category use', '2026-10-26');

set local role anon;
select throws_ok($$select * from public.categories$$, '42501', null, 'anon cannot read categories');
select throws_ok(
	$$insert into public.categories (user_id, name, type) values ('11111111-1111-4111-8111-111111111111', 'Anon', 'expense')$$,
	'42501', null, 'anon cannot insert categories'
);
select throws_ok($$update public.categories set name = 'Anon'$$, '42501', null, 'anon cannot update categories');
select throws_ok($$delete from public.categories$$, '42501', null, 'anon cannot delete categories');

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select results_eq(
	$$select name from public.categories where id = '33333333-3333-4333-8333-333333333333'$$,
	array['Owner custom'::text], 'owner reads own category'
);
select throws_ok(
	$$insert into public.categories (user_id, name, type) values ('22222222-2222-4222-8222-222222222222', 'Impersonated', 'expense')$$,
	'42501', null, 'owner cannot create category for another user'
);
select results_eq(
	$$update public.categories set name = 'Owner updated' where id = '33333333-3333-4333-8333-333333333333' returning name$$,
	array['Owner updated'::text], 'owner updates own category'
);
select throws_ok(
	$$update public.categories set type = 'income' where id = '33333333-3333-4333-8333-333333333333'$$,
	'23514', null, 'category type cannot mismatch assigned transactions'
);
select throws_ok(
	$$delete from public.categories where id = '33333333-3333-4333-8333-333333333333'$$,
	'23503', null, 'in-use category cannot be deleted'
);

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select is_empty($$select id from public.categories where id = '33333333-3333-4333-8333-333333333333'$$, 'stranger cannot read owner category');
select is_empty(
	$$update public.categories set name = 'Stolen' where id = '33333333-3333-4333-8333-333333333333' returning id$$,
	'stranger cannot update owner category'
);
select is_empty(
	$$delete from public.categories where id = '33333333-3333-4333-8333-333333333333' returning id$$,
	'stranger cannot delete owner category'
);
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select results_eq(
	$$select name from public.categories where id = '33333333-3333-4333-8333-333333333333'$$,
	array['Owner updated'::text], 'denied category mutations left row unchanged'
);
set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select results_eq(
	$$select name from public.categories where id = '44444444-4444-4444-8444-444444444444'$$,
	array['Stranger custom'::text], 'stranger reads their own category'
);

SELECT * FROM finish();
ROLLBACK;
