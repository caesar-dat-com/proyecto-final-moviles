// Servidor que imita la API de GIPHY (/v1/gifs/search y /v1/gifs/trending) para probar sin
// internet y sin gastar cupo de la llave. Solo escucha en 127.0.0.1.
// Uso independiente: node challenges/17-giphy/servidor-simulado.mjs [puerto]
// Llave válida en el simulador: "llave-de-prueba". Términos especiales:
//   "error500" → responde 500 · "lento" → tarda 3 s · cualquier otro → GIFs falsos.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const IMAGEN = path.resolve(aqui, '../../scripts/fixtures/foto-prueba.jpg');
export const LLAVE_VALIDA = 'llave-de-prueba';

const gifFalso = (base, q, i) => ({
  id: `${q}-${i}`,
  title: `${q} #${i + 1}`,
  url: `https://giphy.com/gifs/${q}-${i}`,
  images: { fixed_width: { url: `${base}/imagen.jpg?q=${encodeURIComponent(q)}&i=${i}`, width: '200', height: String(150 + (i % 3) * 40) } },
});

export const crearServidor = () => {
  const peticiones = [];
  const servidor = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const base = `http://${req.headers.host}`;
    peticiones.push(url.pathname + url.search);
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (url.pathname === '/imagen.jpg') {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      fs.createReadStream(IMAGEN).pipe(res);
      return;
    }
    const json = (status, cuerpo) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(cuerpo));
    };
    if (!['/v1/gifs/search', '/v1/gifs/trending'].includes(url.pathname)) return json(404, { message: 'Not Found' });
    if (url.searchParams.get('api_key') !== LLAVE_VALIDA) return json(401, { message: 'Unauthorized' });

    const q = url.searchParams.get('q') || 'tendencias';
    const limite = Number(url.searchParams.get('limit') || 25);
    const offset = Number(url.searchParams.get('offset') || 0);
    if (q === 'error500') return json(500, { message: 'Internal Error' });
    const total = q === 'vacio' ? 0 : 60;
    const responder = () =>
      json(200, {
        data: Array.from({ length: Math.max(0, Math.min(limite, total - offset)) }, (_, i) => gifFalso(base, q, offset + i)),
        pagination: { total_count: total, count: Math.min(limite, total), offset },
        meta: { status: 200, msg: 'OK' },
      });
    if (q === 'lento') setTimeout(responder, 3000);
    else responder();
  });
  return { servidor, peticiones };
};

// Ejecución directa: deja el simulador escuchando hasta Ctrl+C
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const puerto = Number(process.argv[2] || 5199);
  const { servidor } = crearServidor();
  servidor.listen(puerto, '127.0.0.1', () => console.log(`GIPHY simulado en http://127.0.0.1:${puerto}/v1 (llave: ${LLAVE_VALIDA})`));
}
