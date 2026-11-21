// Prueba de humo de rutas: inicia sesión con cada rol y visita las rutas principales y las de
// los Challenges 14-17. Falla si alguna ruta redirige a otra, queda en blanco o lanza un error de página.
// Uso: node scripts/prueba-rutas.mjs http://localhost:5173/
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const base = process.argv[2] || 'http://localhost:5173/';
const ejecutable = ['/usr/bin/chromium', '/usr/bin/google-chrome'].find((r) => fs.existsSync(r));
const nav = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || ejecutable, headless: true, args: ['--no-sandbox'] });

const CUENTAS = [
  { rol: 'ciudadano', email: 'ciudadano@demo.local', clave: 'demo123', rutas: ['inicio', 'mapa', 'reportes', 'chat', 'perfil'] },
  { rol: 'funcionario', email: 'funcionario@demo.local', clave: 'admin123', rutas: ['inicio', 'reportes', 'chat', 'mapa', 'perfil'] },
];
const CHALLENGES = [
  'challenges', 'challenges/14', 'challenges/14/geolocalizacion', 'challenges/14/camara', 'challenges/14/movimiento',
  'challenges/14/dispositivo', 'challenges/14/haptica', 'challenges/14/red', 'challenges/15', 'challenges/16',
  'challenges/16/historial', 'challenges/17',
];
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let fallos = 0;

try {
  for (const c of CUENTAS) {
    const ctx = await nav.createBrowserContext();
    const p = await ctx.newPage();
    const errores = [];
    p.on('pageerror', (e) => errores.push(e.message));
    await p.goto(base, { waitUntil: 'networkidle2' });
    await p.evaluate(() => localStorage.clear());
    await p.reload({ waitUntil: 'networkidle2' });
    await (await p.waitForSelector('ion-input[data-test="email"] >>> input', { visible: true })).type(c.email);
    await (await p.waitForSelector('ion-input[data-test="password"] >>> input', { visible: true })).type(c.clave);
    await (await p.waitForSelector('ion-button[data-test="btn-login"]', { visible: true })).click();
    await espera(1500);
    for (const r of [...c.rutas, ...CHALLENGES]) {
      const url = new URL(`/app/${r}`, base).href;
      await p.goto(url, { waitUntil: 'networkidle2' });
      await espera(500);
      const final = new URL(p.url()).pathname;
      const texto = (await p.evaluate(() => document.body.innerText)).trim();
      const ok = final === `/app/${r}` && texto.length > 20 && errores.length === 0;
      if (!ok) fallos++;
      console.log(`${ok ? 'OK  ' : 'FALLO'} ${c.rol.padEnd(11)} /app/${r}${final !== `/app/${r}` ? ` → ${final}` : ''}${errores.length ? ` errores: ${errores.join(' | ')}` : ''}`);
      errores.length = 0;
    }
    await ctx.close();
  }
} finally {
  await nav.close();
}
console.log(fallos ? `FALLO: ${fallos} rutas con problemas` : 'OK: todas las rutas cargan sin errores de página');
process.exit(fallos ? 1 : 0);
