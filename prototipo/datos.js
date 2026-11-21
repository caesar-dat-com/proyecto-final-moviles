// ============================================================
// datos.js — datos SIMULADOS del prototipo navegable de ReportaCali.
// Escritos a mano a partir de app/src/helpers/brand.js y
// app/src/helpers/seeds.js. No hay llamadas de red: todo vive aquí.
// ============================================================

window.DATOS = {
  // ---- Identidad (copiado de brand.js) ----
  marca: {
    nombre: 'ReportaCali',
    eslogan: 'Reporta lo que ves, arregla tu barrio',
    descripcion:
      'Reporta huecos, alumbrado dañado, basuras y más con foto y ubicación. Sigue el estado y conversa con tus vecinos y el funcionario responsable.',
    colores: { primary: '#2b5bd7', secondary: '#14b8a6', tertiary: '#f59e0b' },
  },

  // ---- Presentación del prototipo ----
  proyecto: {
    autor: 'César Armando Reyes',
    materia: 'Desarrollo de Software para Plataformas Móviles — UAO 2026-2',
  },

  // Los 6 tipos de incidencia (brand.js → categorias + iconosCategoria)
  categorias: [
    { nombre: 'Huecos y vías', emoji: '🕳️', color: '#8b5e34' },
    { nombre: 'Alumbrado', emoji: '💡', color: '#f59e0b' },
    { nombre: 'Basuras', emoji: '🗑️', color: '#16a34a' },
    { nombre: 'Acueducto', emoji: '💧', color: '#0284c7' },
    { nombre: 'Semáforos', emoji: '🚦', color: '#dc2626' },
    { nombre: 'Inseguridad', emoji: '🚨', color: '#7c3aed' },
  ],

  // Estados en orden de avance (brand.js → estados)
  estados: [
    { valor: 'nuevo', texto: 'Nuevo', color: 'warning' },
    { valor: 'en_revision', texto: 'En revisión', color: 'primary' },
    { valor: 'asignado', texto: 'Asignado', color: 'tertiary' },
    { valor: 'resuelto', texto: 'Resuelto', color: 'success' },
    { valor: 'descartado', texto: 'Descartado', color: 'medium', fueraDeFlujo: true },
  ],

  // Cuentas de demostración (seeds.js) + la cuenta creada en el registro
  usuarios: {
    ciudadano: { id: 'cesar', nombre: 'César Reyes', email: 'cesar@demo.local', rol: 'user', iniciales: 'CR' },
    funcionario: { id: 'local-funcionario', nombre: 'Andrés Funcionario', email: 'funcionario@demo.local', rol: 'admin', iniciales: 'AF' },
  },

  // Ubicación simulada del usuario (barrio San Antonio, Cali)
  posicion: { lat: 3.447, lng: -76.541, precision: 20 },

  // Dependencias responsables (seeds.js → SEED_PLACES). `dias` = respuesta estimada;
  // `km` = distancia ya calculada desde la posición simulada.
  dependencias: [
    { id: 6, nombre: 'Secretaría de Seguridad y Justicia — Convivencia', descripcion: 'Zonas inseguras, falta de iluminación en parques y riñas recurrentes.', categoria: 'Inseguridad', dias: 4, km: 0.5, lat: 3.4487, lng: -76.5371 },
    { id: 1, nombre: 'Secretaría de Infraestructura — Huecos y vías', descripcion: 'Mantenimiento de la malla vial: huecos, andenes y reductores dañados.', categoria: 'Huecos y vías', dias: 10, km: 1.0, lat: 3.4527, lng: -76.5335 },
    { id: 4, nombre: 'EMCALI — Acueducto y alcantarillado', descripcion: 'Fugas de agua, tapas de alcantarilla faltantes y daños de acueducto.', categoria: 'Acueducto', dias: 1, km: 1.2, lat: 3.4519, lng: -76.5318 },
    { id: 2, nombre: 'UAESPM — Alumbrado público', descripcion: 'Luminarias apagadas, intermitentes o postes dañados.', categoria: 'Alumbrado', dias: 5, km: 1.6, lat: 3.4458, lng: -76.5262 },
    { id: 3, nombre: 'UAESPM — Aseo y recolección', descripcion: 'Basuras acumuladas, puntos críticos y escombros en vía pública.', categoria: 'Basuras', dias: 3, km: 2.5, lat: 3.4402, lng: -76.5198 },
    { id: 5, nombre: 'Secretaría de Movilidad — Semaforización', descripcion: 'Semáforos apagados, intermitentes o mal sincronizados.', categoria: 'Semáforos', dias: 2, km: 3.4, lat: 3.4648, lng: -76.5163 },
  ],

  // Reportes (requests). `foto`: nombre de la ilustración SVG (ver app.js → FOTOS).
  reportes: [
    {
      id: 1755, autorId: 'cesar', autor: 'César Reyes', dependenciaId: 2, categoria: 'Alumbrado',
      detalle: 'Poste sin luz frente al parque, la cuadra queda a oscuras', estado: 'nuevo',
      direccion: 'Carrera 10 #1-150este, San Antonio, Cali ciudad', fecha: '21 de nov, 03:21 p. m.',
      lat: 3.447, lng: -76.541, km: 0.0, foto: 'alumbrado',
    },
    {
      id: 101, autorId: 'local-ciudadano', autor: 'Laura Ciudadana', dependenciaId: 1, categoria: 'Huecos y vías',
      detalle: 'Hueco profundo en el carril derecho, ya se han caído dos motos.', estado: 'en_revision',
      direccion: 'Avenida Calle 5, Nuevo San Fernando, Cali ciudad', fecha: '21 de nov, 02:21 p. m.',
      lat: 3.4311, lng: -76.5432, km: 1.8, foto: null,
    },
    {
      id: 102, autorId: 'local-ciudadano', autor: 'Laura Ciudadana', dependenciaId: 2, categoria: 'Alumbrado',
      detalle: 'Tres postes seguidos sin luz en la cuadra del parque.', estado: 'nuevo',
      direccion: 'Calle 2, San Antonio, Cali ciudad', fecha: '21 de nov, 01:21 p. m.',
      lat: 3.4483, lng: -76.5398, km: 0.2, foto: null,
    },
    {
      id: 87, autorId: 'local-ciudadano', autor: 'Laura Ciudadana', dependenciaId: 3, categoria: 'Basuras',
      detalle: 'Punto crítico de escombros en la esquina, ya fue recogido.', estado: 'resuelto',
      direccion: 'Carrera 4, El Peñón, Cali ciudad', fecha: '18 de nov, 09:05 a. m.',
      lat: 3.4520, lng: -76.5420, km: 0.6, foto: null,
    },
  ],

  // Mensajes por sala: 'general' = Comunidad; 'request-<id>' = chat de cada reporte
  mensajes: {
    general: [
      { autorId: 'local-funcionario', autor: 'Andrés Funcionario', texto: '¡Bienvenidos a ReportaCali! Aquí pueden conversar sobre su barrio.', hora: '03:21 p. m.' },
      { autorId: 'cesar', autor: 'César Reyes', texto: '¡Hola, vecinos del barrio!', hora: '03:21 p. m.' },
    ],
    'request-1755': [
      { autorId: 'cesar', autor: 'César Reyes', texto: 'Vecinos: el poste lleva tres noches apagado', hora: '03:21 p. m.' },
    ],
    'request-101': [
      { autorId: 'local-funcionario', autor: 'Andrés Funcionario', texto: 'Recibido. Una cuadrilla lo revisa esta semana.', hora: '02:40 p. m.' },
    ],
  },
};
