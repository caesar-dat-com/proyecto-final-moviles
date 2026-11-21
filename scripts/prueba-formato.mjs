// Prueba de formatearPrecio (helpers/utils.js) dentro del navegador, con el servidor de Vite.
// Verifica el formato 'dias' de ReportaCali y que el formato 'moneda' siga funcionando.
// Uso: node scripts/prueba-formato.mjs http://localhost:5173/
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const base = process.argv[2] || 'http://localhost:5173/';
const ejecutable = ['/usr/bin/chromium', '/usr/bin/google-chrome'].find((r) => fs.existsSync(r));
const nav = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || ejecutable, headless: true, args: ['--no-sandbox'] });
let ok = false;
try {
  const pagina = await (await nav.createBrowserContext()).newPage();
  await pagina.goto(base, { waitUntil: 'networkidle2' });
  const r = await pagina.evaluate(async () => {
    const { formatearPrecio } = await import('/src/helpers/utils.js');
    const { BRAND } = await import('/src/helpers/brand.js');
    const dias = [formatearPrecio(3), formatearPrecio(1), formatearPrecio('10'), formatearPrecio(null)];
    const original = BRAND.valor;
    BRAND.valor = { ...original, formato: 'moneda' };
    const moneda = formatearPrecio(60000);
    BRAND.valor = undefined; // sin configuración: comportamiento anterior (moneda)
    const sinConfig = formatearPrecio(60000);
    BRAND.valor = original;
    return { dias, moneda, sinConfig };
  });
  console.log(JSON.stringify(r));
  const normal = (t) => t.replace(/\s/g, ' ');
  const esperado = ['3 días hábiles', '1 día hábil', '10 días hábiles', '0 días hábiles'];
  ok =
    JSON.stringify(r.dias) === JSON.stringify(esperado) &&
    /^\$ ?60\.000$/.test(normal(r.moneda)) &&
    normal(r.moneda) === normal(r.sinConfig);
  console.log(ok ? 'OK: formatearPrecio respeta BRAND.valor (días y moneda)' : 'FALLO: salida inesperada');
} catch (e) {
  console.error('FALLO:', e.message);
} finally {
  await nav.close();
}
process.exit(ok ? 0 : 1);
