// ============================================================
// app.js — prototipo navegable de ReportaCali (HTML + CSS + JS vanilla).
// Sin dependencias, sin red, sin build. Funciona con file:// y por HTTP.
// Rutas por hash: #/login, #/inicio, … y #/tablero (vista «todas las pantallas»).
// ============================================================
(function () {
  'use strict';
  const D = window.DATOS;
  const I = window.ICONOS;
  const clonar = (o) => JSON.parse(JSON.stringify(o));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // ---------- Utilidades de dominio (equivalentes a app/src/helpers/utils.js) ----------
  const cat = (n) => D.categorias.find((c) => c.nombre === n) || { nombre: n, emoji: '📌', color: '#64748b' };
  const estadoInfo = (v) => D.estados.find((e) => e.valor === v) || D.estados[0];
  const CERRADOS = D.estados.filter((e) => e.valor === 'resuelto' || e.fueraDeFlujo).map((e) => e.valor);
  const FLUJO = D.estados.filter((e) => !e.fueraDeFlujo);
  const siguienteEstado = (v) => {
    const i = FLUJO.findIndex((e) => e.valor === v);
    return i >= 0 && i < FLUJO.length - 1 ? FLUJO[i + 1].valor : null;
  };
  const dias = (n) => (Number(n) === 1 ? '1 día hábil' : `${n} días hábiles`);
  const horaAhora = () => {
    const d = new Date();
    const h = d.getHours();
    const h12 = String(h % 12 || 12).padStart(2, '0');
    return `${h12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
  };
  const DIRECCION_GPS = 'Carrera 10 #1-150este, San Antonio, Cali ciudad';

  // Reporte que crea César en el recorrido (igual al de las capturas reales)
  const REPORTE_DEMO = {
    id: 1755, autorId: 'cesar', autor: 'César Reyes', dependenciaId: 2, categoria: 'Alumbrado',
    detalle: 'Poste sin luz frente al parque, la cuadra queda a oscuras', estado: 'nuevo',
    direccion: DIRECCION_GPS, fecha: '21 de nov, 03:21 p. m.', lat: 3.447, lng: -76.541, km: 0.0, foto: 'alumbrado',
  };

  // ---------- Estado del prototipo ----------
  const estadoInicial = () => ({
    rol: 'user',
    dependencias: clonar(D.dependencias),
    reportes: clonar(D.reportes).filter((r) => r.id !== 1755),
    mensajes: clonar(D.mensajes),
    filtro: 'todas',
    vista: 'activos',
    sala: 'general',
    reporteSel: 1755,
    seguir: false,
    borrador: borradorVacio(),
    flags: {},
  });
  function borradorVacio(categoria = null) {
    return { categoria, detalle: '', ubicacion: false, foto: false };
  }
  function borradorLleno() {
    return { categoria: 'Alumbrado', detalle: REPORTE_DEMO.detalle, ubicacion: true, foto: true };
  }
  let st = estadoInicial();

  const usuario = (s = st) => (s.rol === 'admin' ? D.usuarios.funcionario : D.usuarios.ciudadano);
  const asegurarReporteDemo = (s) => {
    if (!s.reportes.some((r) => r.id === 1755)) s.reportes.unshift(clonar(REPORTE_DEMO));
    return s.reportes.find((r) => r.id === 1755);
  };
  const asegurarRespuestaFuncionario = (s) => {
    const sala = (s.mensajes['request-1755'] ||= []);
    if (!sala.length) sala.push(clonar(D.mensajes['request-1755'][0]));
    if (!sala.some((m) => m.autorId === 'local-funcionario'))
      sala.push({ autorId: 'local-funcionario', autor: 'Andrés Funcionario', texto: 'Recibido: cuadrilla de alumbrado programada para mañana', hora: '03:22 p. m.' });
  };

  // ---------- Catálogo de pantallas (orden = recorrido) ----------
  // vista: función que pinta; preset: deja el estado como en la captura real equivalente.
  const P = [
    { id: 'login', n: '01', nombre: 'Iniciar sesión', grupo: 'acceso', vista: 'login', app: '01-login.png', archivo: 'src/pages/Login/Index.jsx',
      nota: 'Entrada a la app. Con «funcionario@demo.local» se entra al panel del funcionario.',
      preset: (s) => { s.rol = 'user'; } },
    { id: 'registro', n: '02', nombre: 'Registro', grupo: 'acceso', vista: 'registro', app: '02-registro.png', archivo: 'src/pages/Register/Index.jsx',
      nota: 'Crea una cuenta de ciudadano (nombre, correo, contraseña y confirmación).',
      preset: (s) => { s.rol = 'user'; } },
    { id: 'inicio', n: '03', nombre: 'Inicio · dependencias', grupo: 'ciudadano', vista: 'inicio', app: '03-inicio.png', archivo: 'src/pages/Home/Index.jsx',
      nota: 'Saludo, botón «Reportar un problema» y lista de dependencias responsables con búsqueda y filtro por categoría.',
      preset: (s) => { s.rol = 'user'; } },
    { id: 'nuevo', n: '04', nombre: 'Crear reporte', grupo: 'ciudadano', vista: 'nuevo', app: '04-modal-reporte.png', archivo: 'src/components/RequestModal/RequestModal.jsx',
      nota: 'Formulario modal: categoría, descripción, ubicación GPS y foto. Muestra qué dependencia lo atiende.',
      preset: (s) => { s.rol = 'user'; s.borrador = borradorLleno(); } },
    { id: 'tipos', n: '05', nombre: 'Crear reporte · 6 tipos', grupo: 'ciudadano', vista: 'nuevo', app: '04-modal-reporte.png (selector)', archivo: 'src/components/RequestModal/RequestModal.jsx',
      nota: 'Selector de categoría (action sheet) con los 6 tipos de incidencia.',
      preset: (s) => { s.rol = 'user'; s.borrador = borradorLleno(); s.flags = { selector: true }; } },
    { id: 'enviado', n: '06', nombre: 'Reporte enviado', grupo: 'ciudadano', vista: 'inicio', app: '05-reporte-creado.png', archivo: 'src/pages/Home/Index.jsx',
      nota: 'Al enviar, vuelve al inicio con la confirmación «Reporte enviado».',
      preset: (s) => { s.rol = 'user'; asegurarReporteDemo(s); s.flags = { toast: 'Reporte enviado. Síguelo en la pestaña Reportes.' }; } },
    { id: 'reportes', n: '07', nombre: 'Mis reportes', grupo: 'ciudadano', vista: 'reportes', app: '06-reportes.png', archivo: 'src/pages/Orders/Index.jsx',
      nota: 'Reportes del barrio en pestañas Activos / Míos / Cerrados. El dueño puede retirar un reporte nuevo.',
      preset: (s) => { s.rol = 'user'; asegurarReporteDemo(s).estado = 'nuevo'; s.vista = 'activos'; } },
    { id: 'detalle', n: '08', nombre: 'Detalle del reporte', grupo: 'ciudadano', vista: 'detalle', app: '06-reportes.png (tarjeta) y 09-mapa.png (popup)', archivo: 'src/components/CardItem + MapView',
      nota: 'Detalle de un reporte: foto, estado, dirección, dependencia y seguimiento. En la app esta información está en la tarjeta y en el popup del mapa.',
      preset: (s) => { s.rol = 'user'; asegurarReporteDemo(s); s.reporteSel = 1755; } },
    { id: 'chat-reporte', n: '09', nombre: 'Chat del reporte', grupo: 'ciudadano', vista: 'chat', app: '07-chat-reporte.png', archivo: 'src/pages/Chat/Index.jsx',
      nota: 'Sala de chat en tiempo real propia de cada reporte (vecinos + funcionario).',
      preset: (s) => { s.rol = 'user'; asegurarReporteDemo(s); s.sala = 'request-1755'; } },
    { id: 'comunidad', n: '10', nombre: 'Chat · Comunidad', grupo: 'ciudadano', vista: 'chat', app: '08-chat-comunidad.png', archivo: 'src/pages/Chat/Index.jsx',
      nota: 'Sala general «Comunidad» de la pestaña Chat.',
      preset: (s) => { s.sala = 'general'; } },
    { id: 'mapa', n: '11', nombre: 'Mapa de reportes', grupo: 'ciudadano', vista: 'mapa', app: '09-mapa.png', archivo: 'src/pages/Map/Index.jsx',
      nota: 'Mapa con reportes (pines por categoría) y dependencias (🏛️). Toca un pin para ver su popup.',
      preset: (s) => { s.rol = 'user'; asegurarReporteDemo(s); s.flags = { popup: 1755 }; } },
    { id: 'perfil', n: '12', nombre: 'Mi perfil', grupo: 'ciudadano', vista: 'perfil', app: '10-perfil.png', archivo: 'src/pages/Profile/Index.jsx',
      nota: 'Datos del usuario, foto, estado del dispositivo (red, GPS, backend) y cierre de sesión.',
      preset: (s) => { s.rol = 'user'; } },
    { id: 'menu', n: '13', nombre: 'Menú lateral', grupo: 'ciudadano', vista: 'perfil', app: '11-menu.png', archivo: 'src/components/shared/Menu.jsx',
      nota: 'Menú lateral (☰) con el usuario, accesos y cerrar sesión.',
      preset: (s) => { s.rol = 'user'; s.flags = { menu: true }; } },
    { id: 'f-panel', n: '14', nombre: 'Panel del funcionario', grupo: 'funcionario', vista: 'panel', app: '12-funcionario-panel.png', archivo: 'src/pages/Admin/Index.jsx',
      nota: 'Métricas (nuevos, en proceso, resueltos, dependencias) y CRUD de dependencias.',
      preset: (s) => { s.rol = 'admin'; asegurarReporteDemo(s).estado = 'nuevo'; } },
    { id: 'f-dependencia', n: '15', nombre: 'Nueva dependencia', grupo: 'funcionario', vista: 'dependencia', app: '15-funcionario-nueva-dependencia.png', archivo: 'src/pages/Admin/Index.jsx',
      nota: 'Formulario para crear o editar una dependencia responsable.',
      preset: (s) => { s.rol = 'admin'; } },
    { id: 'f-bandeja', n: '16', nombre: 'Bandeja de reportes', grupo: 'funcionario', vista: 'reportes', app: '13-funcionario-reportes.png', archivo: 'src/pages/Orders/Index.jsx',
      nota: 'Bandeja del funcionario: avanza el estado con un toque o descarta el reporte.',
      preset: (s) => { s.rol = 'admin'; asegurarReporteDemo(s).estado = 'en_revision'; s.vista = 'activos'; } },
    { id: 'f-estado', n: '17', nombre: 'Cambio de estado', grupo: 'funcionario', vista: 'reportes', app: '13-funcionario-reportes.png (tras tocar el botón)', archivo: 'src/pages/Orders/Index.jsx',
      nota: 'Tras tocar «Asignado»: el reporte avanza (Nuevo → En revisión → Asignado → Resuelto) y el ciudadano lo ve en tiempo real.',
      preset: (s) => { s.rol = 'admin'; asegurarReporteDemo(s).estado = 'asignado'; s.vista = 'activos'; s.flags = { toast: 'Estado: Asignado' }; } },
    { id: 'f-chat', n: '18', nombre: 'Chat del funcionario', grupo: 'funcionario', vista: 'chat', app: '14-funcionario-chat.png', archivo: 'src/pages/Chat/Index.jsx',
      nota: 'El funcionario responde en la sala del reporte.',
      preset: (s) => { s.rol = 'admin'; asegurarReporteDemo(s); asegurarRespuestaFuncionario(s); s.sala = 'request-1755'; } },
    { id: 'f-mapa', n: '19', nombre: 'Mapa general', grupo: 'funcionario', vista: 'mapa', app: '16-funcionario-mapa.png', archivo: 'src/pages/Map/Index.jsx',
      nota: 'Mapa general de todos los reportes activos y las dependencias.',
      preset: (s) => { s.rol = 'admin'; const r = asegurarReporteDemo(s); if (r.estado === 'nuevo') r.estado = 'en_revision'; } },
  ];
  const pantalla = (id) => P.find((p) => p.id === id);

  // Rutas de las pestañas según el rol
  const TABS = {
    user: [['inicio', 'inicio', 'Inicio'], ['mapa', 'mapa', 'Mapa'], ['reportes', 'megafono', 'Reportes'], ['comunidad', 'chat', 'Chat'], ['perfil', 'persona', 'Perfil']],
    admin: [['f-panel', 'panel', 'Panel'], ['f-mapa', 'mapa', 'Mapa'], ['f-bandeja', 'megafono', 'Reportes'], ['comunidad', 'chat', 'Chat'], ['perfil', 'persona', 'Perfil']],
  };
  const TAB_DE = { inicio: 0, enviado: 0, mapa: 1, reportes: 2, detalle: 2, 'chat-reporte': 3, comunidad: 3, perfil: 4, menu: 4,
    'f-panel': 0, 'f-mapa': 1, 'f-bandeja': 2, 'f-estado': 2, 'f-chat': 3 };
  const rutaReportes = (s) => (s.rol === 'admin' ? 'f-bandeja' : 'reportes');
  const rutaChatReporte = (s) => (s.rol === 'admin' ? 'f-chat' : 'chat-reporte');
  const rutaInicio = (s) => (s.rol === 'admin' ? 'f-panel' : 'inicio');

  // ---------- Piezas comunes ----------
  function header(titulo, { izq = 'menu', der = 'nube' } = {}) {
    let a = '';
    if (izq === 'menu') a = `<button class="a-hbtn" data-acc="menu" aria-label="Menú">${I.menu}</button>`;
    else if (izq && izq.startsWith('atras:')) a = `<button class="a-hbtn" data-ir="${izq.slice(6)}" aria-label="Atrás">${I.atras}</button>`;
    let b = '';
    if (der === 'nube') b = `<span class="a-hbtn a-nube" title="Conectado">${I.nube}</span>`;
    else if (der && der.startsWith('cerrar:')) b = `<button class="a-htexto" data-ir="${der.slice(7)}">Cerrar</button>`;
    return `<header class="a-header"><div class="a-hizq">${a}</div><h1 class="a-titulo">${esc(titulo)}</h1><div class="a-hder">${b}</div></header>`;
  }
  function tabs(s, rutaActual) {
    const activo = TAB_DE[rutaActual];
    return `<nav class="a-tabs">${TABS[s.rol]
      .map(([ruta, ico, txt], i) => `<button class="a-tab${i === activo ? ' activo' : ''}" data-ir="${ruta}">${I[ico]}<span>${txt}</span></button>`)
      .join('')}</nav>`;
  }
  const toast = (s) => (s.flags.toast ? `<div class="a-toast" role="status">${esc(s.flags.toast)}</div>` : '');
  const badge = (v) => {
    const e = estadoInfo(v);
    return `<span class="a-badge c-${e.color}">${esc(e.texto)}</span>`;
  };
  const avatar = (u, clase = '') => `<div class="a-avatar ${clase}">${esc(u.iniciales)}</div>`;

  // Ilustraciones de «fotos» (SVG) — reemplazan las fotos de cámara de la app
  const FOTOS = {
    alumbrado: () => `<svg class="a-foto" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Foto: poste sin luz">
      <defs><linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1e3c"/><stop offset="1" stop-color="#2a2f55"/></linearGradient></defs>
      <rect width="360" height="200" fill="url(#cielo)"/>
      <polygon points="92,58 60,162 126,162" fill="#f7d774" opacity=".42"/>
      ${[66, 187, 308].map((x, i) => `<rect x="${x}" y="36" width="5" height="126" fill="#5b5c66"/><rect x="${x}" y="34" width="28" height="5" fill="#5b5c66"/><ellipse cx="${x + 27}" cy="44" rx="${i ? 8 : 8}" ry="6" fill="${i ? '#3c3d44' : '#fde68a'}"/>`).join('')}
      <rect y="162" width="360" height="7" fill="#8f8f92"/><rect y="169" width="360" height="31" fill="#47474d"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${9 + i * 54}" y="187" width="28" height="4" fill="#e4c43b"/>`).join('')}
    </svg>`,
    'huecos y vías': () => `<svg class="a-foto" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Foto: hueco en la vía">
      <rect width="360" height="200" fill="#9ccbe8"/><rect y="70" width="360" height="130" fill="#55565c"/>
      <rect y="64" width="360" height="8" fill="#a8a8ab"/>
      <ellipse cx="190" cy="140" rx="70" ry="24" fill="#2a2a2e"/><ellipse cx="190" cy="134" rx="62" ry="17" fill="#1a1a1d"/>
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${i * 80}" y="176" width="44" height="5" fill="#f2f2f2"/>`).join('')}
      <rect x="20" y="30" width="60" height="34" fill="#c9a77c"/><rect x="250" y="20" width="80" height="44" fill="#d8c3a5"/>
    </svg>`,
    generica: (c) => `<svg class="a-foto" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Foto del problema">
      <rect width="360" height="200" fill="${c.color}" opacity=".85"/><text x="180" y="122" font-size="76" text-anchor="middle">${c.emoji}</text>
    </svg>`,
  };
  const foto = (r) => {
    const clave = (r.foto || r.categoria || '').toLowerCase();
    if (clave === 'alumbrado') return FOTOS.alumbrado();
    if (clave === 'huecos y vías') return FOTOS['huecos y vías']();
    return FOTOS.generica(cat(r.categoria));
  };

  // ---------- Vistas ----------
  const V = {};

  V.login = () => `
    <div class="a-cuerpo"><div class="a-scroll a-fondo-login">
      <div class="a-hero"><div class="a-logo">R</div><h1>${esc(D.marca.nombre)}</h1><p>${esc(D.marca.eslogan)}</p></div>
      <div class="a-form">
        <div class="a-lista a-sombra">
          <label class="a-item a-stacked"><span class="a-label">Correo</span><input data-campo="email" type="email" placeholder="tu@correo.com" autocomplete="off"></label>
          <label class="a-item a-stacked"><span class="a-label">Contraseña</span><input data-campo="clave" type="password" placeholder="••••••"></label>
        </div>
        <button class="a-btn a-bloque a-alto" data-acc="login">Iniciar sesión</button>
        <p class="a-enlace">¿No tienes cuenta? <a href="#/registro" data-ir="registro">Regístrate</a></p>
        <small class="a-aviso">Modo local sin backend (no hay llaves de Supabase). Cuentas de demostración:
          <button class="a-link-gris" data-acc="demo" data-v="ciudadano@demo.local">ciudadano@demo.local / demo123</button> ·
          <button class="a-link-gris" data-acc="demo" data-v="funcionario@demo.local">funcionario@demo.local / admin123</button></small>
      </div>
    </div></div>`;

  V.registro = () => `
    <div class="a-cuerpo"><div class="a-scroll a-fondo-registro">
      <div class="a-hero a-hero-registro"><h1>Crea tu cuenta</h1><p>Únete a ${esc(D.marca.nombre)}</p></div>
      <div class="a-form">
        <div class="a-lista a-sombra">
          <label class="a-item a-stacked"><span class="a-label">Nombre</span><input value="César Reyes"></label>
          <label class="a-item a-stacked"><span class="a-label">Correo</span><input type="email" value="cesar@demo.local"></label>
          <label class="a-item a-stacked"><span class="a-label">Contraseña</span><input type="password" value="clave123"></label>
          <label class="a-item a-stacked"><span class="a-label">Confirmar contraseña</span><input type="password" value="clave123"></label>
        </div>
        <button class="a-btn a-bloque a-alto" data-acc="registrar">Registrarme</button>
        <p class="a-enlace">¿Ya tienes cuenta? <a href="#/login" data-ir="login">Inicia sesión</a></p>
      </div>
    </div></div>`;

  function tarjetaDependencia(d, admin) {
    const c = cat(d.categoria);
    const sub = admin ? esc(d.categoria) : `${c.emoji} ${esc(d.categoria)} · a ${d.km.toFixed(1)} km`;
    const texto = `${d.nombre} ${d.descripcion} ${d.categoria}`.toLowerCase();
    const acciones = admin
      ? `<div class="a-acciones"><button class="a-btn a-chico a-outline" data-acc="editar-dep" data-id="${d.id}">${I.editar}Editar</button>
         <button class="a-btn a-chico a-clear c-danger-t" data-acc="eliminar-dep" data-id="${d.id}">${I.borrar}Eliminar</button></div>`
      : '';
    return `<article class="a-card${admin ? '' : ' a-tocable'}" ${admin ? '' : `data-acc="abrir-nuevo" data-cat="${esc(d.categoria)}"`} data-texto="${esc(texto)}">
      <div class="a-card-cab"><div class="a-sub">${sub}</div><h2 class="a-card-tit">${esc(d.nombre)}</h2></div>
      <div class="a-card-cont"><p>${esc(d.descripcion)}</p><p class="a-extra">Respuesta estimada: ${dias(d.dias)}</p>${acciones}</div>
    </article>`;
  }

  V.inicio = (s) => {
    const u = usuario(s);
    const activos = s.reportes.filter((r) => r.autorId === u.id && !CERRADOS.includes(r.estado)).length;
    const deps = s.dependencias.filter((d) => s.filtro === 'todas' || d.categoria === s.filtro).sort((a, b) => a.km - b.km);
    const seg = [['todas', 'Todas'], ...D.categorias.map((c) => [c.nombre, `${c.emoji} ${c.nombre}`])];
    return `${header(D.marca.nombre)}
    <div class="a-toolbar"><label class="a-search">${I.buscar}<input data-buscar placeholder="Buscar dependencias" aria-label="Buscar dependencias"></label></div>
    <div class="a-toolbar a-toolbar-borde"><div class="a-segment a-seg-scroll">${seg
      .map(([v, t]) => `<button class="a-segbtn${s.filtro === v ? ' activo' : ''}" data-acc="filtro" data-v="${esc(v)}">${esc(t)}</button>`)
      .join('')}</div></div>
    <div class="a-cuerpo"><div class="a-scroll">
      <div class="a-saludo"><h2>Hola, ${esc(u.nombre.split(' ')[0])} 👋</h2><p>${esc(D.marca.descripcion)}</p></div>
      <button class="a-btn a-bloque a-alto a-cta" data-acc="abrir-nuevo">${I.megafono}Reportar un problema</button>
      <p class="a-vacio a-activos">Tienes ${activos} ${activos === 1 ? 'reporte activo' : 'reportes activos'}.</p>
      <h3 class="a-seccion">Dependencias responsables</h3>
      ${deps.map((d) => tarjetaDependencia(d, false)).join('') || '<p class="a-vacio">No hay dependencias que coincidan.</p>'}
      <p class="a-vacio a-sin-coincidencias" hidden>No hay dependencias que coincidan.</p>
      <div class="a-espacio-fab"></div>
    </div>
    <button class="a-fab" data-acc="abrir-nuevo" aria-label="Nuevo reporte">${I.mas}</button>
    </div>
    ${tabs(s, s.ruta)}${toast(s)}`;
  };

  V.nuevo = (s) => {
    const b = s.borrador;
    const c = b.categoria ? cat(b.categoria) : null;
    const dep = b.categoria ? s.dependencias.find((d) => d.categoria === b.categoria) : null;
    const selector = s.flags.selector
      ? `<div class="a-backdrop" data-acc="cerrar-selector"></div>
         <div class="a-sheet" role="dialog" aria-label="Categoría">
           <div class="a-sheet-tit">Categoría *</div>
           ${D.categorias.map((k) => `<button class="a-sheet-op${b.categoria === k.nombre ? ' activo' : ''}" data-acc="elegir-cat" data-v="${esc(k.nombre)}"><span class="a-radio"></span>${k.emoji} ${esc(k.nombre)}</button>`).join('')}
           <button class="a-sheet-op a-sheet-cancel" data-acc="cerrar-selector">Cancelar</button>
         </div>`
      : '';
    return `${header('Nuevo reporte', { izq: null, der: `cerrar:${rutaInicio(s)}` })}
    <div class="a-cuerpo"><div class="a-scroll a-padding">
      <div class="a-lista a-inset">
        <button class="a-item a-stacked a-select" data-acc="abrir-selector">
          <span class="a-label">Categoría *</span>
          <span class="a-valor${c ? '' : ' a-placeholder'}">${c ? `${c.emoji} ${esc(c.nombre)}` : '¿Qué tipo de problema es?'}</span>
          <span class="a-select-ico">${I.selector}</span>
        </button>
        <label class="a-item a-stacked"><span class="a-label">Descripción *</span>
          <textarea data-campo="detalle" rows="2" placeholder="Describe el problema y alguna referencia del lugar">${esc(b.detalle)}</textarea></label>
        <button class="a-item a-item-ico" data-acc="ubicacion">${I.ubicar}<span class="a-item-txt">Ubicación del problema *
          <small class="a-nota">${b.ubicacion ? `📍 ${DIRECCION_GPS}` : 'Toca para usar tu GPS'}</small></span></button>
        <button class="a-item a-item-ico" data-acc="foto">${I.camara}<span class="a-item-txt">${b.foto ? 'Cambiar foto' : 'Foto del problema'}
          <small class="a-nota a-nota-clara">Muy recomendada: ayuda al funcionario a priorizar</small></span></button>
      </div>
      ${b.foto ? `<div class="a-foto-modal">${foto({ categoria: b.categoria || 'Alumbrado' })}</div>` : ''}
      ${dep ? `<div class="a-resumen"><small>Lo atiende</small><h2>${esc(dep.nombre)}</h2><p>Respuesta estimada: <strong>${dias(dep.dias)}</strong></p></div>` : ''}
      <button class="a-btn a-bloque a-alto a-mt" data-acc="enviar-reporte">Enviar reporte</button>
    </div></div>${selector}`;
  };

  function tarjetaReporte(r, s) {
    const u = usuario(s);
    const admin = s.rol === 'admin';
    const propio = r.autorId === u.id;
    const c = cat(r.categoria);
    const dep = s.dependencias.find((d) => d.id === r.dependenciaId);
    const sig = siguienteEstado(r.estado);
    const cerrado = CERRADOS.includes(r.estado);
    const puedeDescartar = !cerrado && (admin || (propio && r.estado === 'nuevo'));
    return `<article class="a-card">
      ${r.foto ? `<div class="a-card-img" data-acc="detalle" data-id="${r.id}">${foto(r)}</div>` : ''}
      <div class="a-card-cab a-tocable" data-acc="detalle" data-id="${r.id}">
        <div class="a-sub">${esc(r.fecha)} · ${propio ? 'Tú' : esc(r.autor)}</div>
        <div class="a-cab-fila"><h2 class="a-card-tit">${c.emoji} ${esc(r.categoria)} · #${r.id}</h2>${badge(r.estado)}</div>
      </div>
      <div class="a-card-cont">
        <p class="a-tocable" data-acc="detalle" data-id="${r.id}">${esc(r.detalle)}</p>
        <p class="a-ubic">📍 ${esc(r.direccion)}</p>
        ${dep ? `<small class="a-ubic a-dep">🏛️ ${esc(dep.nombre)}</small>` : ''}
        <div class="a-acciones">
          <button class="a-btn a-chico a-outline" data-acc="chat-reporte" data-id="${r.id}">${I.chatPuntos}Chat</button>
          ${admin && sig ? `<button class="a-btn a-chico" data-acc="avanzar" data-id="${r.id}">${I.avanzar}${esc(estadoInfo(sig).texto)}</button>` : ''}
          ${puedeDescartar ? `<button class="a-btn a-chico a-clear c-medium-t" data-acc="descartar" data-id="${r.id}">${I.cerrarCirculo}${admin ? 'Descartar' : 'Retirar'}</button>` : ''}
        </div>
      </div>
    </article>`;
  }

  V.reportes = (s) => {
    const u = usuario(s);
    const admin = s.rol === 'admin';
    if (admin && s.vista === 'mios') s.vista = 'activos';
    const visibles = s.reportes.filter((r) => {
      if (s.vista === 'mios') return r.autorId === u.id;
      if (s.vista === 'cerrados') return CERRADOS.includes(r.estado);
      return !CERRADOS.includes(r.estado);
    });
    const seg = admin ? [['activos', 'Activos'], ['cerrados', 'Cerrados']] : [['activos', 'Activos'], ['mios', 'Míos'], ['cerrados', 'Cerrados']];
    const vacio = { activos: 'activos', mios: 'tuyos', cerrados: 'cerrados' }[s.vista];
    return `${header('Reportes')}
    <div class="a-toolbar a-toolbar-borde a-centro-h"><div class="a-segment">${seg
      .map(([v, t]) => `<button class="a-segbtn${s.vista === v ? ' activo' : ''}" data-acc="vista" data-v="${v}">${t}</button>`)
      .join('')}</div></div>
    <div class="a-cuerpo"><div class="a-scroll a-pt">
      ${visibles.map((r) => tarjetaReporte(r, s)).join('') || `<p class="a-vacio">No hay reportes ${vacio}.</p>`}
    </div></div>
    ${tabs(s, s.ruta)}${toast(s)}`;
  };

  V.detalle = (s) => {
    const r = s.reportes.find((x) => x.id === s.reporteSel) || asegurarReporteDemo(s);
    const c = cat(r.categoria);
    const dep = s.dependencias.find((d) => d.id === r.dependenciaId);
    const idx = FLUJO.findIndex((e) => e.valor === r.estado);
    const linea = r.estado === 'descartado'
      ? `<li class="hecho"><span></span>Descartado</li>`
      : FLUJO.map((e, i) => `<li class="${i < idx ? 'hecho' : i === idx ? 'actual' : ''}"><span></span>${esc(e.texto)}</li>`).join('');
    return `${header(`Reporte #${r.id}`, { izq: `atras:${rutaReportes(s)}` })}
    <div class="a-cuerpo"><div class="a-scroll">
      <div class="a-detalle-foto">${foto(r)}</div>
      <article class="a-card a-card-detalle">
        <div class="a-card-cab">
          <div class="a-sub">${esc(r.fecha)} · ${r.autorId === usuario(s).id ? 'Tú' : esc(r.autor)}</div>
          <div class="a-cab-fila"><h2 class="a-card-tit">${c.emoji} ${esc(r.categoria)} · #${r.id}</h2>${badge(r.estado)}</div>
        </div>
        <div class="a-card-cont">
          <p>${esc(r.detalle)}</p>
          <p class="a-ubic">📍 ${esc(r.direccion)}</p>
          <p class="a-ubic a-dep">Tú: a ${r.km.toFixed(1)} km · ${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}</p>
        </div>
      </article>
      ${dep ? `<div class="a-resumen"><small>Lo atiende</small><h2>${esc(dep.nombre)}</h2><p>Respuesta estimada: <strong>${dias(dep.dias)}</strong></p></div>` : ''}
      <h3 class="a-seccion">Seguimiento</h3>
      <ol class="a-linea">${linea}</ol>
      <div class="a-form-pad">
        <button class="a-btn a-bloque a-alto" data-acc="chat-reporte" data-id="${r.id}">${I.chatPuntos}Abrir chat del reporte</button>
        <button class="a-btn a-bloque a-alto a-outline a-mt8" data-acc="ver-mapa" data-id="${r.id}">${I.mapa}Ver en el mapa</button>
      </div>
    </div></div>
    ${tabs(s, s.ruta)}`;
  };

  V.chat = (s) => {
    const u = usuario(s);
    const general = s.sala === 'general';
    const id = general ? null : Number(s.sala.split('-')[1]);
    const msgs = s.mensajes[s.sala] || [];
    const titulo = general ? 'Chat · Comunidad' : `Chat · Reporte #${id}`;
    return `${header(titulo, { izq: general ? 'menu' : `atras:${rutaReportes(s)}` })}
    <div class="a-cuerpo a-fondo-chat"><div class="a-scroll a-chat-lista" data-chat>
      ${msgs.length ? msgs.map((m) => {
        const propia = m.autorId === u.id;
        return `<div class="a-fila ${propia ? 'propia' : 'ajena'}"><div class="a-burbuja">${propia ? '' : `<span class="a-autor">${esc(m.autor)}</span>`}<p>${esc(m.texto)}</p><span class="a-hora">${esc(m.hora)}</span></div></div>`;
      }).join('') : '<p class="a-vacio">Aún no hay mensajes. ¡Escribe el primero!</p>'}
    </div></div>
    <div class="a-barra-chat"><input data-campo="mensaje" placeholder="Escribe un mensaje…" aria-label="Mensaje"><button class="a-enviar" data-acc="enviar-msg" aria-label="Enviar">${I.enviar}</button></div>
    ${tabs(s, s.ruta)}`;
  };

  // Mapa ilustrado de Cali (SVG). Proyección lineal simple sobre el centro-occidente de Cali.
  // Calibrada con la captura real 09-mapa.png: tu posición queda en (178, 236) del área del mapa.
  const PX = 5800;
  const proy = (lat, lng) => [178 + (lng + 76.541) * PX, 236 + (3.447 - lat) * PX];
  function mapaSVG(s) {
    const activos = s.reportes.filter((r) => !CERRADOS.includes(r.estado));
    const [ux, uy] = proy(D.posicion.lat, D.posicion.lng);
    const deps = s.dependencias.map((d) => {
      const [x, y] = proy(d.lat, d.lng);
      return `<g class="a-mk-dep" transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><rect x="-13" y="-13" width="26" height="26" rx="7" fill="#fff" stroke="${D.marca.colores.primary}" stroke-width="2.4"/><text y="5" font-size="14" text-anchor="middle">🏛️</text></g>`;
    }).join('');
    const pines = activos.map((r) => {
      const [x, y] = proy(r.lat, r.lng);
      const c = cat(r.categoria);
      return `<g class="a-mk" data-acc="popup" data-id="${r.id}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
        <path d="M0 0 C-6 -9 -16 -14 -16 -27 A16 16 0 1 1 16 -27 C16 -14 6 -9 0 0Z" fill="${c.color}" stroke="#fff" stroke-width="3"/>
        <text y="-21" font-size="14" text-anchor="middle">${c.emoji}</text></g>`;
    }).join('');
    return `<svg class="a-mapa-svg" viewBox="0 0 390 450" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Mapa ilustrativo de Cali">
      <defs>
        <pattern id="calles" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><path d="M0 0H16M0 0V16" stroke="#fff" stroke-width="2.2"/></pattern>
        <clipPath id="urbano"><path d="M112 0 H390 V450 H150 C140 380 104 330 118 260 C126 210 96 150 112 0Z"/></clipPath>
      </defs>
      <rect width="390" height="450" fill="#ece7df"/>
      <path d="M0 0 H120 C100 150 128 210 118 262 C104 330 140 380 150 450 H0Z" fill="#cfe5b8"/>
      <path d="M8 60 C40 40 70 70 84 110 C96 150 70 190 40 200 C14 206 0 170 8 60Z" fill="#b5d79a"/>
      <path d="M10 330 C40 310 70 330 76 370 C80 410 50 430 20 420 C4 410 0 360 10 330Z" fill="#b5d79a"/>
      <rect width="390" height="450" fill="url(#calles)" clip-path="url(#urbano)" opacity=".9"/>
      <path d="M0 236 C40 226 80 214 120 206 C180 194 230 150 270 110 C310 70 350 52 390 40" stroke="#aad3df" stroke-width="7" fill="none"/>
      <path d="M200 450 C240 390 300 350 390 318" stroke="#e8a85c" stroke-width="9" fill="none"/>
      <path d="M200 450 C240 390 300 350 390 318" stroke="#f7c27f" stroke-width="6" fill="none"/>
      <path d="M128 450 C150 380 166 336 196 296 C240 246 320 214 390 196" stroke="#e8a85c" stroke-width="8" fill="none"/>
      <path d="M128 450 C150 380 166 336 196 296 C240 246 320 214 390 196" stroke="#f7c27f" stroke-width="5" fill="none"/>
      <path d="M262 0 C266 120 270 240 262 450" stroke="#e8d27a" stroke-width="6" fill="none"/>
      <path d="M262 0 C266 120 270 240 262 450" stroke="#fbe9a0" stroke-width="4" fill="none"/>
      <path d="M140 150 C200 170 280 180 390 190" stroke="#fbe9a0" stroke-width="4" fill="none"/>
      <path d="M200 40 C210 160 214 260 196 450" stroke="#fbe9a0" stroke-width="4" fill="none"/>
      <path d="M118 380 C200 360 300 360 390 340" stroke="#fbe9a0" stroke-width="4" fill="none"/>
      <g class="a-mapa-txt">
        <text x="36" y="52">Cerro de las</text><text x="36" y="64">Tres Cruces</text><text x="36" y="76">1470 m</text>
        <text x="16" y="360">Cerro Los</text><text x="16" y="372">Cristales</text>
        <text x="140" y="262">San Antonio</text><text x="300" y="150">Centro</text><text x="170" y="178">El Peñón</text>
        <text x="190" y="360">San Fernando</text><text x="300" y="352" transform="rotate(-22 300 352)">Autopista Sur</text>
        <text x="40" y="248" class="rio" transform="rotate(-8 40 248)">Río Cali</text><text x="232" y="262" transform="rotate(-24 232 262)">Calle 5</text>
      </g>
      ${deps}
      <circle cx="${ux.toFixed(1)}" cy="${uy.toFixed(1)}" r="9" fill="${D.marca.colores.secondary}" opacity=".25"/>
      <circle cx="${ux.toFixed(1)}" cy="${uy.toFixed(1)}" r="5" fill="${D.marca.colores.secondary}" stroke="#fff" stroke-width="2"/>
      ${pines}
    </svg>`;
  }

  V.mapa = (s) => {
    const activos = s.reportes.filter((r) => !CERRADOS.includes(r.estado)).sort((a, b) => a.km - b.km);
    const pop = s.flags.popup ? s.reportes.find((r) => r.id === s.flags.popup) : null;
    const popup = pop
      ? `<div class="a-popup"><button class="a-popup-x" data-acc="cerrar-popup" aria-label="Cerrar">×</button>
          <strong>${cat(pop.categoria).emoji} ${esc(pop.categoria)} · #${pop.id}</strong>
          <span class="a-popup-estado c-${estadoInfo(pop.estado).color}-t">${esc(estadoInfo(pop.estado).texto)}</span>
          <span class="a-popup-dir">📍 ${esc(pop.direccion)}</span>
          <p>${esc(pop.detalle)}</p>
          <button class="a-popup-btn" data-acc="chat-reporte" data-id="${pop.id}">Abrir chat del reporte</button>
          <button class="a-popup-btn a-popup-sec" data-acc="detalle" data-id="${pop.id}">Ver detalle</button>
        </div>`
      : '';
    return `${header('Mapa de reportes')}
    <div class="a-cuerpo a-mapa-layout">
      <div class="a-mapa">${mapaSVG(s)}
        <div class="a-zoom"><button aria-label="Acercar">+</button><button aria-label="Alejar">−</button></div>
        <div class="a-atrib">Mapa ilustrativo · en la app: Leaflet | © OpenStreetMap</div>
        <button class="a-fab a-fab-mapa" data-acc="ubicar" aria-label="Mi ubicación">${I.ubicar}</button>
        ${popup}
      </div>
      <div class="a-panel">
        <div class="a-item-fila"><span>Seguir mi ubicación en vivo</span><button class="a-toggle${s.seguir ? ' on' : ''}" data-acc="seguir" aria-label="Seguir mi ubicación"><span></span></button></div>
        <small class="a-nota-panel">Tú: ${D.posicion.lat.toFixed(5)}, ${D.posicion.lng.toFixed(5)} (±${D.posicion.precision} m)</small>
        <small class="a-nota-panel">Reportes activos más cercanos:</small>
        ${activos.map((r) => `<button class="a-cercano" data-acc="popup" data-id="${r.id}"><span><span class="a-cerc-tit">${cat(r.categoria).emoji} ${esc(r.categoria)} · ${esc(estadoInfo(r.estado).texto)}</span>
          <span class="a-cerc-dir">📍 ${esc(r.direccion)}</span></span><span class="a-km">${r.km.toFixed(1)} km</span></button>`).join('')}
      </div>
    </div>
    ${tabs(s, s.ruta)}${toast(s)}`;
  };

  V.perfil = (s) => {
    const u = usuario(s);
    const rol = u.rol === 'admin' ? 'Funcionario' : 'Ciudadano';
    return `${header('Mi perfil')}
    <div class="a-cuerpo"><div class="a-scroll">
      <div class="a-perfil-cab">${avatar(u, 'a-avatar-xl')}<button class="a-btn a-chico a-outline" data-acc="toast" data-v="Foto actualizada">${I.camara}Cambiar foto</button></div>
      <div class="a-lista a-inset-16">
        <label class="a-item a-stacked"><span class="a-label">Nombre</span><input value="${esc(u.nombre)}"></label>
        <div class="a-item a-item-fila"><span>Correo</span><span class="a-gris">${esc(u.email)}</span></div>
        <div class="a-item a-item-fila"><span>Rol</span><span class="a-gris">${rol}</span></div>
      </div>
      <button class="a-btn a-bloque a-alto a-deshab a-mx">Guardar cambios</button>
      <div class="a-lista a-inset-16">
        <div class="a-lista-tit">Dispositivo</div>
        <div class="a-item a-item-fila"><span>Red</span><span class="a-gris">Conectado (wifi)</span></div>
        <div class="a-item a-item-fila"><span>Ubicación</span><span class="a-gris">${D.posicion.lat.toFixed(4)}, ${D.posicion.lng.toFixed(4)}</span></div>
        <div class="a-item a-item-fila"><span>Backend</span><span class="a-gris">Local (sin llaves)</span></div>
      </div>
      <button class="a-btn a-bloque a-alto a-outline-danger a-mx a-mt24" data-acc="salir">${I.salir}Cerrar sesión</button>
      <div style="height:24px"></div>
    </div></div>
    ${tabs(s, s.ruta)}`;
  };

  function menuLateral(s) {
    const u = usuario(s);
    const admin = s.rol === 'admin';
    const items = TABS[s.rol].map(([ruta, ico, txt]) => [ruta, ico, ruta === 'perfil' ? 'Mi perfil' : txt]);
    const actual = TAB_DE[s.ruta];
    return `<div class="a-backdrop a-backdrop-menu" data-acc="cerrar-menu"></div>
    <aside class="a-menu" aria-label="Menú">
      <div class="a-menu-head">${esc(D.marca.nombre)}</div>
      <div class="a-menu-user">${avatar(u, 'a-avatar-md')}<div><strong>${esc(u.nombre)}</strong><span class="a-correo">${esc(u.email)}</span><span class="a-rol">${admin ? 'Funcionario' : 'Ciudadano'}</span></div></div>
      <div class="a-menu-items">
        ${items.map(([ruta, ico, txt], i) => `<button class="a-menu-item${i === actual ? ' activo' : ''}" data-ir="${ruta}">${I[ico]}<span>${txt}</span></button>`).join('')}
        <button class="a-menu-item a-salir" data-acc="salir">${I.salir}<span>Cerrar sesión</span></button>
      </div>
      <p class="a-menu-pie">Modo local (sin backend)</p>
    </aside>`;
  }

  V.panel = (s) => {
    const abiertos = s.reportes.filter((r) => !CERRADOS.includes(r.estado));
    const n = (f) => s.reportes.filter(f).length;
    const porCat = D.categorias.map((c) => [c, abiertos.filter((r) => r.categoria === c.nombre).length]).filter(([, k]) => k > 0);
    const deps = [...s.dependencias].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return `${header('Panel del funcionario')}
    <div class="a-cuerpo"><div class="a-scroll">
      <div class="a-metricas">
        <div class="a-metrica"><strong>${n((r) => r.estado === 'nuevo')}</strong><span>Nuevos</span></div>
        <div class="a-metrica"><strong>${n((r) => r.estado === 'en_revision' || r.estado === 'asignado')}</strong><span>En proceso</span></div>
        <div class="a-metrica"><strong>${n((r) => r.estado === 'resuelto')}</strong><span>Resueltos</span></div>
        <div class="a-metrica"><strong>${s.dependencias.length}</strong><span>Dependencias</span></div>
      </div>
      <p class="a-abiertos">Abiertos: ${porCat.map(([c, k]) => `${c.emoji} ${esc(c.nombre)} (${k})`).join(' · ') || 'ninguno'}</p>
      <h2 class="a-h2">Dependencias responsables</h2>
      ${deps.map((d) => tarjetaDependencia(d, true)).join('')}
      <div class="a-espacio-fab"></div>
    </div>
    <button class="a-fab" data-ir="f-dependencia" aria-label="Nueva dependencia">${I.mas}</button>
    </div>
    ${tabs(s, s.ruta)}${toast(s)}`;
  };

  V.dependencia = () => `${header('Nueva dependencia', { izq: null, der: 'cerrar:f-panel' })}
    <div class="a-cuerpo"><div class="a-scroll a-padding">
      <div class="a-lista a-inset">
        <label class="a-item a-stacked"><span class="a-label">Nombre</span><input data-campo="dep-nombre" value="Secretaría de Infraestructura — Andenes"></label>
        <label class="a-item a-stacked"><span class="a-label">Descripción</span><textarea data-campo="dep-desc" rows="2"></textarea></label>
        <label class="a-item a-stacked a-select"><span class="a-label">Categoría</span>
          <select data-campo="dep-cat">${D.categorias.map((c) => `<option${c.nombre === 'Huecos y vías' ? ' selected' : ''}>${esc(c.nombre)}</option>`).join('')}</select>
          <span class="a-select-ico">${I.selector}</span></label>
        <label class="a-item a-stacked"><span class="a-label">Respuesta estimada (días hábiles)</span><input data-campo="dep-dias" type="number" value="15"></label>
        <label class="a-item a-stacked"><span class="a-label">Latitud</span><input type="number" value="3.447000"></label>
        <label class="a-item a-stacked"><span class="a-label">Longitud</span><input type="number" value="-76.541000"></label>
      </div>
      <button class="a-btn a-bloque a-alto a-outline" data-acc="toast" data-v="Ubicación: 3.447000, -76.541000">${I.ubicar}Usar mi ubicación</button>
      <button class="a-btn a-bloque a-alto a-mt8" data-acc="guardar-dep">Guardar</button>
    </div></div>`;

  // ---------- Pintado ----------
  function pintarPantalla(ruta, s) {
    const def = pantalla(ruta) || pantalla('login');
    s.ruta = def.id;
    const cuerpo = V[def.vista](s);
    const menu = s.flags.menu ? menuLateral(s) : '';
    return `<div class="pantalla v-${def.vista}" data-ruta="${def.id}">${cuerpo}${menu}</div>`;
  }

  // ---------- Navegación ----------
  let ruta = 'login';
  let modo = 'navegar';
  let esperandoHash = false;
  let temporizadorToast = null;

  function ir(destino, flags = {}) {
    st.flags = flags;
    if (destino === 'comunidad') st.sala = 'general';
    const nuevoHash = `#/${destino}`;
    if (location.hash !== nuevoHash) {
      esperandoHash = true;
      location.hash = nuevoHash;
    } else {
      ruta = destino;
      render();
    }
  }
  function saltar(destino) {
    st.flags = {};
    const def = pantalla(destino);
    if (def && def.preset) def.preset(st);
  }
  function leerHash() {
    const h = location.hash.replace(/^#\/?/, '');
    if (h === 'tablero') return { modo: 'tablero' };
    return { modo: 'navegar', ruta: pantalla(h) ? h : 'login' };
  }
  function alCambiarHash() {
    const h = leerHash();
    modo = h.modo;
    if (h.modo === 'navegar') {
      if (!esperandoHash) saltar(h.ruta);
      ruta = h.ruta;
    }
    esperandoHash = false;
    render();
  }

  const $ = (sel, raiz = document) => raiz.querySelector(sel);

  function render() {
    document.body.dataset.modo = modo;
    document.querySelectorAll(".p-modos [data-modo]").forEach((a) => a.classList.toggle('activo', a.dataset.modo === modo));
    if (modo === 'tablero') return renderTablero();
    renderNavegar();
  }

  function renderNavegar() {
    const main = $('#p-main');
    if (!main.querySelector('.p-navegar')) {
      main.innerHTML = `<div class="p-navegar">
        <aside class="p-lista" aria-label="Pantallas"></aside>
        <div class="p-centro"><label class="p-selector">Pantalla: <select aria-label="Ir a pantalla"></select></label><div class="p-telefono" id="telefono"></div></div>
        <aside class="p-info" aria-live="polite"></aside>
      </div>`;
    }
    const grupos = { acceso: 'Acceso', ciudadano: 'Ciudadano', funcionario: 'Funcionario' };
    $('.p-lista').innerHTML = Object.entries(grupos).map(([g, t]) => `<h3>${t}</h3><ol>${P.filter((p) => p.grupo === g)
      .map((p) => `<li><a href="#/${p.id}" class="${p.id === ruta ? 'activo' : ''}" data-saltar="${p.id}"><span>${p.n}</span>${esc(p.nombre)}</a></li>`).join('')}</ol>`).join('');
    $('.p-selector select').innerHTML = P.map((p) => `<option value="${p.id}"${p.id === ruta ? ' selected' : ''}>${p.n} · ${esc(p.nombre)}</option>`).join('');

    const tel = $('#telefono');
    const anterior = tel.querySelector('.pantalla');
    const mismo = anterior && anterior.dataset.ruta === ruta;
    const scrollPrevio = mismo ? (tel.querySelector('.a-scroll') || {}).scrollTop : 0;
    tel.innerHTML = pintarPantalla(ruta, st);
    const sc = tel.querySelector('.a-scroll');
    if (sc) sc.scrollTop = tel.querySelector('[data-chat]') ? sc.scrollHeight : scrollPrevio || 0;

    const def = pantalla(ruta);
    $('.p-info').innerHTML = `<p class="p-num">${def.n} / ${P.length}</p><h2>${esc(def.nombre)}</h2><p>${esc(def.nota)}</p>
      <dl><dt>Rol</dt><dd>${st.rol === 'admin' ? 'Funcionario' : 'Ciudadano'}</dd>
      <dt>En la app</dt><dd><code>${esc(def.archivo)}</code></dd>
      <dt>Captura real</dt><dd><code>capturas/${esc(def.app)}</code></dd></dl>
      <p class="p-tip">Toca dentro del teléfono como en la app real: pestañas, tarjetas, botones, menú ☰ y chat funcionan con datos simulados.</p>
      <button class="p-boton" data-acc-p="reiniciar">Reiniciar datos de la demo</button>`;

    clearTimeout(temporizadorToast);
    if (st.flags.toast) temporizadorToast = setTimeout(() => { delete st.flags.toast; const t = $('#telefono .a-toast'); if (t) t.remove(); }, 2600);
  }

  // ---------- Tablero «todas las pantallas» ----------
  const FLUJOS = [
    { titulo: 'Acceso', texto: 'Inicio de sesión y registro (ciudadano o funcionario).',
      pasos: [['login'], ['registro', '«Regístrate»'], ['inicio', '«Registrarme»']] },
    { titulo: 'Ciudadano · reportar un problema', texto: 'Del inicio al chat del reporte: el flujo principal de la app.',
      pasos: [['inicio'], ['nuevo', 'Toca una dependencia o «Reportar un problema»'], ['tipos', 'Toca «Categoría»: 6 tipos'], ['enviado', '«Enviar reporte»'], ['reportes', 'Pestaña «Reportes»'], ['detalle', 'Toca la tarjeta'], ['chat-reporte', '«Abrir chat del reporte»']] },
    { titulo: 'Ciudadano · explorar', texto: 'Pestañas inferiores y menú lateral, disponibles desde cualquier pantalla.',
      pasos: [['mapa'], ['comunidad', 'Pestaña «Chat»'], ['perfil', 'Pestaña «Perfil»'], ['menu', 'Botón ☰']] },
    { titulo: 'Funcionario', texto: 'Entra con funcionario@demo.local. Estados: Nuevo → En revisión → Asignado → Resuelto (o Descartado).',
      pasos: [['f-panel'], ['f-dependencia', 'Botón «+»'], ['f-bandeja', '«Guardar» → pestaña «Reportes»'], ['f-estado', 'Botón de siguiente estado'], ['f-chat', '«Chat» del reporte'], ['f-mapa', 'Pestaña «Mapa»']] },
  ];
  function renderTablero() {
    clearTimeout(temporizadorToast);
    const main = $('#p-main');
    main.innerHTML = `<div class="p-tablero">
      <div class="p-tab-intro"><h2>Todas las pantallas</h2><p>${P.length} pantallas del prototipo, agrupadas por flujo. Las flechas indican la acción que lleva a la siguiente. Haz clic en cualquier pantalla para abrirla y navegarla.</p></div>
      ${FLUJOS.map((f) => `<section class="p-flujo"><h3>${esc(f.titulo)}</h3><p>${esc(f.texto)}</p><div class="p-fila">${f.pasos
        .map(([id, accion], i) => {
          const def = pantalla(id);
          const s = estadoInicial();
          def.preset && def.preset(s);
          const flecha = i > 0 ? `<div class="p-flecha"><span>${esc(accion)}</span><svg viewBox="0 0 60 16" aria-hidden="true"><path d="M2 8H54M46 2l8 6-8 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` : '';
          return `${flecha}<div class="p-celda" role="link" tabindex="0" aria-label="Abrir ${esc(def.nombre)}" data-saltar="${id}"><div class="p-celda-tit"><span>${def.n}</span>${esc(def.nombre)}</div>
            <div class="p-mini"><div class="p-mini-escala">${pintarPantalla(id, s)}</div></div><p class="p-celda-nota">${esc(def.nota)}</p></div>`;
        }).join('')}</div></section>`).join('')}
    </div>`;
  }

  // ---------- Acciones ----------
  const valorCampo = (nombre) => {
    const el = document.querySelector(`#telefono [data-campo="${nombre}"]`);
    return el ? el.value.trim() : '';
  };
  const recordarDetalle = () => {
    const el = document.querySelector('#telefono [data-campo="detalle"]');
    if (el) st.borrador.detalle = el.value;
  };
  const reporte = (id) => st.reportes.find((r) => r.id === Number(id));
  const re = (flags = {}) => { st.flags = flags; render(); };

  const ACC = {
    login() {
      st.rol = valorCampo('email').toLowerCase().includes('funcionario') ? 'admin' : 'user';
      ir(rutaInicio(st));
    },
    demo(el) {
      const i = document.querySelector('#telefono [data-campo="email"]');
      const c = document.querySelector('#telefono [data-campo="clave"]');
      if (i) i.value = el.dataset.v;
      if (c) c.value = el.dataset.v.startsWith('funcionario') ? 'admin123' : 'demo123';
    },
    registrar() { st.rol = 'user'; ir('inicio'); },
    salir() { st.rol = 'user'; ir('login'); },
    menu() { re({ ...st.flags, menu: true }); },
    'cerrar-menu'() { re({}); },
    filtro(el) { st.filtro = el.dataset.v; re({}); },
    'abrir-nuevo'(el) {
      const c = el.dataset.cat || null;
      st.borrador = borradorVacio(c);
      if (c === 'Alumbrado') st.borrador.detalle = REPORTE_DEMO.detalle;
      ir('nuevo');
    },
    'abrir-selector'() { recordarDetalle(); re({ selector: true }); },
    'cerrar-selector'() { re({}); },
    'elegir-cat'(el) { st.borrador.categoria = el.dataset.v; re({}); },
    ubicacion() { recordarDetalle(); st.borrador.ubicacion = true; re({}); },
    foto() { recordarDetalle(); st.borrador.foto = true; re({}); },
    'enviar-reporte'() {
      recordarDetalle();
      const b = st.borrador;
      if (!b.categoria) return re({ selector: true });
      const dep = st.dependencias.find((d) => d.categoria === b.categoria);
      const yaDemo = st.reportes.some((r) => r.id === 1755);
      const id = yaDemo ? Math.max(...st.reportes.map((r) => r.id)) + 1 : 1755;
      st.reportes.unshift({
        id, autorId: usuario().id, autor: usuario().nombre, dependenciaId: dep ? dep.id : null, categoria: b.categoria,
        detalle: b.detalle.trim() || `Reporte de ${b.categoria.toLowerCase()} en el barrio`, estado: 'nuevo',
        direccion: DIRECCION_GPS, fecha: id === 1755 ? REPORTE_DEMO.fecha : `21 de nov, ${horaAhora()}`,
        lat: D.posicion.lat + (id === 1755 ? 0 : 0.0012), lng: D.posicion.lng + (id === 1755 ? 0 : 0.0015), km: id === 1755 ? 0 : 0.2,
        foto: b.foto ? (b.categoria === 'Alumbrado' ? 'alumbrado' : b.categoria) : null,
      });
      st.borrador = borradorVacio();
      ir('enviado', { toast: 'Reporte enviado. Síguelo en la pestaña Reportes.' });
    },
    vista(el) { st.vista = el.dataset.v; re({}); },
    detalle(el) { st.reporteSel = Number(el.dataset.id); ir('detalle'); },
    'chat-reporte'(el) { st.sala = `request-${el.dataset.id}`; ir(rutaChatReporte(st)); },
    'ver-mapa'(el) { ir(st.rol === 'admin' ? 'f-mapa' : 'mapa', { popup: Number(el.dataset.id) }); },
    avanzar(el) {
      const r = reporte(el.dataset.id);
      const sig = siguienteEstado(r.estado);
      if (!sig) return;
      r.estado = sig;
      ir('f-estado', { toast: `Estado: ${estadoInfo(sig).texto}` });
    },
    descartar(el) {
      reporte(el.dataset.id).estado = 'descartado';
      re({ toast: 'Estado: Descartado' });
    },
    'enviar-msg'() {
      const i = document.querySelector('#telefono [data-campo="mensaje"]');
      const texto = i ? i.value.trim() : '';
      if (!texto) return;
      const u = usuario();
      (st.mensajes[st.sala] ||= []).push({ autorId: u.id, autor: u.nombre, texto, hora: horaAhora() });
      re({});
    },
    popup(el) { re({ popup: Number(el.dataset.id) }); },
    'cerrar-popup'() { re({}); },
    seguir() { st.seguir = !st.seguir; re({}); },
    ubicar() { re({ toast: 'Ubicación actualizada: San Antonio, Cali' }); },
    toast(el) { re({ toast: el.dataset.v }); },
    'editar-dep'() { ir('f-dependencia'); },
    'eliminar-dep'(el) {
      st.dependencias = st.dependencias.filter((d) => d.id !== Number(el.dataset.id));
      re({ toast: 'Dependencia eliminada' });
    },
    'guardar-dep'() {
      const nombre = valorCampo('dep-nombre') || 'Nueva dependencia';
      const categoria = valorCampo('dep-cat') || 'Huecos y vías';
      st.dependencias.push({ id: Date.now(), nombre, descripcion: valorCampo('dep-desc') || 'Dependencia creada desde el panel.', categoria,
        dias: Number(valorCampo('dep-dias')) || 15, km: 0.0, lat: D.posicion.lat, lng: D.posicion.lng });
      ir('f-panel', { toast: 'Dependencia guardada' });
    },
  };

  document.addEventListener('click', (e) => {
    const p = e.target.closest('[data-acc-p]');
    if (p && p.dataset.accP === 'reiniciar') {
      st = estadoInicial();
      saltar(ruta);
      return render();
    }
    const modoA = e.target.closest('.p-modos a[data-modo="navegar"]');
    if (modoA) {
      // Volver a la última pantalla navegada sin reiniciar su estado
      e.preventDefault();
      if (location.hash !== `#/${ruta}`) { esperandoHash = true; location.hash = `#/${ruta}`; }
      return;
    }
    const saltarA = e.target.closest('[data-saltar]');
    if (saltarA) {
      e.preventDefault();
      const id = saltarA.dataset.saltar;
      saltar(id);
      esperandoHash = true;
      if (location.hash === `#/${id}`) { esperandoHash = false; modo = 'navegar'; ruta = id; render(); }
      else location.hash = `#/${id}`;
      window.scrollTo(0, 0);
      return;
    }
    if (!e.target.closest('#telefono')) return;
    const acc = e.target.closest('[data-acc]');
    const irA = e.target.closest('[data-ir]');
    // El elemento más interno decide (un botón dentro de una tarjeta tocable gana)
    const objetivo = acc && irA ? (acc.contains(irA) ? irA : acc) : acc || irA;
    if (!objetivo) return;
    e.preventDefault();
    if (objetivo.dataset.ir) return ir(objetivo.dataset.ir);
    const f = ACC[objetivo.dataset.acc];
    if (f) f(objetivo);
  });

  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.p-celda')) { e.preventDefault(); e.target.click(); return; }
    if (e.key === 'Enter' && e.target.matches('#telefono [data-campo="mensaje"]')) ACC['enviar-msg']();
    if (e.key === 'Enter' && e.target.matches('#telefono [data-campo="email"], #telefono [data-campo="clave"]')) ACC.login();
  });

  // Búsqueda de dependencias en vivo (sin re-pintar para no perder el foco)
  document.addEventListener('input', (e) => {
    if (!e.target.matches('#telefono [data-buscar]')) return;
    const q = e.target.value.trim().toLowerCase();
    const cards = document.querySelectorAll('#telefono .a-card[data-texto]');
    let visibles = 0;
    cards.forEach((c) => { const ok = !q || c.dataset.texto.includes(q); c.hidden = !ok; if (ok) visibles++; });
    const v = document.querySelector('#telefono .a-sin-coincidencias');
    if (v) v.hidden = visibles > 0;
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('.p-selector select')) {
      const id = e.target.value;
      saltar(id);
      esperandoHash = true;
      location.hash = `#/${id}`;
    }
  });

  window.addEventListener('hashchange', alCambiarHash);
  document.addEventListener('DOMContentLoaded', () => {
    if (!location.hash) {
      esperandoHash = true;
      history.replaceState(null, '', '#/login');
      esperandoHash = false;
    }
    alCambiarHash();
  });

  // Exposición mínima para las capturas automáticas (herramientas/capturar.mjs)
  window.PROTOTIPO = { pantallas: P.map((p) => ({ id: p.id, n: p.n, nombre: p.nombre })) };
})();
