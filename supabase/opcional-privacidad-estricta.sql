-- ============================================================
-- OPCIONAL — privacidad estricta de reportes y chats.  Ejecutar DESPUÉS de schema.sql
-- solo si se decide que un ciudadano NO debe ver los reportes ni los chats de otros.
--
-- Por defecto (schema.sql) los reportes son públicos para los vecinos autenticados, como
-- promete el README de la app: salen en el mapa de todos y cada reporte tiene un chat
-- «de vecinos + funcionario». Con este archivo:
--   * requests: cada ciudadano ve solo los suyos; el funcionario (admin) ve todos.
--   * messages: la sala 'general' sigue abierta; la sala 'request-<id>' solo la ven y
--     escriben el dueño del reporte y el funcionario.
-- Efecto en la app: el Mapa y la pestaña «Activos» de un ciudadano mostrarán solo sus
-- propios reportes; abrir el chat de un reporte ajeno queda vacío y enviar falla por RLS.
-- Re-ejecutable. Para volver al modo público, re-ejecuta schema.sql.
-- ============================================================

-- ¿Quien consulta participa en la sala? (security definer: no depende de la RLS de requests)
create or replace function public.participa_en_sala(p_room text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select p_room = 'general'
      or public.es_admin()
      or exists (
        select 1 from public.requests r
        where 'request-' || r.id = p_room and r.user_id = auth.uid()
      );
$$;

drop policy if exists "ver reportes" on public.requests;
create policy "ver reportes" on public.requests
  for select to authenticated
  using ((select auth.uid()) = user_id or public.es_admin());

drop policy if exists "leer mensajes" on public.messages;
create policy "leer mensajes" on public.messages
  for select to authenticated
  using (public.participa_en_sala(room));

drop policy if exists "enviar mensajes" on public.messages;
create policy "enviar mensajes" on public.messages
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and public.participa_en_sala(room)
  );
