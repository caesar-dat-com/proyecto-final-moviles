-- ============================================================
-- local-shim.sql — SOLO PARA PRUEBAS LOCALES. NO EJECUTAR EN SUPABASE.
--
-- Emula lo mínimo que Supabase trae de fábrica y que schema.sql da por hecho,
-- para poder correr schema.sql + seed.sql en un PostgreSQL 16 "puro":
--   * roles anon / authenticated / service_role
--   * esquema auth: tabla auth.users (columnas que usa el trigger crear_perfil),
--     auth.uid(), auth.role(), auth.jwt() leyendo la variable de sesión
--     `request.jwt.claims` (la misma que PostgREST fija en Supabase real)
--   * esquema storage: storage.buckets, storage.objects, storage.foldername()
--   * publicación vacía supabase_realtime
--   * privilegios por defecto de Supabase sobre public (la seguridad real la da RLS)
--
-- Orden: local-shim.sql → schema.sql → seed.sql
-- Simular un usuario dentro de psql:
--   set role authenticated;
--   select set_config('request.jwt.claims', '{"sub":"<uuid>","role":"authenticated"}', false);
--   ...
--   reset role;
-- Anónimo: set role anon;  (sin claims → auth.uid() = null)
-- Ver app/supabase/README.md («Pruebas locales»).
-- ============================================================

-- ---------- roles ----------
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end $$;

-- ---------- esquema auth ----------
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Igual que en Supabase: el sub del JWT, leído de la configuración de la sesión
create or replace function auth.jwt()
returns jsonb language sql stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
$$;

create or replace function auth.uid()
returns uuid language sql stable
as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid;
$$;

create or replace function auth.role()
returns text language sql stable
as $$
  select coalesce(auth.jwt() ->> 'role', current_user::text);
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid(), auth.role(), auth.jwt() to anon, authenticated, service_role;

-- ---------- esquema storage (mínimo para las políticas del bucket) ----------
create schema if not exists storage;

create table if not exists storage.buckets (
  id text primary key,
  name text not null unique,
  public boolean default false,
  created_at timestamptz default now()
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid default auth.uid(),
  created_at timestamptz default now(),
  unique (bucket_id, name)
);
alter table storage.objects enable row level security;

-- Igual que Supabase: carpetas de la ruta (todo menos el nombre del archivo)
create or replace function storage.foldername(name text)
returns text[] language plpgsql immutable
as $$
declare
  _parts text[];
begin
  select string_to_array(name, '/') into _parts;
  return _parts[1 : array_length(_parts, 1) - 1];
end
$$;

grant usage on schema storage to anon, authenticated, service_role;
grant all on all tables in schema storage to anon, authenticated, service_role;
grant execute on function storage.foldername(text) to anon, authenticated, service_role;

-- ---------- privilegios por defecto (como un proyecto Supabase nuevo) ----------
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- ---------- Realtime ----------
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;
