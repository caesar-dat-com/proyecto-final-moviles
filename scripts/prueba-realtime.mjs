// Prueba del "tiempo real" del modo local: dos pestañas del mismo navegador.
// Escribe en la pestaña A y verifica que el mensaje aparece en B SIN recargar.
// Uso: node scripts/prueba-realtime.mjs http://localhost:5173/
import fs from 'node:fs';
import os from 'node:os';
import puppeteer from 'puppeteer-core';

const base = process.argv[2] || 'http://localhost:5173/';
const ejecutable = ['/usr/bin/chromium', '/usr/bin/google-chrome'].find((r) => fs.existsSync(r));
const nav = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || ejecutable, headless: true, args: ['--no-sandbox'] });
const visible = async (p, sel) => {
  for (let i = 0; i < 60; i++) {
    for (const el of await p.$$(sel)) if (await el.isVisible()) return el;
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`no visible: ${sel}`);
};
let ok = false;
let a;
let b;
try {
  // Contexto aislado (tipo incógnito): evita que la burbuja del gestor de contraseñas de Chrome
  // capture los clics después del login. Las dos pestañas comparten este contexto.
  const contexto = await nav.createBrowserContext();
  a = await contexto.newPage();
  await a.goto(base, { waitUntil: 'networkidle2' });
  await a.evaluate(() => localStorage.clear());
  await a.reload({ waitUntil: 'networkidle2' });
  await (await visible(a, 'ion-input[data-test="email"] >>> input')).type('ciudadano@demo.local');
  await (await visible(a, 'ion-input[data-test="password"] >>> input')).type('demo123');
  await (await visible(a, 'ion-button[data-test="btn-login"]')).click();
  await new Promise((r) => setTimeout(r, 1200));
  await a.goto(new URL('/app/chat', base).href, { waitUntil: 'networkidle2' });

  b = await contexto.newPage(); // comparte localStorage (misma sesión) y BroadcastChannel
  await b.goto(new URL('/app/chat', base).href, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  await a.bringToFront(); // las pestañas en segundo plano congelan requestAnimationFrame
  const texto = `prueba-realtime-${Date.now()}`;
  await (await visible(a, 'ion-input[data-test="chat-input"] >>> input')).type(texto);
  // El botón se habilita cuando React recibe el texto: esperar a que deje de estar deshabilitado
  await a.waitForFunction(
    () => [...document.querySelectorAll('ion-button[data-test="chat-enviar"]')].some((e) => e.offsetParent && !e.disabled),
    { timeout: 5000, polling: 100 },
  );
  await (await visible(a, 'ion-button[data-test="chat-enviar"]')).click();
  await b.waitForFunction((t) => document.body.innerText.includes(t), { timeout: 5000, polling: 200 }, texto);
  ok = true;
  console.log('OK: el mensaje enviado en A llegó a B en tiempo real sin recargar');
} catch (e) {
  console.error('FALLO:', e.message);
  // Diagnóstico: URL y captura de cada pestaña (fuera del repositorio)
  for (const [n, p] of [['A', a], ['B', b]]) {
    if (!p) continue;
    const ruta = `${os.tmpdir()}/realtime-fallo-${n}.png`;
    await p.bringToFront().catch(() => {});
    const limite = (pr) => Promise.race([pr, new Promise((r) => setTimeout(r, 5000))]);
    await limite(p.screenshot({ path: ruta }).catch(() => {}));
    const texto = await limite(p.evaluate(() => document.body.innerText.slice(-300)).catch(() => ''));
    console.error(`Pestaña ${n}: ${p.url()} → ${ruta}\n${texto || ''}`);
  }
} finally {
  await nav.close();
}
process.exit(ok ? 0 : 1);
