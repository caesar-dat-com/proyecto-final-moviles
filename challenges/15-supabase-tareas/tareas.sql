-- Challenge 15 — tabla «tareas» con RLS + realtime + bucket «avatars».
-- Tomado de la Clase 09 (diapositivas 7, 8, 10, 12 y 13). Pegar en Supabase → SQL Editor.
-- Si ya corriste supabase/schema.sql del proyecto, el bucket y sus políticas ya existen:
-- la sección de storage usa "if not exists" / "on conflict" para no fallar.

create table if not exists public.tareas (
  id bigint generated always as identity primary key,
  titulo text not null,
  completada boolean default false,
  user_id uuid references auth.users default auth.uid(),
  created_at timestamptz default now()
);

alter table public.tareas enable row level security;

drop policy if exists "ver mis tareas" on public.tareas;
drop policy if exists "crear mis tareas" on public.tareas;
drop policy if exists "editar mis tareas" on public.tareas;
drop policy if exists "borrar mis tareas" on public.tareas;

create policy "ver mis tareas" on public.tareas
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "crear mis tareas" on public.tareas
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "editar mis tareas" on public.tareas
  for update to authenticated using ((select auth.uid()) = user_id);
create policy "borrar mis tareas" on public.tareas
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Realtime (diapositiva 10). Falla si la tabla ya está en la publicación: en ese caso ignóralo.
alter publication supabase_realtime add table public.tareas;

-- Storage: bucket público «avatars» (diapositivas 12-13)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'subir a mi carpeta') then
    create policy "subir a mi carpeta" on storage.objects for insert to authenticated
      with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'reemplazar mis archivos') then
    create policy "reemplazar mis archivos" on storage.objects for update to authenticated
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'eliminar mis archivos') then
    create policy "eliminar mis archivos" on storage.objects for delete to authenticated
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
  end if;
end $$;
