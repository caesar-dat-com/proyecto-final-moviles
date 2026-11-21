-- ============================================================
-- Esquema de base de datos para Supabase (Clase 09)
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- Tablas con nombres neutros para poder re-tematizar la app:
--   profiles (usuarios), places (puntos en el mapa),
--   requests (solicitudes/pedidos), messages (chat)
-- ============================================================

-- ---------- profiles: un perfil por usuario de auth.users ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  nombre text not null,
  email text,
  rol text not null default 'user' check (rol in ('user', 'admin')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Función auxiliar para saber si quien consulta es admin
-- (security definer evita recursión de RLS al leer profiles)
create or replace function public.es_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and rol = 'admin');
$$;

-- Rol actual de quien consulta (security definer: se usa dentro de políticas de profiles
-- sin provocar "infinite recursion detected in policy")
create or replace function public.mi_rol()
returns text
language sql stable security definer set search_path = public
as $
  select rol from public.profiles where id = auth.uid();
$;

-- Crea el perfil automáticamente al registrarse
create or replace function public.crear_perfil()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', new.email), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists al_registrar_usuario on auth.users;
create trigger al_registrar_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ---------- places: puntos que se muestran en el mapa ----------
create table if not exists public.places (
  id bigint generated always as identity primary key,
  nombre text not null,
  descripcion text,
  categoria text,
  precio numeric default 0,
  lat double precision not null,
  lng double precision not null,
  imagen_url text,
  created_at timestamptz default now()
);

-- ---------- requests: transacción principal (solicitud / pedido) ----------
create table if not exists public.requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users default auth.uid(),
  place_id bigint references public.places on delete set null,
  place_nombre text,
  cliente_nombre text,
  detalle text not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aceptada', 'en_camino', 'completada', 'cancelada')),
  lat double precision,
  lng double precision,
  foto_url text,
  created_at timestamptz default now()
);

-- ---------- messages: chat en tiempo real por sala ----------
-- room = 'general' o 'request-<id>'
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  room text not null default 'general',
  user_id uuid not null references auth.users default auth.uid(),
  autor text not null,
  texto text not null check (char_length(texto) between 1 and 2000),
  created_at timestamptz default now()
);
create index if not exists messages_room_idx on public.messages (room, created_at);

-- ============================================================
-- RLS (la seguridad real viene de aquí, no de ocultar la llave pública)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.places   enable row level security;
alter table public.requests enable row level security;
alter table public.messages enable row level security;

-- profiles
create policy "ver perfiles" on public.profiles
  for select to authenticated using (true);
create policy "crear mi perfil" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id and rol = 'user');
-- Un usuario edita su perfil pero no puede cambiarse el rol (with check compara con el valor guardado)
create policy "editar mi perfil" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id and rol = public.mi_rol());

-- places: todos los autenticados leen; solo admin escribe
create policy "ver places" on public.places
  for select to authenticated using (true);
create policy "admin crea places" on public.places
  for insert to authenticated with check (public.es_admin());
create policy "admin edita places" on public.places
  for update to authenticated using (public.es_admin());
create policy "admin borra places" on public.places
  for delete to authenticated using (public.es_admin());

-- requests: cada usuario ve/gestiona las suyas; el admin ve y edita todas
create policy "ver mis requests" on public.requests
  for select to authenticated using ((select auth.uid()) = user_id or public.es_admin());
create policy "crear mis requests" on public.requests
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "editar mis requests" on public.requests
  for update to authenticated using ((select auth.uid()) = user_id or public.es_admin());

-- messages: sala general abierta a autenticados; sala de una request
-- solo para su dueño y el admin
create policy "leer mensajes" on public.messages
  for select to authenticated using (
    room = 'general'
    or public.es_admin()
    or exists (
      select 1 from public.requests r
      where 'request-' || r.id = room and r.user_id = (select auth.uid())
    )
  );
create policy "enviar mensajes" on public.messages
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and (
      room = 'general'
      or public.es_admin()
      or exists (
        select 1 from public.requests r
        where 'request-' || r.id = room and r.user_id = (select auth.uid())
      )
    )
  );

-- ============================================================
-- Realtime: publicar los cambios de estas tablas
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.requests;
alter publication supabase_realtime add table public.places;

-- ============================================================
-- Storage: bucket público "avatars" (fotos de perfil y de solicitudes)
-- Ruta de cada archivo: <uid>/<nombre>.jpg
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "subir a mi carpeta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "reemplazar mis archivos" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "eliminar mis archivos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ============================================================
-- Para volver admin a un usuario (después de que se registre):
--   update public.profiles set rol = 'admin' where email = 'correo@ejemplo.com';
-- ============================================================
