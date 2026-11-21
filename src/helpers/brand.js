// ============================================================
// brand.js — ÚNICO archivo a editar para re-tematizar la app.
// Nombre, eslogan, colores, textos y nombres de las entidades.
// Las tablas de la base de datos tienen nombres neutros
// (profiles, places, requests, messages): aquí solo cambia
// cómo se muestran al usuario.
// ============================================================

export const BRAND = {
  nombre: 'ServiCasa',
  eslogan: 'Servicios a domicilio, cerca de ti',
  descripcion:
    'Encuentra servicios para tu hogar, solicítalos en segundos y conversa en tiempo real con quien te atiende.',

  // Colores principales (se aplican a las variables de Ionic en tiempo de ejecución)
  colores: {
    primary: '#2b5bd7',
    secondary: '#14b8a6',
    tertiary: '#f59e0b',
  },

  // Centro del mapa por defecto (UAO, Cali) y zoom inicial
  mapa: {
    centro: [3.3536, -76.5226],
    zoom: 13,
  },

  // Nombres visibles de las entidades (tablas neutras)
  entidades: {
    place: { singular: 'Servicio', plural: 'Servicios', icono: 'construct' },
    request: { singular: 'Solicitud', plural: 'Solicitudes', icono: 'receipt' },
    message: { singular: 'Mensaje', plural: 'Mensajes', icono: 'chatbubbles' },
    profile: { singular: 'Perfil', plural: 'Perfiles', icono: 'person' },
  },

  // Categorías de los places (filtros del catálogo)
  categorias: ['Plomería', 'Electricidad', 'Aseo', 'Cerrajería', 'Jardinería'],

  // Estados de una request, en orden de avance
  estados: [
    { valor: 'pendiente', texto: 'Pendiente', color: 'warning' },
    { valor: 'aceptada', texto: 'Aceptada', color: 'primary' },
    { valor: 'en_camino', texto: 'En camino', color: 'tertiary' },
    { valor: 'completada', texto: 'Completada', color: 'success' },
    { valor: 'cancelada', texto: 'Cancelada', color: 'medium' },
  ],

  // Salas de chat fijas (además de una sala por cada request)
  salaGeneral: { id: 'general', titulo: 'Comunidad' },

  moneda: 'COP',
  locale: 'es-CO',
};

export default BRAND;
