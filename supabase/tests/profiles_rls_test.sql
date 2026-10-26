BEGIN;
SELECT plan(11);

insert into auth.users (id, aud, role, email, encrypted_password, created_at, updated_at)
values
	('11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'profile-owner@example.com', '', now(), now()),
	('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'profile-stranger@example.com', '', now(), now());

set local role anon;
select throws_ok($$select * from public.profiles$$, '42501', null, 'anon cannot read profiles');
select throws_ok(
	$$insert into public.profiles (id) values ('11111111-1111-4111-8111-111111111111')$$,
	'42501', null, 'anon cannot insert profiles'
);
select throws_ok($$update public.profiles set display_name = 'anon'$$, '42501', null, 'anon cannot update profiles');
select throws_ok($$delete from public.profiles$$, '42501', null, 'anon cannot delete profiles');

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select results_eq(
	$$select id from public.profiles$$,
	array['11111111-1111-4111-8111-111111111111'::uuid],
	'owner reads only their own profile'
);
select throws_ok(
	$$insert into public.profiles (id) values ('22222222-2222-4222-8222-222222222222')$$,
	'42501', null, 'owner cannot insert a profile for another user'
);
select results_eq(
	$$update public.profiles set display_name = 'Updated owner' where id = '11111111-1111-4111-8111-111111111111' returning display_name$$,
	array['Updated owner'::text],
	'owner updates their own profile'
);

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select is_empty($$select id from public.profiles where id = '11111111-1111-4111-8111-111111111111'$$, 'stranger cannot read owner profile');
select is_empty(
	$$update public.profiles set display_name = 'stolen' where id = '11111111-1111-4111-8111-111111111111' returning id$$,
	'stranger cannot update owner profile'
);
select throws_ok(
	$$delete from public.profiles where id = '11111111-1111-4111-8111-111111111111'$$,
	'42501', null, 'profiles do not grant delete to authenticated users'
);
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select results_eq(
	$$select display_name from public.profiles where id = '11111111-1111-4111-8111-111111111111'$$,
	array['Updated owner'::text],
	'denied update left the owner profile unchanged'
);

SELECT * FROM finish();
ROLLBACK;
