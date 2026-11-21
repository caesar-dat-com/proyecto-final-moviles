// Datos de ejemplo para el modo local (sin Supabase).
// Al re-tematizar la app, edita este archivo y supabase/seed.sql.

export const SEED_USUARIOS = [
  // Cuentas de DEMOSTRACIÓN solo para el modo local; no existen en ningún backend.
  { id: 'local-admin', email: 'admin@demo.local', password: 'admin123', nombre: 'Administrador Demo', rol: 'admin' },
  { id: 'local-tecnico', email: 'tecnico@demo.local', password: 'demo123', nombre: 'Laura Técnica', rol: 'user' },
];

export const SEED_PLACES = [
  { id: 1, nombre: 'Plomería Express', descripcion: 'Arreglo de fugas, griferías y destapes.', categoria: 'Plomería', precio: 60000, lat: 3.3612, lng: -76.5301 },
  { id: 2, nombre: 'Electricistas 24h', descripcion: 'Instalaciones, cortos y tableros.', categoria: 'Electricidad', precio: 70000, lat: 3.3721, lng: -76.5395 },
  { id: 3, nombre: 'Aseo Brillante', descripcion: 'Limpieza profunda de casas y apartamentos.', categoria: 'Aseo', precio: 85000, lat: 3.3488, lng: -76.5172 },
  { id: 4, nombre: 'Cerrajería La Llave', descripcion: 'Apertura de puertas y cambio de guardas.', categoria: 'Cerrajería', precio: 50000, lat: 3.3905, lng: -76.5431 },
  { id: 5, nombre: 'Jardines del Valle', descripcion: 'Poda, siembra y mantenimiento de jardines.', categoria: 'Jardinería', precio: 65000, lat: 3.3402, lng: -76.5288 },
  { id: 6, nombre: 'Gas y Calentadores', descripcion: 'Revisión e instalación de calentadores.', categoria: 'Plomería', precio: 90000, lat: 3.4012, lng: -76.5205 },
];

export const SEED_MESSAGES = [
  { id: 1, room: 'general', user_id: 'local-admin', autor: 'Administrador Demo', texto: '¡Bienvenidos a la comunidad! Pregunten lo que necesiten.' },
];
