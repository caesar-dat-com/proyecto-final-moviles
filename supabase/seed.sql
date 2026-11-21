-- Datos de ejemplo (equivalentes a src/helpers/seeds.js).
-- Ejecutar después de schema.sql. Al re-tematizar la app, edita este archivo.
insert into public.places (nombre, descripcion, categoria, precio, lat, lng) values
  ('Plomería Express',   'Arreglo de fugas, griferías y destapes.',        'Plomería',     60000, 3.3612, -76.5301),
  ('Electricistas 24h',  'Instalaciones, cortos y tableros.',              'Electricidad', 70000, 3.3721, -76.5395),
  ('Aseo Brillante',     'Limpieza profunda de casas y apartamentos.',     'Aseo',         85000, 3.3488, -76.5172),
  ('Cerrajería La Llave','Apertura de puertas y cambio de guardas.',       'Cerrajería',   50000, 3.3905, -76.5431),
  ('Jardines del Valle', 'Poda, siembra y mantenimiento de jardines.',     'Jardinería',   65000, 3.3402, -76.5288),
  ('Gas y Calentadores', 'Revisión e instalación de calentadores.',        'Plomería',     90000, 3.4012, -76.5205);
