// Buscador de GIFs por consola con el mismo cliente que usa la app (src/helpers/giphy.js).
// Uso:
//   node challenges/17-giphy/buscar.mjs "gatos" [limite]
// La llave se lee de la variable GIPHY_API_KEY o de VITE_GIPHY_KEY en app/.env.
// Para probar sin internet: GIPHY_BASE=http://127.0.0.1:5199/v1 GIPHY_API_KEY=llave-de-prueba
// (con servidor-simulado.mjs corriendo).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearClienteGiphy } from '../../src/helpers/giphy.js';

const aqui = path.dirname(fileURLToPath(import.meta.url));

// Lector mínimo de .env (sin dependencias)
const leerEnv = () => {
  const ruta = path.resolve(aqui, '../../.env');
  if (!fs.existsSync(ruta)) return {};
  return Object.fromEntries(
    fs.readFileSync(ruta, 'utf8').split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]),
  );
};

const env = leerEnv();
const apiKey = process.env.GIPHY_API_KEY || env.VITE_GIPHY_KEY;
const base = process.env.GIPHY_BASE || env.VITE_GIPHY_BASE || 'https://api.giphy.com/v1';
const [termino, limite = '10'] = process.argv.slice(2);

if (!termino) {
  console.error('Uso: node challenges/17-giphy/buscar.mjs "<término>" [limite]');
  process.exit(1);
}
if (!apiKey) {
  console.error('Falta la llave: exporta GIPHY_API_KEY o pon VITE_GIPHY_KEY en app/.env');
  process.exit(1);
}

const giphy = crearClienteGiphy({ apiKey, base });
try {
  const { gifs, total } = await giphy.buscar(termino, { limite: Number(limite) });
  console.log(`${total} resultados para «${termino}» (mostrando ${gifs.length}) desde ${base}`);
  gifs.forEach((g, i) => console.log(`${String(i + 1).padStart(2)}. ${g.titulo}\n    ${g.url}`));
} catch (e) {
  console.error(`Error ${e.status ?? ''}: ${e.message}`);
  process.exit(2);
}
