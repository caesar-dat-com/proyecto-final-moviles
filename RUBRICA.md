# Auditoría contra la rúbrica — «Entrega Proyecto Final»

Revisión hecha el 21-nov-2026 criterio por criterio contra el código de este repositorio (no de memoria).
Fuente de la rúbrica: `Entrega Proyecto Final.pdf` del curso (Plataformas Móviles, UAO 14780).
Estados: ✅ cumple · ⚠️ cumple con limitación (explicada en una línea) · ❌ no cumple.

## Productos de la entrega

| # | Criterio de la rúbrica | Dónde está en el repo | Evidencia | Estado |
|---|---|---|---|---|
| 1 | Prototipo de la app con herramientas de IA (Lovable) | `prototipo/` (`index.html`, `app.js`, `estilos.css`, `datos.js`, `iconos.js`, `README.md`) | `prototipo/capturas/` (22 PNG: 19 pantallas + tablero); servido con `python3 -m http.server` → `prototipo/` 200 | ⚠️ No es de Lovable: es un prototipo navegable HTML generado con asistencia de IA que lo sustituye; se publica en GitHub Pages (enlace previsto, aún no activado). |
| 2 | App móvil con fiel aspecto visual respecto al prototipo (navegación, menús, mapas…) | `src/pages/*`, `src/components/shared/Menu.jsx`, `src/components/MapView/` ↔ `prototipo/` | Comparación `capturas/03-inicio.png` ↔ `prototipo/capturas/03-inicio.png` (mismos textos, colores, pestañas, menú); tabla pantalla↔archivo en `prototipo/README.md` | ⚠️ El prototipo se construyó después de la app, replicándola; el mapa del prototipo es una ilustración SVG (la app usa Leaflet). |
| 3 | Desarrollo en Ionic | `package.json` (`@ionic/react` 9, `@ionic/react-router` 9), `src/App.jsx` (`IonApp`, `IonReactRouter`) | `npm run build` sin errores (ver sección Verificación) | ✅ |
| 4 | Carpeta **Helpers** con archivo de funciones generales | `src/helpers/utils.js` (+ `brand.js`, `geocoding.js`, `localDb.js`, `seeds.js`, `archivos.js`, `giphy.js`, `recorridos.js`) | `prueba-formato.mjs` OK (`formatearPrecio` de `utils.js`) | ✅ |
| 5 | Carpeta **Context** | `src/context/AuthContext.jsx` (usado en `App.jsx` y `routes/AppRoutes.jsx`) | Login/rutas por rol funcionan (prueba de rutas) | ✅ |
| 6 | Carpeta **Pages** con `Index.jsx` + `Index.module.scss` por página | `src/pages/{Login,Register,Home,Map,Orders,Chat,Profile,Admin}/Index.jsx` + `Index.module.scss`; `src/pages/Challenges/**` | Árbol de `src/` | ✅ (la rúbrica pone `Pages/Index/` como ejemplo; aquí cada página tiene su carpeta con `Index.jsx`) |
| 7 | Carpeta **Components** con `CardItem.jsx`/`.module.scss` y **Shared** con `Menu.jsx`/`Menu.module.scss` | `src/components/CardItem/CardItem.jsx` + `.module.scss`; `src/components/shared/Menu.jsx` + `Menu.module.scss`, `Header.jsx` + `.module.scss` | `capturas/03-inicio.png` (tarjetas `CardItem`), `capturas/11-menu.png` (menú) | ✅ |
| 8 | Carpeta **Hooks** con custom hooks | `src/hooks/` (12 hooks: `useAuth`, `useCollection`, `useRealtimeChat`, `useGeolocation`, `useCamera`, `useHaptics`, `useNetwork`, `useLocalStorage`, `useDireccion`, `useAccelerometer`, `useDevice`, `useGiphy`…) | Árbol de `src/` | ✅ |
| 9 | Carpeta **Routes** con `AppRoutes`, `UserRoutes`, `AdminRoutes` | `src/routes/AppRoutes.jsx`, `UserRoutes.jsx`, `AdminRoutes.jsx` (+ `ChallengeRoutes.jsx`) | `scripts/prueba-rutas.mjs`: 34/34 rutas OK con ciudadano y funcionario | ✅ |
| 10 | Uso de temas del curso: React | Toda `src/` (componentes, estado, efectos, contexto, hooks) | Build + pruebas | ✅ |
| 11 | Sensores | `useGeolocation` (GPS + `watchPosition`), `useCamera`, `useHaptics`, `useNetwork`, `useAccelerometer` (`@capacitor/motion`), `useDevice` (batería) | `capturas/04-modal-reporte.png` (ubicación + foto); `challenges/capturas/02-08` (página por sensor) | ⚠️ Probado en navegador (ubicación simulada); no probado en teléfono físico. |
| 12 | Memoria (almacenamiento local) | `src/hooks/useLocalStorage.js`, `src/helpers/localDb.js`, caché de `src/helpers/geocoding.js` | Modo local persiste sesión y datos al recargar (prueba-realtime) | ✅ |
| 13 | Bases de datos | `supabase/schema.sql` (4 tablas + RLS), `supabase/seed.sql`, `src/hooks/useCollection.js` | `supabase/pruebas-locales/salidas/1-correr-publico.txt` (Postgres 16 real) | ⚠️ Probado contra PostgreSQL 16 real con un shim de Supabase; no contra un proyecto supabase.com (no hay llaves). |
| 14 | Firebase | — (se usó Supabase, visto en Clase 09) | Justificación en `DOCUMENTO_FINAL.md` §5.1 | ⚠️ No se usa Firebase; Supabase cubre auth, base de datos, tiempo real y archivos. |
| 15 | Comunicación en tiempo real | `src/hooks/useRealtimeChat.js` (`postgres_changes` / `BroadcastChannel`), `useCollection` con `realtime: true` | `node scripts/prueba-realtime.mjs` → «OK: el mensaje enviado en A llegó a B en tiempo real sin recargar»; `supabase/pruebas-locales/salidas/3-realtime-notify.txt` | ⚠️ En modo local solo entre pestañas del mismo navegador; entre dispositivos requiere el proyecto Supabase. |
| 16 | Uso de backend | Supabase: `src/lib/supabase.js`, `supabase/*.sql`, `supabase/README.md` | Pruebas RLS/cascadas/trigger/storage en `supabase/pruebas-locales/salidas/` | ⚠️ Igual que #13: backend no desplegado todavía. |
| 17 | Aporte de cada integrante en su rama | Rama `proyecto-final-cesar-reyes` (integrante único) | `git ls-remote` del repo publicado: `refs/heads/main` y `refs/heads/proyecto-final-cesar-reyes` | ✅ |
| 18 | Funcionalidad de chat, mapas u otros con BD en tiempo real | Chat: `src/pages/Chat/Index.jsx`; mapa: `src/pages/Map/Index.jsx`, `src/components/MapView/MapView.jsx` (Leaflet; reportes en vivo vía `useCollection`) | `capturas/07-chat-reporte.png`, `08-chat-comunidad.png`, `09-mapa.png`, `16-funcionario-mapa.png`; prueba-realtime OK | ✅ (con la limitación de #15) |
| 19 | Almacenamiento en BD, login y registro reales, transacción de datos | `src/hooks/useAuth.js` (`signUp`, `signInWithPassword`, `signOut`), `src/pages/Login`, `src/pages/Register`; CRUD en `useCollection.js` | `capturas/01-login.png`, `02-registro.png`, `05-reporte-creado.png`, `13-funcionario-reportes.png` | ⚠️ Lo ejecutado en navegador es el modo local (sin llaves); el camino Supabase Auth está escrito pero no se ha corrido contra supabase.com. |
| 20 | Consumo de API externa | Nominatim: `src/helpers/geocoding.js`, `src/hooks/useDireccion.js`; tiles OSM en `MapView.jsx`; GIPHY (Challenge 17): `src/helpers/giphy.js`, `src/hooks/useGiphy.js` | Direcciones reales en `capturas/04-modal-reporte.png` y `09-mapa.png`; `node --test challenges/17-giphy/prueba.mjs` 10/10 | ✅ (GIPHY probado solo contra simulador: falta llave propia) |
| 21 | Documento final con alcance y tecnologías, anexado en GIT | `DOCUMENTO_FINAL.md` | — | ✅ |
| 22 | Enlaces de GIT con ramas mezcladas sobre `main` | https://github.com/caesar-dat-com/proyecto-final-moviles | `git ls-remote`: `main` y `proyecto-final-cesar-reyes` | ✅ (el contenido de este cierre aún no está subido: lo sube César) |
| 23 | README con integrantes, enlaces al prototipo y lista de APIs de backend consumidas | `README.md` (secciones Integrantes, Enlaces, APIs consumidas) | — | ✅ (enlace del prototipo válido cuando se active GitHub Pages) |
| 24 | Capacidades del dispositivo empaquetadas como app móvil | `capacitor.config.json`, `MOVIL.md` | En este PC no hay Android SDK ni gradle (`which gradle sdkmanager` vacío) | ⚠️ No se compiló APK; pasos exactos en `MOVIL.md`. |

## Extras entregados

| Qué | Dónde | Evidencia |
|---|---|---|
| Challenges 14-17 integrados en la app (menú ☰ → «Challenges 14-17») | `challenges/` (enunciados, notas, pruebas), `src/pages/Challenges/**`, `src/routes/ChallengeRoutes.jsx` | `challenges/capturas/` (15 PNG); `node --test` 8/8 y 10/10; 12 rutas de challenges OK con ambos roles |
| Pruebas del backend en Postgres real | `supabase/pruebas-locales/` | `salidas/*.txt` |

## Verificación del cierre (21-nov-2026)

```
npm run build                         → ✓ built in 1.49s (solo aviso de chunk > 500 kB)
curl http://127.0.0.1:5173/           → 200
node scripts/prueba-rutas.mjs         → OK: todas las rutas cargan sin errores de página (34/34)
node scripts/prueba-realtime.mjs      → OK: el mensaje enviado en A llegó a B en tiempo real sin recargar
node scripts/prueba-formato.mjs       → OK: formatearPrecio respeta BRAND.valor (días y moneda)
node --test challenges/16-…/prueba.mjs → tests 8, pass 8, fail 0
node --test challenges/17-…/prueba.mjs → tests 10, pass 10, fail 0
curl http://127.0.0.1:4173/prototipo/ → 200
```
