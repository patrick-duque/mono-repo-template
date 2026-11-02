create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_search_vector()
returns trigger
language plpgsql
as $$
declare
  search_column text;
  search_value text;
  search_parts text[] := array[]::text[];
begin
  foreach search_column in array tg_argv loop
    search_value := to_jsonb(new)->>search_column;

    if search_value is not null and length(trim(search_value)) > 0 then
      search_parts := array_append(search_parts, search_value);
    end if;
  end loop;

  new.search_vector = to_tsvector('simple', array_to_string(search_parts, ' '));
  return new;
end;
$$;

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  search_vector tsvector not null default ''::tsvector,
  name varchar not null,
  description varchar
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  search_vector tsvector not null default ''::tsvector,
  module varchar not null,
  name varchar not null,
  key varchar not null,
  description varchar,
  constraint permissions_module_valid check (
    module in ('AUTH', 'TEAM')
  )
);

create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  role_id uuid not null references public.roles(id),
  permission_id uuid not null references public.permissions(id),
  actions varchar[] not null default array['READ']::varchar[],
  constraint role_permissions_actions_not_empty check (cardinality(actions) >= 1),
  constraint role_permissions_actions_no_nulls check (array_position(actions, null) is null),
  constraint role_permissions_actions_valid check (
    actions <@ array['READ', 'CREATE', 'UPDATE', 'DELETE']::varchar[]
  )
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  search_vector tsvector not null default ''::tsvector,
  email_address citext not null,
  first_name varchar not null,
  last_name varchar not null,
  role_id uuid not null references public.roles(id),
  password varchar not null,
  status varchar not null default 'PENDING',
  invited_by uuid references public.users(id),
  avatar_url varchar,
  last_login_at timestamptz,
  constraint users_status_valid check (status in ('PENDING', 'ACTIVE', 'INACTIVE'))
);

create table public.user_tokens (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  user_id uuid not null references public.users(id),
  token_type varchar not null,
  token_hash varchar not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  constraint user_tokens_type_valid check (token_type in ('REFRESH_TOKEN'))
);

create unique index roles_name_active_idx on public.roles (name) where deleted_at is null;
create unique index permissions_key_active_idx on public.permissions (key) where deleted_at is null;
create unique index role_permissions_role_permission_active_idx
  on public.role_permissions (role_id, permission_id)
  where deleted_at is null;

create unique index users_email_address_active_idx on public.users (email_address)
  where deleted_at is null;
create index users_role_id_idx on public.users (role_id);
create unique index user_tokens_hash_active_idx on public.user_tokens (token_hash)
  where deleted_at is null and revoked_at is null;
create index user_tokens_user_active_idx on public.user_tokens (user_id, token_type)
  where deleted_at is null and revoked_at is null;
create index roles_search_vector_idx on public.roles using gin (search_vector);
create index permissions_search_vector_idx on public.permissions using gin (search_vector);
create index users_search_vector_idx on public.users using gin (search_vector);

create or replace function public.create_role_permission_rows_for_role()
returns trigger
language plpgsql
as $$
begin
  if new.deleted_at is not null then
    return new;
  end if;

  insert into public.role_permissions (role_id, permission_id, actions)
  select new.id, p.id, array['READ']::varchar[]
  from public.permissions p
  where p.deleted_at is null
  on conflict (role_id, permission_id) where deleted_at is null do nothing;

  return new;
end;
$$;

create or replace function public.create_role_permission_rows_for_permission()
returns trigger
language plpgsql
as $$
begin
  if new.deleted_at is not null then
    return new;
  end if;

  insert into public.role_permissions (role_id, permission_id, actions)
  select r.id, new.id, array['READ']::varchar[]
  from public.roles r
  where r.deleted_at is null
  on conflict (role_id, permission_id) where deleted_at is null do nothing;

  return new;
end;
$$;

create trigger roles_updated_at before update on public.roles
for each row execute function public.set_updated_at();
create trigger roles_search_vector before insert or update on public.roles
for each row execute function public.set_search_vector('name', 'description');
create trigger roles_permission_matrix after insert on public.roles
for each row execute function public.create_role_permission_rows_for_role();

create trigger permissions_updated_at before update on public.permissions
for each row execute function public.set_updated_at();
create trigger permissions_search_vector before insert or update on public.permissions
for each row execute function public.set_search_vector('module', 'name', 'key', 'description');
create trigger permissions_role_matrix after insert on public.permissions
for each row execute function public.create_role_permission_rows_for_permission();

create trigger role_permissions_updated_at before update on public.role_permissions
for each row execute function public.set_updated_at();

create trigger users_updated_at before update on public.users
for each row execute function public.set_updated_at();
create trigger users_search_vector before insert or update on public.users
for each row execute function public.set_search_vector('email_address', 'first_name', 'last_name');

create trigger user_tokens_updated_at before update on public.user_tokens
for each row execute function public.set_updated_at();

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.users enable row level security;
