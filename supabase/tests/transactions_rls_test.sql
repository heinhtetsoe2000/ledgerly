BEGIN;
SELECT plan(16);

insert into auth.users (id, aud, role, email, encrypted_password, created_at, updated_at)
values
	('11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'transaction-owner@example.com', '', now(), now()),
	('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'transaction-stranger@example.com', '', now(), now());

insert into public.categories (id, user_id, name, type)
values
	('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', 'Owner expense', 'expense'),
	('44444444-4444-4444-8444-444444444444', '11111111-1111-4111-8111-111111111111', 'Owner income', 'income'),
	('55555555-5555-4555-8555-555555555555', '22222222-2222-4222-8222-222222222222', 'Stranger expense', 'expense');

insert into public.transactions (id, user_id, category_id, type, amount, currency_code, description, occurred_on)
values
	('66666666-6666-4666-8666-666666666666', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', 'expense', 12.34, 'USD', 'Owner transaction', '2026-10-25'),
	('77777777-7777-4777-8777-777777777777', '22222222-2222-4222-8222-222222222222', '55555555-5555-4555-8555-555555555555', 'expense', 9.99, 'EUR', 'Stranger transaction', '2026-10-25');

set local role anon;
select throws_ok($$select * from public.transactions$$, '42501', null, 'anon cannot read transactions');
select throws_ok(
	$$insert into public.transactions (user_id, type, amount, currency_code, description, occurred_on) values ('11111111-1111-4111-8111-111111111111', 'expense', 1, 'USD', 'Anon', '2026-10-25')$$,
	'42501', null, 'anon cannot insert transactions'
);
select throws_ok($$update public.transactions set description = 'Anon'$$, '42501', null, 'anon cannot update transactions');
select throws_ok($$delete from public.transactions$$, '42501', null, 'anon cannot delete transactions');

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select results_eq(
	$$select id from public.transactions$$,
	array['66666666-6666-4666-8666-666666666666'::uuid],
	'owner reads only own transaction'
);
select results_eq(
	$$insert into public.transactions (id, user_id, category_id, type, amount, currency_code, description, occurred_on)
		values ('88888888-8888-4888-8888-888888888888', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', 'expense', 4.50, 'USD', 'Owned insert', '2026-10-26') returning id$$,
	array['88888888-8888-4888-8888-888888888888'::uuid], 'owner creates own transaction'
);
select throws_ok(
	$$insert into public.transactions (user_id, type, amount, currency_code, description, occurred_on)
		values ('22222222-2222-4222-8222-222222222222', 'expense', 1, 'USD', 'Wrong owner', '2026-10-26')$$,
	'42501', null, 'owner cannot create transaction for another user'
);
select throws_ok(
	$$insert into public.transactions (user_id, category_id, type, amount, currency_code, description, occurred_on)
		values ('11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444444', 'expense', 1, 'USD', 'Wrong category type', '2026-10-26')$$,
	'23514', null, 'transaction rejects mismatched category type'
);
select results_eq(
	$$update public.transactions set description = 'Owner updated' where id = '66666666-6666-4666-8666-666666666666' returning id$$,
	array['66666666-6666-4666-8666-666666666666'::uuid], 'owner updates own transaction'
);

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select is_empty($$select id from public.transactions where id = '66666666-6666-4666-8666-666666666666'$$, 'stranger cannot read owner transaction');
select is_empty(
	$$update public.transactions set description = 'Stolen' where id = '66666666-6666-4666-8666-666666666666' returning id$$,
	'stranger cannot update owner transaction'
);
select is_empty(
	$$delete from public.transactions where id = '66666666-6666-4666-8666-666666666666' returning id$$,
	'stranger cannot delete owner transaction'
);
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select results_eq(
	$$select description from public.transactions where id = '66666666-6666-4666-8666-666666666666'$$,
	array['Owner updated'::text], 'denied mutations left owner transaction unchanged'
);
set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select is_empty(
	$$select id from public.transactions where user_id = '11111111-1111-4111-8111-111111111111'$$,
	'stranger sees no other owner records'
);
select results_eq(
	$$delete from public.transactions where id = '77777777-7777-4777-8777-777777777777' returning id$$,
	array['77777777-7777-4777-8777-777777777777'::uuid], 'owner deletes own transaction'
);

set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select results_eq(
	$$delete from public.transactions where id = '88888888-8888-4888-8888-888888888888' returning id$$,
	array['88888888-8888-4888-8888-888888888888'::uuid], 'owner deletes own inserted transaction'
);

SELECT * FROM finish();
ROLLBACK;
