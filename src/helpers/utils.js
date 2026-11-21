// Funciones generales reutilizables en toda la app.
import BRAND from './brand';

// Id único para registros del modo local
export const generarId = () => Date.now() * 1000 + Math.floor(Math.random() * 1000);

// Id corto para mostrar (los ids del modo local son muy largos)
export const idCorto = (id) => String(id).slice(-4);

export const formatearFecha = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString(BRAND.locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatearHora = (iso) =>
  iso ? new Date(iso).toLocaleTimeString(BRAND.locale, { hour: '2-digit', minute: '2-digit' }) : '';

export const formatearPrecio = (valor) =>
  new Intl.NumberFormat(BRAND.locale, {
    style: 'currency',
    currency: BRAND.moneda,
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);

export const esEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

// Distancia en km entre dos puntos (fórmula de Haversine)
export const distanciaKm = (lat1, lng1, lat2, lng2) => {
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const estadoInfo = (valor) =>
  BRAND.estados.find((e) => e.valor === valor) || { valor, texto: valor, color: 'medium' };

export const siguienteEstado = (valor) => {
  const flujo = BRAND.estados.filter((e) => e.valor !== 'cancelada');
  const i = flujo.findIndex((e) => e.valor === valor);
  return i >= 0 && i < flujo.length - 1 ? flujo[i + 1].valor : null;
};

export const iniciales = (nombre = '') =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';

// Hash SHA-256 para no guardar contraseñas en texto plano en el modo local.
// (Solo demostrativo: el modo local NO es un sistema de seguridad real.)
export const hashTexto = async (texto) => {
  if (globalThis.crypto?.subtle) {
    const datos = new TextEncoder().encode(texto);
    const buffer = await crypto.subtle.digest('SHA-256', datos);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Respaldo si la página no corre en contexto seguro (http por IP)
  let h = 0;
  for (const c of texto) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return `djb-${h}`;
};

// Aplica los colores de brand.js a las variables CSS de Ionic
export const aplicarTemaMarca = () => {
  const raiz = document.documentElement;
  Object.entries(BRAND.colores).forEach(([nombre, hex]) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const mezclar = (f, base) =>
      '#' +
      [r, g, b]
        .map((c) => Math.round(c * (1 - f) + base * f).toString(16).padStart(2, '0'))
        .join('');
    raiz.style.setProperty(`--ion-color-${nombre}`, hex);
    raiz.style.setProperty(`--ion-color-${nombre}-rgb`, `${r}, ${g}, ${b}`);
    raiz.style.setProperty(`--ion-color-${nombre}-contrast`, '#ffffff');
    raiz.style.setProperty(`--ion-color-${nombre}-contrast-rgb`, '255, 255, 255');
    raiz.style.setProperty(`--ion-color-${nombre}-shade`, mezclar(0.12, 0));
    raiz.style.setProperty(`--ion-color-${nombre}-tint`, mezclar(0.1, 255));
  });
  document.title = BRAND.nombre;
};
