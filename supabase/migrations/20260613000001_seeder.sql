insert into public.roles (id, name, description)
values (
  '00000000-0000-4000-8000-000000000001',
  'Super Admin',
  'Full administrative access across the application.'
)
on conflict (name) where deleted_at is null do update
set description = excluded.description;

insert into public.permissions (id, module, name, key, description)
values
  (
    '00000000-0000-4000-8000-000000000101',
    'AUTH',
    'Users',
    'AUTH_USERS',
    'Create, invite, edit, activate, deactivate, and delete team members.'
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'TEAM',
    'Roles',
    'TEAM_ROLES',
    'Manage roles and role permission grants.'
  )
on conflict (key) where deleted_at is null do update
set
  module = excluded.module,
  name = excluded.name,
  description = excluded.description;

insert into public.role_permissions (role_id, permission_id, actions)
select
  r.id,
  p.id,
  array['READ', 'CREATE', 'UPDATE', 'DELETE']::varchar[]
from public.roles r
cross join public.permissions p
where r.name = 'Super Admin'
  and r.deleted_at is null
  and p.key in (
    'AUTH_USERS',
    'TEAM_ROLES'
  )
  and p.deleted_at is null
on conflict (role_id, permission_id) where deleted_at is null do update
set actions = excluded.actions;

insert into public.users (
  id,
  email_address,
  first_name,
  last_name,
  role_id,
  password,
  status
)
select
  '00000000-0000-4000-8000-000000000201',
  'admin@tristanahumada.com',
  'Super',
  'Admin',
  r.id,
  '$2b$12$tshjwGr5Vw1m4.WabIQhgO6eXVe2jyNpapaBzDfuLwZ8Lq9tgx6cW',
  'ACTIVE'
from public.roles r
where r.name = 'Super Admin'
  and r.deleted_at is null
on conflict (email_address) where deleted_at is null do update
set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  role_id = excluded.role_id,
  password = excluded.password,
  status = excluded.status;
