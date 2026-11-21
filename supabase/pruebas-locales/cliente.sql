-- ============================================================
-- Contrato cliente ↔ schema — SOLO LOCAL (después de rls.sql).
-- Reproduce con las MISMAS claves que envía la app cada insert/update de supabase-js,
-- con RETURNING (equivale a `.select().single()`), bajo RLS.
-- ============================================================
\pset footer on
reset role;
select id as ana  from public.profiles where email = 'ana@demo.local' \gset
select id as func from public.profiles where email = 'funcionario@demo.local' \gset
set role authenticated;

\echo '== ciudadana (ana)'
select set_config('request.jwt.claims', json_build_object('sub', :'ana', 'role', 'authenticated')::text, false) is not null as ok;
\echo '-- useAuth.cargarPerfil: from(profiles).select(*).eq(id)'
select id = auth.uid() as es_ana, nombre, rol from public.profiles where id = :'ana';
\echo '-- Home.crearReporte → useCollection(requests).add({...})'
insert into public.requests (user_id, place_id, place_nombre, cliente_nombre, categoria, detalle, estado, lat, lng, foto_url)
  select :'ana', p.id, p.nombre, 'Ana C.', p.categoria, 'Desde el cliente', 'nuevo', 3.45, -76.53, null
  from public.places p where p.categoria = 'Alumbrado' limit 1
  returning id, place_nombre, categoria, estado;
\echo '-- Home: useCollection(requests, filtros [[user_id,==,perfil.id]], orden created_at desc)'
select count(*) as mis_reportes from public.requests where user_id = :'ana';
\echo '-- Orders (ciudadano) «Retirar»: update({estado:descartado}).eq(id)'
update public.requests set estado = 'descartado' where detalle = 'Desde el cliente' returning id, estado;
\echo '-- Profile: actualizarPerfil({nombre}) y ({avatar_url})'
update public.profiles set nombre = 'Ana C.' where id = :'ana' returning nombre;
update public.profiles set avatar_url = 'https://x/storage/v1/object/public/avatars/a.jpg' where id = :'ana' returning avatar_url is not null as avatar;
\echo '-- useRealtimeChat.enviar: insert({room, user_id, autor, texto}) en general'
insert into public.messages (room, user_id, autor, texto) values ('general', :'ana', 'Ana C.', 'hola') returning room, autor;
\echo '-- useRealtimeChat carga: select(*).eq(room).order(created_at asc).limit(200)'
select count(*) as msgs_general from (select * from public.messages where room = 'general' order by created_at limit 200) s;

\echo '== funcionario'
select set_config('request.jwt.claims', json_build_object('sub', :'func', 'role', 'authenticated')::text, false) is not null as ok;
\echo '-- Admin.guardar nuevo: places.add({nombre, descripcion, categoria, precio, lat, lng})'
insert into public.places (nombre, descripcion, categoria, precio, lat, lng)
  values ('Nueva dependencia', 'desc', 'Basuras', 3, 3.44, -76.52) returning id, nombre;
\echo '-- Admin.guardar edición: places.update(id, {...fila sin id/created_at})'
update public.places set nombre = 'Nueva dependencia (ed.)', descripcion = 'd', categoria = 'Basuras', precio = 4,
  lat = 3.44, lng = -76.52, imagen_url = null where nombre = 'Nueva dependencia' returning nombre, precio;
\echo '-- Admin: places.remove(id)'
delete from public.places where nombre = 'Nueva dependencia (ed.)' returning nombre;
\echo '-- Orders (admin) avanzar: update({estado: siguiente})'
update public.requests set estado = 'en_revision' where id = (select max(id) from public.requests where estado = 'nuevo') returning estado;
reset role;
