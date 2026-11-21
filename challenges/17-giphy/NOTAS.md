# Notas — Challenge 17 (GIPHY)

## Código

| Archivo | Qué hace |
|---|---|
| `src/helpers/giphy.js` | Servicio/cliente: `URLSearchParams`, `res.ok` → `ErrorHttp`, timeout (`AbortSignal.timeout`), cancelación (`AbortSignal.any`), `buscar`, `tendencias`, `buscarVarios` (`Promise.allSettled`). No depende de Vite: también corre en node |
| `src/hooks/useGiphy.js` | Hook: debounce de 400 ms; cancela la petición anterior si cambia el término; paginación con `offset` |
| `src/pages/Challenges/Gifs/Index.jsx` + `.module.scss` | `IonSearchbar`, sugerencias, grilla de 2 columnas, scroll infinito, errores |
| `challenges/17-giphy/buscar.mjs` | El mismo cliente desde la consola (`node`) |
| `challenges/17-giphy/servidor-simulado.mjs` | Imita a GIPHY en 127.0.0.1 (para pruebas y capturas sin internet) |
| `challenges/17-giphy/prueba.mjs` | 10 pruebas del cliente contra el simulador |

`.env.example` ahora incluye `VITE_GIPHY_KEY=` y `VITE_GIPHY_BASE=` (opcional).

## Cómo correrlo con GIPHY de verdad

```bash
cd app
echo "VITE_GIPHY_KEY=<tu llave de developers.giphy.com>" >> .env
npm run dev                                   # menú → Challenges 14-17 → 17
node challenges/17-giphy/buscar.mjs "gatos" 5 # versión consola (lee la llave de .env)
```

## Cómo correrlo sin llave ni internet (simulador)

```bash
node challenges/17-giphy/servidor-simulado.mjs 5199     # terminal 1
VITE_GIPHY_KEY=llave-de-prueba VITE_GIPHY_BASE=http://127.0.0.1:5199/v1 npm run dev   # terminal 2
GIPHY_BASE=http://127.0.0.1:5199/v1 GIPHY_API_KEY=llave-de-prueba node challenges/17-giphy/buscar.mjs gatos 3
node --test challenges/17-giphy/prueba.mjs
```

## Limitación honesta

**No se hizo ninguna llamada a la API real de GIPHY.** En este PC no hay llave propia, y decidí no usar
la llave que aparece en la diapositiva. Por eso las capturas `13`-`15` muestran datos del **simulador**:
las imágenes son la foto de prueba del proyecto, no GIFs reales. El simulador devuelve el mismo formato
JSON documentado por GIPHY (`data[].images.fixed_width`, `pagination.total_count`). Aun así, falta una
prueba con la API real y la llave de César.
