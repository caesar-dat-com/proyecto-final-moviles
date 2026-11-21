// Funciones puras del Challenge 16 (recorridos): distancia, velocidad, estado de movimiento,
// agrupación por día y exportación a JSON. Sin dependencias de React ni del navegador,
// para poder probarlas con node (challenges/16-mapas-sensores/prueba.mjs).

const RADIO_TIERRA_KM = 6371;

export const distanciaKm = (a, b) => {
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return RADIO_TIERRA_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const distanciaTotalKm = (puntos = []) =>
  puntos.reduce((total, p, i) => (i === 0 ? 0 : total + distanciaKm(puntos[i - 1], p)), 0);

// Solo se guarda un punto nuevo si se movió al menos `minMetros` (evita ruido del GPS)
export const debeAgregar = (puntos, nuevo, minMetros = 5) => {
  if (!puntos.length) return true;
  return distanciaKm(puntos[puntos.length - 1], nuevo) * 1000 >= minMetros;
};

// Velocidad en km/h entre los dos últimos puntos
export const velocidadKmh = (puntos = []) => {
  if (puntos.length < 2) return 0;
  const a = puntos[puntos.length - 2];
  const b = puntos[puntos.length - 1];
  const horas = (b.fecha - a.fecha) / 3600000;
  return horas > 0 ? distanciaKm(a, b) / horas : 0;
};

// Clasifica el movimiento: quieto (<1 km/h), caminando (<8), rápido (>=8)
export const estadoMovimiento = (kmh) => {
  if (kmh < 1) return { valor: 'quieto', texto: 'Quieto', color: 'medium' };
  if (kmh < 8) return { valor: 'caminando', texto: 'Caminando', color: 'success' };
  return { valor: 'rapido', texto: 'Movimiento rápido', color: 'warning' };
};

// Avisos "inteligentes" del enunciado: mucho tiempo quieto, sin conexión, movimiento rápido
export const avisosInteligentes = ({ puntos = [], ahora = Date.now(), conectado = true, minutosQuieto = 5 }) => {
  const avisos = [];
  if (!conectado) avisos.push('Sin conexión: la dirección no se puede consultar, se guardan solo coordenadas.');
  const ultimo = puntos[puntos.length - 1];
  if (ultimo && ahora - ultimo.fecha >= minutosQuieto * 60000) {
    avisos.push(`Llevas más de ${minutosQuieto} minutos sin moverte.`);
  }
  if (velocidadKmh(puntos) >= 8) avisos.push('Vas rápido: ¿vas en vehículo?');
  return avisos;
};

// Batería baja: menos del 15 % y sin cargar → detener el seguimiento
export const bateriaBaja = (bateria, limite = 0.15) => Boolean(bateria && !bateria.cargando && bateria.nivel < limite);

export const claveDia = (fecha) => {
  const d = new Date(fecha);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// { 'AAAA-MM-DD': [recorridos...] } ordenado del más reciente al más antiguo
export const agruparPorDia = (recorridos = []) =>
  [...recorridos]
    .sort((a, b) => b.inicio - a.inicio)
    .reduce((grupos, r) => {
      const k = claveDia(r.inicio);
      (grupos[k] ||= []).push(r);
      return grupos;
    }, {});

export const crearRecorrido = (puntos, inicio, fin = Date.now()) => ({
  id: `${inicio}`,
  inicio,
  fin,
  puntos,
  distanciaKm: Math.round(distanciaTotalKm(puntos) * 1000) / 1000,
});

export const aJSON = (recorridos) => JSON.stringify({ version: 1, exportado: new Date().toISOString(), recorridos }, null, 2);

export const desdeJSON = (texto) => {
  const datos = JSON.parse(texto);
  if (!Array.isArray(datos?.recorridos)) throw new Error('El archivo no tiene la lista "recorridos".');
  return datos.recorridos;
};
