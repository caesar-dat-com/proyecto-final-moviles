-- ============================================================
-- Pruebas RLS — SOLO LOCAL (requiere local-shim.sql + schema.sql + seed.sql).
-- Ejecutar con: psql -X -f rls.sql   (sin ON_ERROR_STOP: los ERROR esperados se ven en la salida)
-- Usuarios de prueba:
--   ana  1111…  ciudadana     beto 2222…  ciudadano     func 3333…  funcionario (admin)
-- ============================================================
\set ana  '''11111111-1111-1111-1111-111111111111'''
\set beto '''22222222-2222-2222-2222-222222222222'''
\set func '''33333333-3333-3333-3333-333333333333'''
\pset footer on

-- ---------- datos de prueba (como postgres, sin RLS) ----------
reset role;
delete from public.messages; delete from public.requests;
delete from public.profiles where id in (:ana, :beto, :func);
delete from auth.users where id in (:ana, :beto, :func);
insert into auth.users (id, email, raw_user_meta_data) values
  (:ana,  'ana@demo.local',  '{"nombre":"Ana Ciudadana"}'),
  (:beto, 'beto@demo.local', '{"nombre":"Beto Ciudadano"}'),
  (:func, 'funcionario@demo.local', '{"nombre":"Andrés Funcionario"}');
update public.profiles set rol = 'admin' where email = 'funcionario@demo.local';
\echo '== perfiles creados por el trigger crear_perfil:'
select nombre, email, rol from public.profiles order by email;

insert into public.requests (user_id, cliente_nombre, categoria, detalle) values
  (:ana,  'Ana Ciudadana',  'Alumbrado',     'Poste apagado (de ana)'),
  (:beto, 'Beto Ciudadano', 'Huecos y vías', 'Hueco en la 5ta (de beto)');
insert into public.messages (room, user_id, autor, texto)
  select 'request-' || id, user_id, cliente_nombre, 'mensaje en el reporte de ' || cliente_nombre
  from public.requests;
insert into public.messages (room, user_id, autor, texto) values ('general', :func, 'Andrés Funcionario', 'Bienvenidos');
select id as beto_req from public.requests where user_id = :beto \gset

-- ============================================================
\echo
\echo '######## T1 SELECT requests como ana'
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', false) is not null as sesion_ana;
select auth.uid() as uid_ana;
select id, cliente_nombre, detalle, estado from public.requests order by id;

\echo '######## T2a INSERT request a nombre propio (ana)'
insert into public.requests (user_id, cliente_nombre, categoria, detalle)
  values (:ana, 'Ana Ciudadana', 'Basuras', 'Basura acumulada (ana, insert propio)')
  returning id, user_id = auth.uid() as es_mio, estado;
\echo '######## T2b INSERT request sin user_id (default auth.uid())'
insert into public.requests (cliente_nombre, categoria, detalle)
  values ('Ana Ciudadana', 'Basuras', 'Sin user_id explícito')
  returning id, user_id = auth.uid() as es_mio;
\echo '######## T2c INSERT request a nombre de beto (debe fallar)'
insert into public.requests (user_id, cliente_nombre, categoria, detalle)
  values (:beto, 'Beto Ciudadano', 'Basuras', 'Suplantación');
\echo '######## T2d INSERT request propio pero ya en estado resuelto (debe fallar)'
insert into public.requests (user_id, cliente_nombre, categoria, detalle, estado)
  values (:ana, 'Ana Ciudadana', 'Basuras', 'Salta el flujo', 'resuelto');

\echo '######## T3a ana avanza el estado de SU reporte nuevo -> en_revision (debe fallar)'
update public.requests set estado = 'en_revision' where detalle = 'Poste apagado (de ana)' returning id, estado;
\echo '######## T3b ana cambia el estado del reporte de beto (debe afectar 0 filas)'
update public.requests set estado = 'resuelto' where detalle like '%(de beto)' returning id, estado;
\echo '######## T3c ana se reasigna a sí misma el reporte de beto (debe afectar 0 filas)'
update public.requests set user_id = auth.uid() where detalle like '%(de beto)' returning id;
\echo '######## T3d ana retira (descartado) SU reporte nuevo (permitido por diseño: botón «Retirar»)'
update public.requests set estado = 'descartado' where detalle = 'Sin user_id explícito' returning id, estado;
\echo '######## T3e ana reabre su reporte descartado -> nuevo (debe afectar 0 filas)'
update public.requests set estado = 'nuevo' where detalle = 'Sin user_id explícito' returning id, estado;
\echo '######## T3f ana se sube a admin en profiles (debe fallar)'
update public.profiles set rol = 'admin' where id = auth.uid() returning id, rol;
\echo '######## T3g ana cambia su nombre en profiles (permitido)'
update public.profiles set nombre = 'Ana C.' where id = auth.uid() returning nombre, rol;
\echo '######## T3h ana crea una dependencia (places) (debe fallar)'
insert into public.places (nombre, lat, lng) values ('Falsa', 3.4, -76.5);

\echo '######## T4a mensajes que ve ana por sala'
select room, autor, texto from public.messages order by room, id;
\echo '######## T4b ana escribe en la sala de SU reporte'
insert into public.messages (room, user_id, autor, texto)
  select 'request-' || id, auth.uid(), 'Ana C.', 'ana en su reporte' from public.requests where detalle = 'Poste apagado (de ana)'
  returning room, texto;
\echo '######## T4c ana escribe en la sala del reporte de beto'
insert into public.messages (room, user_id, autor, texto)
  select 'request-' || id, auth.uid(), 'Ana C.', 'ana en reporte ajeno' from public.requests where detalle like '%(de beto)'
  returning room, texto;
\echo '######## T4h ana escribe directo en la sala request-<id de beto> (público: pasa; estricto: debe fallar)'
insert into public.messages (room, user_id, autor, texto) values ('request-' || :beto_req, auth.uid(), 'Ana C.', 'directo a sala ajena')
  returning room, texto;
\echo '######## T4d ana escribe suplantando a beto (debe fallar)'
insert into public.messages (room, user_id, autor, texto) values ('general', :beto, 'Beto', 'suplantado');
\echo '######## T4e ana escribe en una sala inexistente (debe fallar)'
insert into public.messages (room, user_id, autor, texto) values ('request-999999', auth.uid(), 'Ana C.', 'sala fantasma');

\echo '######## T4g ana firma un mensaje como el funcionario (autor debe quedar «Ana C.»)'
insert into public.messages (room, user_id, autor, texto) values ('general', auth.uid(), 'Andrés Funcionario', 'firma falsa')
  returning autor, texto;

\echo '######## T6 Storage: ana sube a su carpeta / a la de beto'
insert into storage.objects (bucket_id, name) values ('avatars', '11111111-1111-1111-1111-111111111111/avatar.jpg') returning name;
insert into storage.objects (bucket_id, name) values ('avatars', '22222222-2222-2222-2222-222222222222/avatar.jpg') returning name;

-- ============================================================
\echo '######## T3i funcionario (admin) avanza el estado del reporte de ana'
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', false) is not null as sesion_func;
select public.es_admin() as func_es_admin;
update public.requests set estado = 'en_revision' where detalle = 'Poste apagado (de ana)' returning id, estado;
update public.requests set estado = 'resuelto' where detalle like '%(de beto)' returning id, estado;
\echo '######## T4i funcionario: mensajes visibles por sala'
select room, count(*) from public.messages group by room order by room;
\echo '######## T3j funcionario crea una dependencia'
insert into public.places (nombre, categoria, lat, lng) values ('Dependencia de prueba', 'Basuras', 3.4, -76.5) returning nombre;

-- ============================================================
\echo '######## T1b SELECT requests como beto'
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', false) is not null as sesion_beto;
select cliente_nombre, detalle, estado from public.requests order by id;
\echo '######## T4f mensajes que ve beto'
select room, autor, texto from public.messages order by room, id;

-- ============================================================
\echo '######## T5 anónimo (rol anon, sin JWT)'
reset role;
select set_config('request.jwt.claims', '', false) is not null as sin_jwt;
set role anon;
select auth.uid() as uid_anon;
select 'profiles' as tabla, count(*) from public.profiles
union all select 'places',   count(*) from public.places
union all select 'requests', count(*) from public.requests
union all select 'messages', count(*) from public.messages;
\echo '######## T5b anónimo intenta insertar'
insert into public.requests (user_id, detalle) values (:ana, 'anónimo');
insert into public.messages (room, user_id, autor, texto) values ('general', :ana, 'x', 'anónimo');

reset role;
\echo '######## T7 borrar un usuario de auth.users (como hace el panel de Supabase)'
delete from auth.users where id = :beto;
select count(*) as perfiles_beto from public.profiles where id = :beto;
