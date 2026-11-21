// Servicio de GIPHY (Challenge 17 / Clase 11). Cliente HTTP reutilizable con fetch:
// URL base, query params, revisión de res.ok, timeout y cancelación con AbortController.
// No usa import.meta.env: la llave y la URL se pasan como parámetros, así el mismo
// archivo funciona en la app (Vite) y en node (challenges/17-giphy/*.mjs).

export class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.name = 'ErrorHttp';
    this.status = status;
  }
}

const MENSAJES = {
  400: 'Petición inválida (revisa los parámetros).',
  401: 'Llave de GIPHY inválida o ausente.',
  403: 'Llave de GIPHY sin permiso.',
  404: 'Recurso no encontrado.',
  414: 'El término de búsqueda es demasiado largo.',
  429: 'Demasiadas peticiones: se agotó el cupo de la llave.',
};

export const crearClienteGiphy = ({ apiKey, base = 'https://api.giphy.com/v1', timeoutMs = 8000, fetchFn = globalThis.fetch } = {}) => {
  const pedir = async (ruta, params = {}, { signal } = {}) => {
    if (!apiKey) throw new ErrorHttp(401, MENSAJES[401]);
    const query = new URLSearchParams({ api_key: apiKey, ...params });
    // Timeout + cancelación del usuario combinados en una sola señal
    const senales = [AbortSignal.timeout(timeoutMs)];
    if (signal) senales.push(signal);
    let res;
    try {
      res = await fetchFn(`${base}${ruta}?${query}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.any(senales),
      });
    } catch (e) {
      if (e.name === 'AbortError') throw e; // la canceló el usuario: no es un error que mostrar
      if (e.name === 'TimeoutError') throw new ErrorHttp(504, `GIPHY no respondió en ${timeoutMs / 1000} s.`);
      throw new ErrorHttp(0, 'Sin conexión con GIPHY (red, DNS o CORS).');
    }
    // fetch NO lanza error con 4xx/5xx: siempre hay que revisar res.ok
    if (!res.ok) throw new ErrorHttp(res.status, MENSAJES[res.status] || `GIPHY respondió ${res.status} ${res.statusText}`);
    return res.json();
  };

  // Deja solo lo que la interfaz necesita
  const simplificar = (g) => ({
    id: g.id,
    titulo: g.title || 'GIF sin título',
    url: g.images?.fixed_width?.url || g.images?.original?.url,
    ancho: Number(g.images?.fixed_width?.width) || 200,
    alto: Number(g.images?.fixed_width?.height) || 200,
    enlace: g.url,
  });

  const buscar = async (termino, { limite = 24, offset = 0, rating = 'g', idioma = 'es', signal } = {}) => {
    const q = String(termino ?? '').trim();
    if (!q) return { gifs: [], total: 0, offset: 0 };
    const json = await pedir('/gifs/search', { q, limit: limite, offset, rating, lang: idioma }, { signal });
    return {
      gifs: (json.data || []).map(simplificar),
      total: json.pagination?.total_count ?? 0,
      offset: json.pagination?.offset ?? offset,
    };
  };

  const tendencias = async ({ limite = 24, rating = 'g', signal } = {}) => {
    const json = await pedir('/gifs/trending', { limit: limite, rating }, { signal });
    return { gifs: (json.data || []).map(simplificar), total: json.pagination?.total_count ?? 0, offset: 0 };
  };

  // Varias búsquedas a la vez (Clase 11, slide 21): si una falla, las demás se muestran igual
  const buscarVarios = async (terminos, opciones) => {
    const resultados = await Promise.allSettled(terminos.map((t) => buscar(t, opciones)));
    return resultados.map((r, i) => ({
      termino: terminos[i],
      ok: r.status === 'fulfilled',
      gifs: r.status === 'fulfilled' ? r.value.gifs : [],
      error: r.status === 'rejected' ? r.reason.message : null,
    }));
  };

  return { buscar, tendencias, buscarVarios };
};

export default crearClienteGiphy;
