# Resultado — Challenges 14-17 (Plataformas Móviles, UAO 14780)

Fecha: 21-nov-2026 · Agente: mark02 · Entregables en `app/challenges/` (índice: `app/challenges/README.md`).

## Hallazgo importante sobre el material

Las diapositivas **sí traen el texto de los retos**: la última diapositiva de cada clase dice «CHALLENGE NN».
Lo que no coincide es la **numeración** con la hoja de notas:

| Clase | Diapositiva | Título en la diapositiva |
|---|---|---|
| 07 Storage & Sensors | 27 | CHALLENGE 06 |
| 08 Sensors | 42 | CHALLENGE 07 |
| 09 Supabase | 23 | CHALLENGE 08 |
| 10 APIs & Maps | 8 | CHALLENGE 08 (número repetido) |
| 11 API requests | 34 | CHALLENGE 09 |
| Diseño UI | — | no tiene reto (alimenta el proyecto final: Lovable, Figma) |

Supuesto: los cuatro últimos retos (clases 08-11) son los Challenges 14-17, en orden. Entonces el
CHALLENGE 06 de la Clase 07 sería el 13, del corte anterior. **César debería confirmar este mapeo.** Si la
hoja cuenta distinto (por ejemplo, 14 = Clase 07), sobraría el de la Clase 11 y faltaría el de la Clase 07
(Firebase + Dexie), que no está resuelto.

## Por challenge

| # | Reconstruido de | Seguridad del contenido | Seguridad del número | Probado con salida real | No probado |
|---|---|---|---|---|---|
| 14 Sensores | Clase 08, slides 2-42 (reto en la 42) | **Alta**: texto literal del reto | Media | Build; 7 capturas en Chrome headless (inicio + 6 sensores) | Teléfono real (Android/iOS); filesystem, local-notifications y push no se implementaron |
| 15 Supabase tareas | Clase 09, slides 7-23 (reto en la 23) | **Alta** | Media | Modo local (sin `.env`): crear 3 tareas, completar 1 y subir foto (captura 09) | **Contra un Supabase real** (no hay llaves en el PC); `tareas.sql` no se ejecutó |
| 16 Mapas + sensores | Clase 10, slides 2-8 (reto en la 8) | **Alta** en la lista; media en el alcance («some examples») | Media | 8/8 pruebas de lógica en node; 3 capturas (seguimiento con pasos simulados, foto con marca de agua, historial) | GPS en movimiento real; vibración física; OpenCage (no implementado) |
| 17 GIPHY | Clase 11, slides 2-34 (reto en la 34) | **Alta** | Media | 10/10 pruebas del cliente contra el simulador; CLI `buscar.mjs` contra el simulador; 3 capturas (inicio, resultados y error 500) | **API real de GIPHY**: no hay llave propia y no usé la llave de la diapositiva. Las capturas muestran datos simulados |

## Salidas reales (copiadas de la terminal)

`npm install && npm run build` (al terminar):
```
up to date, audited 118 packages in 2s
✓ 383 modules transformed.
✓ built in 1.20s
```
(Solo queda la advertencia de un chunk mayor de 500 kB, que ya existía antes.) `npx oxlint src` → rc=0, solo warnings.

`node --test challenges/16-mapas-sensores/prueba.mjs`:
```
ok 1 - distancia Haversine entre dos puntos de Cali
ok 2 - distancia total suma los tramos
ok 3 - debeAgregar ignora ruido del GPS menor a 5 m
ok 4 - velocidad y estado de movimiento
ok 5 - avisos inteligentes: quieto, sin conexión, rápido
ok 6 - batería baja solo si < 15 % y no está cargando
ok 7 - historial agrupado por día, más reciente primero
ok 8 - ida y vuelta a JSON conserva los recorridos
# tests 8
# pass 8
# fail 0
```

`node --test challenges/17-giphy/prueba.mjs`:
```
ok 1 - buscar devuelve GIFs simplificados y la paginación
ok 2 - los parámetros viajan con URLSearchParams (api_key, q, limit, offset, rating, lang)
ok 3 - término vacío no hace petición
ok 4 - llave inválida → ErrorHttp 401 (fetch no lanza solo: se revisa res.ok)
ok 5 - sin llave → 401 sin llamar al servidor
ok 6 - error 500 del servidor → ErrorHttp 500
ok 7 - timeout → ErrorHttp 504
ok 8 - cancelar con AbortController → AbortError (no se muestra como error)
ok 9 - servidor caído → ErrorHttp 0 "Sin conexión"
ok 10 - buscarVarios usa Promise.allSettled: un fallo no tumba a los demás
# tests 10
# pass 10
# fail 0
```

`npm run dev` + curl (Vite en 127.0.0.1:5173, simulador de GIPHY en 127.0.0.1:5199):
```
200
vite /app/challenges -> 200
sim -> 200
60 resultados para «gatos» (mostrando 3) desde http://127.0.0.1:5199/v1
```

`node scripts/capturas.mjs http://127.0.0.1:5173/ challenges/capturas challenges/guion-capturas.json` produjo 15 PNG
(01-menu … 15-c17-giphy-error). El único error de consola fue
`Failed to load resource: the server responded with a status of 500`, que es el caso de error 500
provocado a propósito. Una corrida anterior falló con «Session closed» (Chrome) y la repetí.
Revisé las capturas una por una.

## Cambios en la app

- Nuevos: `src/pages/Challenges/**`, `src/routes/ChallengeRoutes.jsx`, `src/components/RutaMapa/*`,
  `src/hooks/{useAccelerometer,useDevice,useGiphy}.js`, `src/helpers/{recorridos,giphy}.js`.
- Modificados: `src/routes/UserRoutes.jsx`, `src/routes/AdminRoutes.jsx`, `src/components/shared/Menu.jsx`
  (entrada «Challenges 14-17»), `.env.example` (`VITE_GIPHY_KEY` y `VITE_GIPHY_BASE`), `package.json` y
  `package-lock.json` (agregué `@capacitor/motion` ^8.0.1 y `@capacitor/device` ^8.0.3).
- `npm install` creó `node_modules/` (no existía) y `npm run build` regeneró `dist/`.

## Pendiente para César

1. Confirmar el mapeo entre los números de las diapositivas (07-09) y los de la hoja (14-17).
2. Challenge 15: correr `tareas.sql` en su Supabase, crear `.env` y probar en dos pestañas.
3. Challenge 17: poner su llave `VITE_GIPHY_KEY` y probar con la API real.
4. Si el profesor exige una «app nueva vacía» por reto (lo pide el 14), separar las páginas en otro proyecto.
