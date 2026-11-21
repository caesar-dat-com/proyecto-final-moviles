// Capturas automáticas con puppeteer-core + Chrome/Chromium del sistema.
// Uso: node scripts/capturas.mjs <url> <dirSalida> <guion.json>
// Pasos del guion: {"goto":"/ruta"} {"clickTexto":"..."} {"click":"selector"}
//   {"escribir":["selector","texto"]} {"geo":[lat,lng]} {"shot":"nombre"} {"wait":ms}
//   {"limpiarStorage":true} {"subirFoto":["selector","ruta/imagen.jpg"]} {"esperarTexto":"texto"}
// Los selectores admiten ">>>" para atravesar Shadow DOM (p. ej. ion-input[data-test="email"] >>> input).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const [, , base, dir, guionRuta] = process.argv;
if (!base || !dir || !guionRuta) {
  console.error('Uso: node scripts/capturas.mjs <url> <dir> <guion.json>');
  process.exit(1);
}
const guion = JSON.parse(fs.readFileSync(guionRuta, 'utf8'));
fs.mkdirSync(dir, { recursive: true });

const ejecutable = ['/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser'].find((r) => fs.existsSync(r));
const navegador = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || ejecutable,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-fake-ui-for-media-stream'],
});

// Ionic mantiene en el DOM las páginas anteriores (ocultas): se busca la coincidencia VISIBLE
const buscarVisible = async (pagina, selector, timeout = 8000) => {
  const limite = Date.now() + timeout;
  while (Date.now() < limite) {
    for (const el of await pagina.$$(selector)) {
      if (await el.isVisible()) return el;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`No se encontró visible: ${selector}`);
};

const errores = [];
let fallo = false;
let pagina;
try {
  // Contexto aislado (tipo incógnito): con el perfil por defecto, tras iniciar sesión Chrome
  // muestra la burbuja del gestor de contraseñas y deja de entregar los clics a la página.
  const contexto = await navegador.createBrowserContext();
  pagina = await contexto.newPage();
  await pagina.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  pagina.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  await contexto.overridePermissions(new URL(base).origin, ['geolocation']);
  // Ubicación simulada por defecto: barrio San Antonio, Cali (se cambia con el paso "geo")
  await pagina.setGeolocation({ latitude: 3.447, longitude: -76.541, accuracy: 20 });
  await pagina.goto(base, { waitUntil: 'networkidle2' });

  let n = 0;
  for (const paso of guion) {
    const [accion, valor] = Object.entries(paso)[0];
    switch (accion) {
      case 'goto':
        await pagina.goto(new URL(valor, base).href, { waitUntil: 'networkidle2' });
        break;
      case 'limpiarStorage':
        await pagina.evaluate(() => localStorage.clear());
        await pagina.reload({ waitUntil: 'networkidle2' });
        break;
      case 'geo':
        await pagina.setGeolocation({ latitude: valor[0], longitude: valor[1], accuracy: 20 });
        break;
      case 'click': {
        const el = await buscarVisible(pagina, valor);
        await el.click();
        break;
      }
      case 'clickTexto': {
        const el = await buscarVisible(pagina, `::-p-text(${valor})`);
        await el.click();
        break;
      }
      case 'escribir': {
        const el = await buscarVisible(pagina, valor[0]);
        await el.click({ clickCount: 3 });
        await el.type(valor[1], { delay: 15 });
        break;
      }
      case 'subirFoto': {
        // Click en el botón que abre el selector de archivos y le entrega la imagen
        const el = await buscarVisible(pagina, valor[0]);
        const [selector] = await Promise.all([pagina.waitForFileChooser({ timeout: 8000 }), el.click()]);
        await selector.accept([path.resolve(valor[1])]);
        break;
      }
      case 'esperarTexto':
        await pagina.waitForFunction((t) => document.body.innerText.includes(t), { timeout: 15000, polling: 250 }, valor);
        break;
      case 'wait':
        await new Promise((r) => setTimeout(r, valor));
        break;
      case 'shot': {
        n += 1;
        const archivo = path.join(dir, `${String(n).padStart(2, '0')}-${valor}.png`);
        await new Promise((r) => setTimeout(r, 600));
        await pagina.screenshot({ path: archivo });
        console.log('captura', archivo);
        break;
      }
      default:
        console.warn('paso desconocido', paso);
    }
  }
} catch (e) {
  fallo = true;
  console.error('FALLO:', e.message);
  // Captura de diagnóstico fuera de la carpeta de capturas
  const diag = path.join(os.tmpdir(), 'capturas-fallo.png');
  await pagina?.screenshot({ path: diag }).catch(() => {});
  console.error('Captura de diagnóstico:', diag);
} finally {
  await navegador.close();
}
if (errores.length) console.log('Errores de consola:\n' + errores.join('\n'));
process.exit(fallo ? 1 : 0);
