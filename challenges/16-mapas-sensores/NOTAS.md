# Notas — Challenge 16 (Mapas + sensores)

## Código

| Archivo | Qué hace |
|---|---|
| `src/pages/Challenges/Recorridos/Index.jsx` | Seguimiento: mapa, iniciar/detener, dirección, batería, avisos, foto con marca de agua |
| `src/pages/Challenges/Recorridos/Historial.jsx` | Historial agrupado por día, ver la ruta, exportar e importar JSON, borrar |
| `src/pages/Challenges/Recorridos/Recorridos.module.scss` | Estilos |
| `src/components/RutaMapa/RutaMapa.jsx` + `.module.scss` | Mapa leaflet con `Polyline` de la ruta |
| `src/helpers/recorridos.js` | Lógica pura: Haversine, filtro de ruido < 5 m, velocidad, estado, avisos, batería baja, agrupación por día, JSON |
| Hooks reutilizados | `useGeolocation` (watchPosition), `useNetwork`, `useHaptics`, `useCamera`, `useLocalStorage`, `useDireccion` |
| Hook nuevo | `useDevice` (batería) |

Correspondencia con el enunciado:
- wifi → dirección: `useDireccion` solo se llama si `conectado`.
- ¿se mueve?: `velocidadKmh` y `estadoMovimiento`.
- JSON e historial: los recorridos se guardan en `useLocalStorage('challenge16:recorridos')` y la página
  `Historial` exporta e importa el archivo `.json`.
- Marca de agua: un `canvas` dibuja las coordenadas, la dirección y la fecha sobre la foto.
- Vibrar al iniciar: `vibrar(400)`.
- Batería baja: `bateriaBaja()` (< 15 % y sin cargar) → `detener('batería baja')`.
- Avisos: `avisosInteligentes()`.

## Respaldos web y limitaciones

- El JSON vive en `localStorage` y se descarga con un `Blob`. No usa `@capacitor/filesystem` porque no
  está instalado. En el teléfono, la descarga depende del WebView.
- En un PC el GPS casi no cambia. El botón **«Simular paso»** (solo web) agrega puntos a unos 40 m.
  En la captura los pasos simulados van con 300 ms de diferencia, por eso el estado sale «Movimiento
  rápido». Es un efecto de la simulación, no un error del cálculo.
- La vibración no se nota en un PC (ver Challenge 14).
- La dirección usa Nominatim (OpenStreetMap), como el resto de la app. Las capturas usaron una
  ubicación simulada en Cali (3.447, -76.541).

## Pruebas reales

```bash
cd app && node --test challenges/16-mapas-sensores/prueba.mjs   # 8 pruebas de la lógica
```

Capturas: `challenges/capturas/10` (seguimiento), `11` (guardado + foto con marca de agua) y `12` (historial).
