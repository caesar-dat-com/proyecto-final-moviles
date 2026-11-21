-- Datos de ejemplo de ReportaCali (equivalentes a src/helpers/seeds.js).
-- Ejecutar después de schema.sql. Al re-tematizar la app, edita este archivo.
-- places = dependencias responsables; `precio` = días hábiles de respuesta estimada.
-- Nombres de entidades reales de Cali; coordenadas APROXIMADAS y tiempos ilustrativos.
insert into public.places (nombre, descripcion, categoria, precio, lat, lng) values
  ('Secretaría de Infraestructura — Huecos y vías',    'Mantenimiento de la malla vial: huecos, andenes y reductores dañados.', 'Huecos y vías', 10, 3.4527, -76.5335),
  ('UAESPM — Alumbrado público',                       'Luminarias apagadas, intermitentes o postes dañados.',                   'Alumbrado',      5, 3.4458, -76.5262),
  ('UAESPM — Aseo y recolección',                      'Basuras acumuladas, puntos críticos y escombros en vía pública.',       'Basuras',        3, 3.4402, -76.5198),
  ('EMCALI — Acueducto y alcantarillado',              'Fugas de agua, tapas de alcantarilla faltantes y daños de acueducto.',  'Acueducto',      1, 3.4519, -76.5318),
  ('Secretaría de Movilidad — Semaforización',         'Semáforos apagados, intermitentes o mal sincronizados.',                'Semáforos',      2, 3.4648, -76.5163),
  ('Secretaría de Seguridad y Justicia — Convivencia', 'Zonas inseguras, falta de iluminación en parques y riñas recurrentes.', 'Inseguridad',    4, 3.4487, -76.5371);

-- Cuentas de demostración: Supabase Auth no permite crearlas desde este archivo.
-- 1. Regístralas desde la app: ciudadano@demo.local / demo123 y funcionario@demo.local / admin123
--    (o en Authentication → Users → Add user).
-- 2. Vuelve funcionario la segunda:
--    update public.profiles set rol = 'admin' where email = 'funcionario@demo.local';
