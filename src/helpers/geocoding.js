// Geocoding inverso con Nominatim (OpenStreetMap): lat/lng → dirección legible.
// API pública y sin llave: https://nominatim.org/release-docs/latest/api/Reverse/
// Política de uso de Nominatim: máximo 1 petición por segundo, identificarse con un
// User-Agent propio y guardar en caché los resultados. Por eso aquí:
//   1. Caché en localStorage (las coordenadas se redondean a 5 decimales ≈ 1 m).
//   2. Cola que deja al menos 1,1 s entre peticiones.
//   3. Peticiones idénticas en curso se comparten (no se repiten).
// Si la petición falla, quien llama muestra las coordenadas.

const URL_NOMINATIM = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'ReportaCali/1.0 (proyecto academico Plataformas Moviles UAO)';
const PREFIJO_CACHE = 'reportacali-geo:';
const ESPERA_MS = 1100;

let ultimaPeticion = 0;
let cola = Promise.resolve();
const enCurso = new Map();

export const claveCoords = (lat, lng) => `${Number(lat).toFixed(5)},${Number(lng).toFixed(5)}`;

export const coordenadasTexto = (lat, lng) => `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;

export const leerCache = (lat, lng) => {
  try {
    return localStorage.getItem(PREFIJO_CACHE + claveCoords(lat, lng));
  } catch {
    return null;
  }
};

const guardarCache = (lat, lng, direccion) => {
  try {
    localStorage.setItem(PREFIJO_CACHE + claveCoords(lat, lng), direccion);
  } catch {
    // localStorage lleno o bloqueado: se sigue sin caché
  }
};

// Arma una dirección corta: «Calle 12 #5-37, San Pedro, Cali»
export const formatearDireccion = (datos) => {
  const a = datos?.address || {};
  const via = [a.road || a.pedestrian || a.footway || a.path, a.house_number && `#${a.house_number}`].filter(Boolean).join(' ');
  const barrio = a.neighbourhood || a.suburb || a.quarter || a.city_district;
  const ciudad = a.city || a.town || a.village || a.county;
  const partes = [via, barrio, ciudad].filter(Boolean);
  if (partes.length) return partes.join(', ');
  return datos?.display_name ? datos.display_name.split(',').slice(0, 3).join(',').trim() : null;
};

// Turno en la cola: garantiza el espacio mínimo entre peticiones a Nominatim
const esperarTurno = () => {
  const turno = cola.then(async () => {
    const espera = ultimaPeticion + ESPERA_MS - Date.now();
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    ultimaPeticion = Date.now();
  });
  cola = turno.catch(() => {});
  return turno;
};

// Devuelve la dirección (string). Lanza un Error si la petición falla.
export const direccionDesdeCoords = async (lat, lng) => {
  if (lat == null || lng == null || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
    throw new Error('Coordenadas inválidas');
  }
  const enCache = leerCache(lat, lng);
  if (enCache) return enCache;

  const clave = claveCoords(lat, lng);
  if (enCurso.has(clave)) return enCurso.get(clave);

  const promesa = (async () => {
    await esperarTurno();
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: Number(lat).toFixed(6),
      lon: Number(lng).toFixed(6),
      zoom: '18',
      addressdetails: '1',
      'accept-language': 'es',
    });
    const respuesta = await fetch(`${URL_NOMINATIM}?${params}`, {
      // Nominatim permite el encabezado User-Agent en CORS (Access-Control-Allow-Headers: user-agent).
      // Algunos navegadores lo ignoran; en ese caso el Referer identifica la app.
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    });
    if (!respuesta.ok) throw new Error(`Nominatim respondió ${respuesta.status}`);
    const datos = await respuesta.json();
    if (datos?.error) throw new Error(datos.error);
    const direccion = formatearDireccion(datos);
    if (!direccion) throw new Error('Sin dirección para esas coordenadas');
    guardarCache(lat, lng, direccion);
    return direccion;
  })();

  enCurso.set(clave, promesa);
  try {
    return await promesa;
  } finally {
    enCurso.delete(clave);
  }
};
