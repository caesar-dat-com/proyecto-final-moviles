# Challenges 14-17 — Plataformas Móviles (UAO 14780), Corte 3

Los enunciados de este índice son **reconstruidos**: no hay un documento del profesor con los
números 14-17. Cada `ENUNCIADO.md` cita las diapositivas de donde sale.

## Qué se encontró en el material

La última diapositiva de cada clase trae un reto con el título «CHALLENGE NN». Su numeración **no coincide** con la hoja de notas:

| Clase | Diapositiva | Título en la diapositiva | Tema |
|---|---|---|---|
| 07 Storage & Sensors | 27 | CHALLENGE 06 | Firebase + realtime + Dexie + red |
| 08 Sensors | 42 | CHALLENGE 07 | Un botón y una página por sensor |
| 09 Supabase | 23 | CHALLENGE 08 | Tabla tareas con RLS, auth, CRUD, lista en vivo, cámara |
| 10 APIs & Maps | 8 | CHALLENGE 08 (número repetido) | Mapas + sensores (seguimiento, historial JSON, batería…) |
| 11 API requests | 34 | CHALLENGE 09 | Buscador de GIFs con GIPHY |
| Diseño UI | — | (no hay reto) | Lovable / Figma / Refero: alimenta el proyecto final |

Supuesto: la hoja cuenta las actividades de otra forma (talleres y quizzes incluidos) y se mantiene el
orden de las clases. Así, los **cuatro últimos retos** (clases 08-11) corresponden a los Challenges 14-17
del Corte 3, y el de la Clase 07 sería el 13, del corte anterior.

## Índice

| # | Carpeta | Tema | Dónde corre | Pruebas |
|---|---|---|---|---|
| 14 | [`14-sensores/`](14-sensores/) | Un botón por sensor y una página por cada uno (GPS, cámara, acelerómetro, dispositivo, vibración, red) | App → `/app/challenges/14` | Capturas 02-08 |
| 15 | [`15-supabase-tareas/`](15-supabase-tareas/) | Tareas con Supabase: RLS, auth, CRUD, realtime, foto a `avatars` (+ `tareas.sql`) | App → `/app/challenges/15` | Captura 09 (modo local) |
| 16 | [`16-mapas-sensores/`](16-mapas-sensores/) | Seguimiento en el mapa con sensores, historial JSON por día, foto con ubicación | App → `/app/challenges/16` | `node --test …/prueba.mjs` (8) + capturas 10-12 |
| 17 | [`17-giphy/`](17-giphy/) | Buscador GIPHY con fetch, `.env`, AbortController y errores | App → `/app/challenges/17` + `node buscar.mjs` | `node --test …/prueba.mjs` (10) + capturas 13-15 (simulador) |

## Cómo correr

```bash
cd app
npm install
npm run dev            # http://localhost:5173
# Iniciar sesión (sin .env = modo local): ciudadano@demo.local / demo123
# Menú ☰ → «Challenges 14-17»

node --test challenges/16-mapas-sensores/prueba.mjs
node --test challenges/17-giphy/prueba.mjs
```

Para regenerar las capturas (con `npm run dev` y el simulador de GIPHY corriendo; ver `17-giphy/NOTAS.md`):

```bash
node scripts/capturas.mjs http://127.0.0.1:5173/ challenges/capturas challenges/guion-capturas.json
```

## Archivos de la app tocados

- Nuevos: `src/pages/Challenges/**`, `src/routes/ChallengeRoutes.jsx`, `src/components/RutaMapa/*`,
  `src/hooks/useAccelerometer.js`, `src/hooks/useDevice.js`, `src/hooks/useGiphy.js`,
  `src/helpers/recorridos.js`, `src/helpers/giphy.js`.
- Modificados: `src/routes/UserRoutes.jsx` y `AdminRoutes.jsx` (rutas), `src/components/shared/Menu.jsx`
  (entrada «Challenges 14-17»), `.env.example` (llaves GIPHY) y `package.json`/`package-lock.json`
  (`@capacitor/motion` y `@capacitor/device`).
