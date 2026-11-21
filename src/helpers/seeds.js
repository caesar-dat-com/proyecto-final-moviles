// Datos de ejemplo para el modo local (sin Supabase).
// Al re-tematizar la app, edita este archivo y supabase/seed.sql.
// Las dependencias usan nombres de entidades reales de Cali, pero las coordenadas son
// APROXIMADAS y los tiempos de respuesta son ilustrativos: ReportaCali no es un canal oficial.

export const SEED_USUARIOS = [
  // Cuentas de DEMOSTRACIÓN solo para el modo local; no existen en ningún backend.
  { id: 'local-ciudadano', email: 'ciudadano@demo.local', password: 'demo123', nombre: 'Laura Ciudadana', rol: 'user' },
  { id: 'local-funcionario', email: 'funcionario@demo.local', password: 'admin123', nombre: 'Andrés Funcionario', rol: 'admin' },
];

// places = dependencias responsables; `precio` = días hábiles de respuesta estimada
export const SEED_PLACES = [
  { id: 1, nombre: 'Secretaría de Infraestructura — Huecos y vías', descripcion: 'Mantenimiento de la malla vial: huecos, andenes y reductores dañados.', categoria: 'Huecos y vías', precio: 10, lat: 3.4527, lng: -76.5335 },
  { id: 2, nombre: 'UAESPM — Alumbrado público', descripcion: 'Luminarias apagadas, intermitentes o postes dañados.', categoria: 'Alumbrado', precio: 5, lat: 3.4458, lng: -76.5262 },
  { id: 3, nombre: 'UAESPM — Aseo y recolección', descripcion: 'Basuras acumuladas, puntos críticos y escombros en vía pública.', categoria: 'Basuras', precio: 3, lat: 3.4402, lng: -76.5198 },
  { id: 4, nombre: 'EMCALI — Acueducto y alcantarillado', descripcion: 'Fugas de agua, tapas de alcantarilla faltantes y daños de acueducto.', categoria: 'Acueducto', precio: 1, lat: 3.4519, lng: -76.5318 },
  { id: 5, nombre: 'Secretaría de Movilidad — Semaforización', descripcion: 'Semáforos apagados, intermitentes o mal sincronizados.', categoria: 'Semáforos', precio: 2, lat: 3.4648, lng: -76.5163 },
  { id: 6, nombre: 'Secretaría de Seguridad y Justicia — Convivencia', descripcion: 'Zonas inseguras, falta de iluminación en parques y riñas recurrentes.', categoria: 'Inseguridad', precio: 4, lat: 3.4487, lng: -76.5371 },
];

// Reportes de ejemplo para que el mapa no arranque vacío (solo modo local)
export const SEED_REQUESTS = [
  {
    id: 101, user_id: 'local-ciudadano', cliente_nombre: 'Laura Ciudadana', place_id: 1,
    place_nombre: 'Secretaría de Infraestructura — Huecos y vías', categoria: 'Huecos y vías',
    detalle: 'Hueco profundo en el carril derecho, ya se han caído dos motos.', estado: 'en_revision',
    lat: 3.4311, lng: -76.5432, foto_url: null,
  },
  {
    id: 102, user_id: 'local-ciudadano', cliente_nombre: 'Laura Ciudadana', place_id: 2,
    place_nombre: 'UAESPM — Alumbrado público', categoria: 'Alumbrado',
    detalle: 'Tres postes seguidos sin luz en la cuadra del parque.', estado: 'nuevo',
    lat: 3.4483, lng: -76.5398, foto_url: null,
  },
];

export const SEED_MESSAGES = [
  { id: 1, room: 'general', user_id: 'local-funcionario', autor: 'Andrés Funcionario', texto: '¡Bienvenidos a ReportaCali! Aquí pueden conversar sobre su barrio.' },
  { id: 2, room: 'request-101', user_id: 'local-funcionario', autor: 'Andrés Funcionario', texto: 'Recibido. Una cuadrilla lo revisa esta semana.' },
];
