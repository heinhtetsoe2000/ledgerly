begin;

select plan(4);

insert into auth.users (id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'schema-one@example.com', '', now(), now()),
  ('10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'schema-two@example.com', '', now(), now());

insert into public.categories (id, user_id, name, type)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Schema expense one', 'expense'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Schema expense two', 'expense');

select lives_ok(
  $$insert into public.transactions (user_id, category_id, type, amount, currency_code, description, occurred_on)
    values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'expense', 12.34, 'USD', 'Lunch', '2026-10-25')$$,
  'accepts a valid owned transaction'
);

select throws_ok(
  $$insert into public.transactions (user_id, type, amount, currency_code, description, occurred_on)
    values ('10000000-0000-0000-0000-000000000001', 'expense', 0, 'USD', 'Invalid amount', '2026-10-25')$$,
  '23514',
  null,
  'rejects non-positive amounts'
);

select throws_ok(
  $$insert into public.transactions (user_id, type, amount, currency_code, description, occurred_on)
    values ('10000000-0000-0000-0000-000000000001', 'transfer', 1, 'USD', 'Invalid type', '2026-10-25')$$,
  '22P02',
  null,
  'rejects unsupported transaction types'
);

select throws_ok(
  $$insert into public.transactions (user_id, category_id, type, amount, currency_code, description, occurred_on)
    values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'expense', 1, 'USD', 'Other owner category', '2026-10-25')$$,
  '23514',
  null,
  'rejects a category owned by another user'
);

select * from finish();
rollback;