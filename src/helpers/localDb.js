// Respaldo local cuando NO hay llaves de Supabase.
// - Persistencia: localStorage (una clave por tabla).
// - "Tiempo real": BroadcastChannel entre pestañas + oyentes en la misma pestaña.
// Expone una mini API tipo base de datos para que los hooks mantengan
// la misma interfaz con o sin backend.
import { generarId, hashTexto } from './utils';
import { SEED_MESSAGES, SEED_PLACES, SEED_USUARIOS } from './seeds';

const PREFIJO = 'app-local';
const clave = (tabla) => `${PREFIJO}:${tabla}`;
const oyentes = new Map(); // tabla -> Set(callback)

const canal = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`${PREFIJO}-realtime`) : null;

const notificarLocal = (evento) => {
  oyentes.get(evento.tabla)?.forEach((cb) => cb(evento));
};

// Eventos que llegan desde otras pestañas
if (canal) canal.onmessage = (e) => notificarLocal(e.data);

const emitir = (evento) => {
  notificarLocal(evento);
  canal?.postMessage(evento);
};

export const leerTabla = (tabla) => {
  try {
    return JSON.parse(localStorage.getItem(clave(tabla))) || [];
  } catch {
    return [];
  }
};

const escribirTabla = (tabla, filas) => localStorage.setItem(clave(tabla), JSON.stringify(filas));

// Operadores soportados en los filtros: [["campo", "==", valor], ...]
const OPERADORES = {
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
  '>': (a, b) => a > b,
  '>=': (a, b) => a >= b,
  '<': (a, b) => a < b,
  '<=': (a, b) => a <= b,
  in: (a, b) => Array.isArray(b) && b.includes(a),
};

export const consultar = (tabla, filtros = [], orden = { campo: 'created_at', asc: false }) => {
  let filas = leerTabla(tabla).filter((fila) =>
    filtros.every(([campo, op, valor]) => (OPERADORES[op] || OPERADORES['=='])(fila[campo], valor)),
  );
  if (orden?.campo) {
    filas = [...filas].sort((a, b) => {
      const x = a[orden.campo] ?? '';
      const y = b[orden.campo] ?? '';
      const r = x > y ? 1 : x < y ? -1 : 0;
      return orden.asc ? r : -r;
    });
  }
  return filas;
};

export const insertar = (tabla, datos) => {
  const fila = { id: generarId(), created_at: new Date().toISOString(), ...datos };
  escribirTabla(tabla, [...leerTabla(tabla), fila]);
  emitir({ tabla, tipo: 'INSERT', fila });
  return fila;
};

export const actualizar = (tabla, id, cambios) => {
  let resultado = null;
  const filas = leerTabla(tabla).map((f) => {
    if (f.id !== id) return f;
    resultado = { ...f, ...cambios };
    return resultado;
  });
  if (!resultado) throw new Error(`No existe el registro ${id} en ${tabla}`);
  escribirTabla(tabla, filas);
  emitir({ tabla, tipo: 'UPDATE', fila: resultado });
  return resultado;
};

export const eliminar = (tabla, id) => {
  escribirTabla(
    tabla,
    leerTabla(tabla).filter((f) => f.id !== id),
  );
  emitir({ tabla, tipo: 'DELETE', fila: { id } });
};

export const suscribir = (tabla, callback) => {
  if (!oyentes.has(tabla)) oyentes.set(tabla, new Set());
  oyentes.get(tabla).add(callback);
  return () => oyentes.get(tabla)?.delete(callback);
};

// Carga los datos de ejemplo una sola vez
export const sembrarDatos = async () => {
  if (localStorage.getItem(clave('_sembrado'))) return;
  const ahora = Date.now();
  const usuarios = await Promise.all(
    SEED_USUARIOS.map(async ({ password, ...u }) => ({ ...u, password_hash: await hashTexto(password) })),
  );
  escribirTabla('_usuarios', usuarios);
  escribirTabla(
    'profiles',
    SEED_USUARIOS.map(({ id, nombre, rol, email }) => ({ id, nombre, rol, email, avatar_url: null, created_at: new Date(ahora).toISOString() })),
  );
  escribirTabla(
    'places',
    SEED_PLACES.map((p, i) => ({ ...p, created_at: new Date(ahora - i * 60000).toISOString() })),
  );
  escribirTabla(
    'messages',
    SEED_MESSAGES.map((m) => ({ ...m, created_at: new Date(ahora).toISOString() })),
  );
  escribirTabla('requests', []);
  localStorage.setItem(clave('_sembrado'), '1');
};
