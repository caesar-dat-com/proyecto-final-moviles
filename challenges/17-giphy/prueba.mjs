// Pruebas del cliente de GIPHY (app/src/helpers/giphy.js) contra el servidor simulado.
// No usa internet. Uso: node challenges/17-giphy/prueba.mjs
import assert from 'node:assert/strict';
import { test, after, before } from 'node:test';
import { crearClienteGiphy } from '../../src/helpers/giphy.js';
import { crearServidor, LLAVE_VALIDA } from './servidor-simulado.mjs';

let base;
let simulador;

before(async () => {
  simulador = crearServidor();
  await new Promise((r) => simulador.servidor.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${simulador.servidor.address().port}/v1`;
});

after(() => simulador.servidor.close());

test('buscar devuelve GIFs simplificados y la paginación', async () => {
  const giphy = crearClienteGiphy({ apiKey: LLAVE_VALIDA, base });
  const r = await giphy.buscar('gatos', { limite: 5 });
  assert.equal(r.gifs.length, 5);
  assert.equal(r.total, 60);
  assert.deepEqual(Object.keys(r.gifs[0]).sort(), ['alto', 'ancho', 'enlace', 'id', 'titulo', 'url']);
  assert.match(r.gifs[0].url, /imagen\.jpg/);
});

test('los parámetros viajan con URLSearchParams (api_key, q, limit, offset, rating, lang)', async () => {
  const giphy = crearClienteGiphy({ apiKey: LLAVE_VALIDA, base });
  await giphy.buscar('café con leche', { limite: 3, offset: 6 });
  const ultima = simulador.peticiones.at(-1);
  const params = new URL(ultima, 'http://x').searchParams;
  assert.equal(params.get('q'), 'café con leche');
  assert.equal(params.get('limit'), '3');
  assert.equal(params.get('offset'), '6');
  assert.equal(params.get('rating'), 'g');
  assert.equal(params.get('lang'), 'es');
});

test('término vacío no hace petición', async () => {
  const antes = simulador.peticiones.length;
  const r = await crearClienteGiphy({ apiKey: LLAVE_VALIDA, base }).buscar('   ');
  assert.deepEqual(r, { gifs: [], total: 0, offset: 0 });
  assert.equal(simulador.peticiones.length, antes);
});

test('llave inválida → ErrorHttp 401 (fetch no lanza solo: se revisa res.ok)', async () => {
  await assert.rejects(crearClienteGiphy({ apiKey: 'mala', base }).buscar('gatos'), (e) => e.status === 401 && /Llave/.test(e.message));
});

test('sin llave → 401 sin llamar al servidor', async () => {
  await assert.rejects(crearClienteGiphy({ apiKey: '', base }).buscar('gatos'), { status: 401 });
});

test('error 500 del servidor → ErrorHttp 500', async () => {
  await assert.rejects(crearClienteGiphy({ apiKey: LLAVE_VALIDA, base }).buscar('error500'), { status: 500 });
});

test('timeout → ErrorHttp 504', async () => {
  const giphy = crearClienteGiphy({ apiKey: LLAVE_VALIDA, base, timeoutMs: 300 });
  await assert.rejects(giphy.buscar('lento'), { status: 504 });
});

test('cancelar con AbortController → AbortError (no se muestra como error)', async () => {
  const control = new AbortController();
  const p = crearClienteGiphy({ apiKey: LLAVE_VALIDA, base }).buscar('lento', { signal: control.signal });
  setTimeout(() => control.abort(), 50);
  await assert.rejects(p, { name: 'AbortError' });
});

test('servidor caído → ErrorHttp 0 "Sin conexión"', async () => {
  const giphy = crearClienteGiphy({ apiKey: LLAVE_VALIDA, base: 'http://127.0.0.1:9/v1' });
  await assert.rejects(giphy.buscar('gatos'), (e) => e.status === 0 && /Sin conexión/.test(e.message));
});

test('buscarVarios usa Promise.allSettled: un fallo no tumba a los demás', async () => {
  const giphy = crearClienteGiphy({ apiKey: LLAVE_VALIDA, base });
  const r = await giphy.buscarVarios(['gatos', 'error500', 'perros'], { limite: 2 });
  assert.deepEqual(r.map((x) => x.ok), [true, false, true]);
  assert.equal(r[0].gifs.length, 2);
  assert.match(r[1].error, /500/);
});
