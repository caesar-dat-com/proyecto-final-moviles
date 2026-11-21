# ReportaCali — Prototipo navegable

**Autor:** César Armando Reyes  
**Materia:** Desarrollo de Software para Plataformas Móviles — UAO 2026-2

Prototipo de alta fidelidad de **ReportaCali** (reportes urbanos geolocalizados en Cali). Reemplaza
el prototipo de Lovable que se vio en clase: es HTML + CSS + JavaScript sin dependencias ni
compilación, con los mismos colores, tipografía, textos y disposición que la app real
(`app/src/helpers/brand.js`, los SCSS de `app/src/pages` y `app/src/components`, y las 16 capturas de `app/capturas/`).

## Cómo abrirlo

- **Sin servidor:** doble clic en `index.html` (funciona con `file://`, sin internet).
- **Con servidor local:** `python3 -m http.server 4173 --directory prototipo` y abrir <http://localhost:4173>.
- **GitHub Pages:** publicar esta carpeta tal cual (rama `gh-pages` o carpeta `/docs`). No hay rutas absolutas.

## Cómo se usa

- **Navegar:** un teléfono con la app. Se toca igual que la app real: pestañas inferiores, tarjetas,
  botones, menú ☰, selector de categoría, chat (se pueden enviar mensajes), mapa (toca un pin) y,
  como funcionario, avanzar el estado de un reporte. A la izquierda está la lista de las 19 pantallas
  y a la derecha la ficha de la pantalla actual (archivo de la app y captura real equivalentes).
- **Todas las pantallas:** tablero tipo Figma con las 19 pantallas agrupadas por flujo, con flechas
  y notas que indican la acción que lleva de una a otra. Clic en una pantalla para abrirla.
- **Entrar como funcionario:** en el login, toca «funcionario@demo.local / admin123» y luego «Iniciar sesión».
- **Enlaces directos:** `index.html#/inicio`, `#/mapa`, `#/f-bandeja`, `#/tablero`, etc.
- En el celular se muestra sin marco y ocupa la pantalla; un selector arriba permite saltar de pantalla.

Los datos son simulados y están escritos a mano en `datos.js` (dependencias, reportes, mensajes).
No se hace ninguna llamada de red. El mapa es una ilustración en SVG (la app usa Leaflet + OpenStreetMap)
y las «fotos» de los reportes son ilustraciones SVG.

## Archivos

| Archivo | Contenido |
|---|---|
| `index.html` | Barra superior del prototipo y contenedor |
| `estilos.css` | Marco del prototipo (`p-*`) y réplica visual de la app Ionic (`a-*`) |
| `datos.js` | Datos simulados (marca, 6 categorías, estados, dependencias, reportes, chats) |
| `iconos.js` | Iconos SVG inline al estilo Ionicons |
| `app.js` | Pantallas, navegación por hash y acciones |
| `capturas/` | Capturas del prototipo hechas con Chrome headless (`herramientas/capturar.mjs`) |

## Correspondencia pantalla del prototipo ↔ pantalla de la app

| # | Prototipo | Ruta | Archivo de la app | Captura real |
|---|---|---|---|---|
| 01 | Iniciar sesión | `#/login` | `src/pages/Login/Index.jsx` | `01-login.png` |
| 02 | Registro | `#/registro` | `src/pages/Register/Index.jsx` | `02-registro.png` |
| 03 | Inicio · dependencias | `#/inicio` | `src/pages/Home/Index.jsx` | `03-inicio.png` |
| 04 | Crear reporte | `#/nuevo` | `src/components/RequestModal/RequestModal.jsx` | `04-modal-reporte.png` |
| 05 | Crear reporte · 6 tipos (selector) | `#/tipos` | `RequestModal.jsx` (IonSelect action-sheet) | — (estado del 04) |
| 06 | Reporte enviado | `#/enviado` | `src/pages/Home/Index.jsx` (toast) | `05-reporte-creado.png` |
| 07 | Mis reportes (Activos / Míos / Cerrados) | `#/reportes` | `src/pages/Orders/Index.jsx` | `06-reportes.png` |
| 08 | Detalle del reporte | `#/detalle` | `CardItem` + popup de `MapView` | `06-reportes.png` / `09-mapa.png` |
| 09 | Chat del reporte | `#/chat-reporte` | `src/pages/Chat/Index.jsx` | `07-chat-reporte.png` |
| 10 | Chat · Comunidad | `#/comunidad` | `src/pages/Chat/Index.jsx` | `08-chat-comunidad.png` |
| 11 | Mapa de reportes | `#/mapa` | `src/pages/Map/Index.jsx` | `09-mapa.png` |
| 12 | Mi perfil | `#/perfil` | `src/pages/Profile/Index.jsx` | `10-perfil.png` |
| 13 | Menú lateral | `#/menu` | `src/components/shared/Menu.jsx` | `11-menu.png` |
| 14 | Panel del funcionario | `#/f-panel` | `src/pages/Admin/Index.jsx` | `12-funcionario-panel.png` |
| 15 | Nueva dependencia | `#/f-dependencia` | `src/pages/Admin/Index.jsx` (modal) | `15-funcionario-nueva-dependencia.png` |
| 16 | Bandeja de reportes (funcionario) | `#/f-bandeja` | `src/pages/Orders/Index.jsx` (rol admin) | `13-funcionario-reportes.png` |
| 17 | Cambio de estado | `#/f-estado` | `Orders/Index.jsx` → `cambiarEstado` | — (estado del 13) |
| 18 | Chat del funcionario | `#/f-chat` | `src/pages/Chat/Index.jsx` | `14-funcionario-chat.png` |
| 19 | Mapa general | `#/f-mapa` | `src/pages/Map/Index.jsx` (rol admin) | `16-funcionario-mapa.png` |

**Nota honesta:** la app no tiene una ruta propia de «detalle»; esa información vive en la tarjeta de
`Reportes` y en el popup del mapa. La pantalla 08 la reúne (con una línea de seguimiento de estados)
para el recorrido del prototipo.
