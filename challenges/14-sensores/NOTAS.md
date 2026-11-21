# Notas — Challenge 14 (Sensores)

## Código

| Archivo | Qué hace |
|---|---|
| `src/pages/Challenges/Sensores/Index.jsx` | Inicio con un botón por sensor (`SENSORES`) |
| `src/pages/Challenges/Sensores/Geolocalizacion.jsx` | `getCurrentPosition` y `watchPosition` (hook existente `useGeolocation`) + mapa |
| `src/pages/Challenges/Sensores/Camara.jsx` | `Camera.getPhoto` (hook existente `useCamera`) |
| `src/pages/Challenges/Sensores/Movimiento.jsx` | `Motion.addListener('accel' / 'orientation')` (hook nuevo `useAccelerometer`) |
| `src/pages/Challenges/Sensores/Dispositivo.jsx` | `Device.getInfo` y `getBatteryInfo` (hook nuevo `useDevice`) |
| `src/pages/Challenges/Sensores/Haptica.jsx` | `Haptics.impact / notification / vibrate` (hook existente `useHaptics`) |
| `src/pages/Challenges/Sensores/Red.jsx` | `Network.getStatus` + `networkStatusChange` (hook existente `useNetwork`) |
| `src/pages/Challenges/Sensores/Sensores.module.scss` | Estilos de las 7 páginas |
| `src/hooks/useAccelerometer.js`, `src/hooks/useDevice.js` | Hooks nuevos (uno por capacidad) |

Dependencias nuevas: `@capacitor/motion@^8.0.1` y `@capacitor/device@^8.0.3`. Se agregaron a `package.json`.

## Respaldos web y limitaciones

- **Cámara**: en la app nativa abre la cámara o la galería. En el navegador `useCamera` usa el selector de
  archivos (sin `@ionic/pwa-elements` la cámara web de Capacitor se queda colgada).
- **Vibración**: en el navegador Capacitor llama `navigator.vibrate`. En un PC no hace nada; por eso la
  tarjeta se sacude en pantalla (animación CSS) como respaldo visual. No se probó en un teléfono.
- **Acelerómetro**: en un PC no llegan eventos `devicemotion`. El botón «Simular sacudida» (solo en web)
  pone valores aleatorios que se marcan como «simulada». En iOS web se pide `DeviceMotionEvent.requestPermission()`.
- **Batería**: viene de `navigator.getBattery()`. Funciona en Chrome; Firefox y Safari no lo tienen, y ahí se avisa.
- No se probó en Android ni iOS (no hay `npx cap add android` en el proyecto). Todo lo probado fue en
  Chrome headless.

## Cómo probar

```bash
cd app && npm install && npm run dev
# abrir http://localhost:5173, iniciar sesión (modo local: ciudadano@demo.local / demo123)
# menú ☰ → «Challenges 14-17» → 14. Sensores
```

Capturas reales (Chrome headless, `scripts/capturas.mjs`): `challenges/capturas/02` a `08`.
