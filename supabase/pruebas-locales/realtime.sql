-- ============================================================
-- Prueba de Realtime — SOLO LOCAL. Requiere el servidor con wal_level=logical y
-- local-shim.sql + schema.sql + seed.sql (+ rls.sql para tener usuarios).
--
-- Supabase Realtime (postgres_changes) lee el WAL con replicación lógica filtrada por la
-- publicación `supabase_realtime`. Aquí se hace lo mismo con un slot TEMPORAL `pgoutput`
-- (se borra solo al cerrar la sesión) y se decodifica qué tabla generó cada cambio.
-- ============================================================
\pset footer on
reset role;
select 'slot creado' as paso, slot_name
  from pg_create_logical_replication_slot('prueba_realtime', 'pgoutput', true);

-- Cambios en tablas publicadas (messages, requests, places) y NO publicadas (profiles, auth.users)
insert into public.messages (room, user_id, autor, texto)
  select 'general', id, 'x', 'hola realtime' from public.profiles where email = 'ana@demo.local';
update public.requests set estado = 'asignado' where detalle = 'Poste apagado (de ana)';
update public.places set precio = precio where id = (select min(id) from public.places);
update public.profiles set nombre = nombre where email = 'ana@demo.local';  -- NO publicada

\echo '== Cambios que Realtime recibiría desde la publicación supabase_realtime:'
with c as (
  select data, chr(get_byte(data, 0)) as tipo
  from pg_logical_slot_peek_binary_changes('prueba_realtime', null, null,
         'proto_version', '1', 'publication_names', 'supabase_realtime')
)
select case tipo when 'I' then 'INSERT' when 'U' then 'UPDATE' when 'D' then 'DELETE' end as evento,
       ((get_byte(data,1)::bigint << 24) | (get_byte(data,2) << 16) | (get_byte(data,3) << 8) | get_byte(data,4))::oid::regclass as tabla
from c where tipo in ('I', 'U', 'D');

\echo '== Tablas en la publicación (y qué operaciones publica):'
select p.pubname, t.schemaname, t.tablename, p.pubinsert, p.pubupdate, p.pubdelete
from pg_publication p join pg_publication_tables t using (pubname)
where p.pubname = 'supabase_realtime' order by t.tablename;

select pg_drop_replication_slot('prueba_realtime');
