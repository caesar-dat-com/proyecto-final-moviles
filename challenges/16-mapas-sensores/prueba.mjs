// Pruebas de la lógica del Challenge 16 (app/src/helpers/recorridos.js).
// Uso: node challenges/16-mapas-sensores/prueba.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  agruparPorDia, aJSON, avisosInteligentes, bateriaBaja, crearRecorrido, debeAgregar, desdeJSON,
  distanciaKm, distanciaTotalKm, estadoMovimiento, velocidadKmh,
} from '../../src/helpers/recorridos.js';

// Plaza de Caicedo → Iglesia de San Antonio (Cali), ~0,9 km en línea recta
const caicedo = { lat: 3.4516, lng: -76.5320 };
const sanAntonio = { lat: 3.4470, lng: -76.5385 };

test('distancia Haversine entre dos puntos de Cali', () => {
  const d = distanciaKm(caicedo, sanAntonio);
  assert.ok(d > 0.85 && d < 0.95, `distancia inesperada: ${d}`);
});

test('distancia total suma los tramos', () => {
  const puntos = [caicedo, sanAntonio, caicedo];
  assert.ok(Math.abs(distanciaTotalKm(puntos) - 2 * distanciaKm(caicedo, sanAntonio)) < 1e-9);
  assert.equal(distanciaTotalKm([]), 0);
});

test('debeAgregar ignora ruido del GPS menor a 5 m', () => {
  const p = { lat: 3.45, lng: -76.53, fecha: 0 };
  assert.equal(debeAgregar([], p), true);
  assert.equal(debeAgregar([p], { lat: 3.45001, lng: -76.53 }), false); // ~1 m
  assert.equal(debeAgregar([p], { lat: 3.4501, lng: -76.53 }), true); // ~11 m
});

test('velocidad y estado de movimiento', () => {
  const a = { lat: 3.45, lng: -76.53, fecha: 0 };
  const b = { lat: 3.4509, lng: -76.53, fecha: 60_000 }; // ~100 m en 1 min = ~6 km/h
  const v = velocidadKmh([a, b]);
  assert.ok(v > 5.5 && v < 6.5, `velocidad ${v}`);
  assert.equal(estadoMovimiento(v).valor, 'caminando');
  assert.equal(estadoMovimiento(0.2).valor, 'quieto');
  assert.equal(estadoMovimiento(30).valor, 'rapido');
});

test('avisos inteligentes: quieto, sin conexión, rápido', () => {
  const p = { lat: 3.45, lng: -76.53, fecha: 0 };
  const avisos = avisosInteligentes({ puntos: [p], ahora: 6 * 60_000, conectado: false });
  assert.equal(avisos.length, 2);
  assert.match(avisos[0], /Sin conexión/);
  assert.match(avisos[1], /sin moverte/);
  const rapido = avisosInteligentes({ puntos: [p, { lat: 3.46, lng: -76.53, fecha: 60_000 }], ahora: 60_000 });
  assert.deepEqual(rapido, ['Vas rápido: ¿vas en vehículo?']);
});

test('batería baja solo si < 15 % y no está cargando', () => {
  assert.equal(bateriaBaja({ nivel: 0.1, cargando: false }), true);
  assert.equal(bateriaBaja({ nivel: 0.1, cargando: true }), false);
  assert.equal(bateriaBaja({ nivel: 0.5, cargando: false }), false);
  assert.equal(bateriaBaja(null), false);
});

test('historial agrupado por día, más reciente primero', () => {
  const r1 = crearRecorrido([caicedo], new Date(2026, 10, 20, 8).getTime());
  const r2 = crearRecorrido([caicedo, sanAntonio], new Date(2026, 10, 21, 7).getTime());
  const r3 = crearRecorrido([sanAntonio], new Date(2026, 10, 21, 18).getTime());
  const grupos = agruparPorDia([r1, r2, r3]);
  assert.deepEqual(Object.keys(grupos), ['2026-11-21', '2026-11-20']);
  assert.deepEqual(grupos['2026-11-21'].map((r) => r.id), [r3.id, r2.id]);
  assert.ok(r2.distanciaKm > 0.85);
});

test('ida y vuelta a JSON conserva los recorridos', () => {
  const r = crearRecorrido([{ ...caicedo, fecha: 1 }, { ...sanAntonio, fecha: 2 }], 1, 2);
  assert.deepEqual(desdeJSON(aJSON([r])), [r]);
  assert.throws(() => desdeJSON('{"otra":1}'), /recorridos/);
});
