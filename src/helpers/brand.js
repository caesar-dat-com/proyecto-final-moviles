// ============================================================
// brand.js — ÚNICO archivo a editar para re-tematizar la app.
// Nombre, eslogan, colores, textos y nombres de las entidades.
// Las tablas de la base de datos tienen nombres neutros
// (profiles, places, requests, messages): aquí solo cambia
// cómo se muestran al usuario.
//   profiles → ciudadano (rol user) / funcionario (rol admin)
//   places   → dependencia responsable de un tipo de incidencia
//   requests → reporte urbano (foto + GPS + categoría + estado)
//   messages → chat de cada reporte y sala «Comunidad»
// ============================================================

export const BRAND = {
  nombre: 'ReportaCali',
  eslogan: 'Reporta lo que ves, arregla tu barrio',
  descripcion:
    'Reporta huecos, alumbrado dañado, basuras y más con foto y ubicación. Sigue el estado y conversa con tus vecinos y el funcionario responsable.',

  // Colores principales (se aplican a las variables de Ionic en tiempo de ejecución)
  colores: {
    primary: '#2b5bd7',
    secondary: '#14b8a6',
    tertiary: '#f59e0b',
  },

  // Centro del mapa por defecto (centro de Cali) y zoom inicial
  mapa: {
    centro: [3.4516, -76.532],
    zoom: 13,
  },

  // Nombres visibles de las entidades (tablas neutras)
  entidades: {
    place: { singular: 'Dependencia', plural: 'Dependencias', icono: 'business' },
    request: { singular: 'Reporte', plural: 'Reportes', icono: 'megaphone' },
    message: { singular: 'Mensaje', plural: 'Mensajes', icono: 'chatbubbles' },
    profile: { singular: 'Perfil', plural: 'Perfiles', icono: 'person' },
  },

  // Nombres visibles de los roles de la tabla profiles
  roles: {
    user: 'Ciudadano',
    admin: 'Funcionario',
  },

  // Categorías de incidencia (filtran dependencias y clasifican reportes)
  categorias: ['Huecos y vías', 'Alumbrado', 'Basuras', 'Acueducto', 'Semáforos', 'Inseguridad'],

  // Icono (emoji) y color de cada categoría para los marcadores del mapa
  iconosCategoria: {
    'Huecos y vías': { emoji: '🕳️', color: '#8b5e34' },
    Alumbrado: { emoji: '💡', color: '#f59e0b' },
    Basuras: { emoji: '🗑️', color: '#16a34a' },
    Acueducto: { emoji: '💧', color: '#0284c7' },
    Semáforos: { emoji: '🚦', color: '#dc2626' },
    Inseguridad: { emoji: '🚨', color: '#7c3aed' },
  },

  // Estados de un reporte, en orden de avance.
  // `fueraDeFlujo`: no forma parte del avance normal (cierra el reporte sin resolverlo).
  estados: [
    { valor: 'nuevo', texto: 'Nuevo', color: 'warning' },
    { valor: 'en_revision', texto: 'En revisión', color: 'primary' },
    { valor: 'asignado', texto: 'Asignado', color: 'tertiary' },
    { valor: 'resuelto', texto: 'Resuelto', color: 'success' },
    { valor: 'descartado', texto: 'Descartado', color: 'medium', fueraDeFlujo: true },
  ],

  // Cómo se muestra el campo numérico `precio` de places.
  // formato 'dias'   → «3 días hábiles» (tiempo de respuesta estimado)
  // formato 'moneda' → valor en dinero con `moneda` y `locale`
  valor: {
    etiqueta: 'Respuesta estimada',
    formato: 'dias',
    sufijo: ' días hábiles',
    sufijoSingular: ' día hábil',
  },

  // Salas de chat fijas (además de una sala por cada reporte)
  salaGeneral: { id: 'general', titulo: 'Comunidad' },

  moneda: 'COP',
  locale: 'es-CO',
};

export default BRAND;
