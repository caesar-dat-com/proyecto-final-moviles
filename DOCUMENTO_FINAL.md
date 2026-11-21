# Documento final — ReportaCali: alcance, arquitectura y tecnologías

**Proyecto:** ReportaCali — reportes urbanos geolocalizados («Reporta lo que ves, arregla tu barrio»)
**Curso:** Desarrollo de Software para Plataformas Móviles (UAO, 14780)
**Integrante:** César Armando Reyes (entrega individual, rama `proyecto-final-cesar-reyes`)
**Prototipo:** PENDIENTE (prototipo Lovable)
**Fecha:** noviembre de 2026

---

## 1. Propósito

Desarrollé una aplicación móvil híbrida en Ionic React para que cualquier ciudadano de Cali pueda
reportar un problema de su barrio —un hueco, una luminaria apagada, basuras acumuladas, una fuga de
acueducto, un semáforo fuera de servicio o una zona insegura— en pocos segundos, con **foto y
ubicación GPS**. El reporte queda en un mapa público con su dirección, se asigna automáticamente a la
**dependencia responsable** según su categoría y tiene un **chat en tiempo real** donde los vecinos y el
funcionario hablan sobre el caso. Un **funcionario** (rol administrador) lo mueve de estado hasta
resolverlo.

Elegí este tema porque usa de forma natural todos los temas del curso: la cámara y el GPS son
indispensables (un reporte sin ubicación no sirve), el mapa es la vista principal, el chat y los
cambios de estado tienen que llegar en vivo, y hay dos roles con permisos distintos sobre la misma base
de datos.

## 2. Alcance del sistema

### 2.1 Roles

| Rol | Tabla / valor | Qué puede hacer |
|---|---|---|
| Ciudadano | `profiles.rol = 'user'` | Registrarse, crear reportes, ver todos los reportes del mapa, filtrar los suyos, retirar un reporte suyo mientras está «Nuevo», chatear en cualquier reporte y en la sala Comunidad, editar su perfil. |
| Funcionario | `profiles.rol = 'admin'` | Todo lo anterior salvo crear reportes desde Inicio; además ve el panel con métricas, avanza el estado de cualquier reporte o lo descarta, y administra las dependencias (crear, editar, eliminar). |

### 2.2 Funcionalidades

| Módulo | Funcionalidad |
|---|---|
| Autenticación | Registro con nombre, correo y contraseña; inicio y cierre de sesión; la sesión persiste al recargar. Al registrarse se crea el perfil con un trigger. Según el rol, `AppRoutes` carga `UserRoutes` o `AdminRoutes`. |
| Inicio (ciudadano) | Botón «Reportar un problema», número de reportes activos propios y el «catálogo» de **dependencias responsables** en tarjetas (`CardItem`), con búsqueda, filtro por categoría (recordado en memoria local), distancia a mi ubicación y **tiempo de respuesta estimado** («5 días hábiles»). Tocar una dependencia abre el formulario con su categoría elegida. |
| Crear reporte | `IonModal` que pide **categoría**, **descripción**, **ubicación GPS** (obligatorias) y **foto** (cámara o galería, muy recomendada). Al tomar la ubicación muestra la dirección (Nominatim). Muestra qué dependencia lo atiende y en cuánto tiempo. Vibra al enviar. Sin red no deja enviar. |
| Reportes | Lista en vivo con vistas «Activos», «Míos» (ciudadano) y «Cerrados». Cada tarjeta muestra categoría, estado, foto, autor, **dirección obtenida por geocoding inverso**, dependencia asignada y botón de chat. El funcionario avanza `Nuevo → En revisión → Asignado → Resuelto` o descarta. |
| Mapa | Leaflet con los reportes activos como marcadores con el icono y color de su categoría, las dependencias como marcador 🏛️, mi ubicación con círculo de precisión, botón para centrarme, seguimiento en vivo (`watchPosition`) y los tres reportes activos más cercanos con su dirección. El popup de cada reporte muestra estado, dirección, descripción y un botón para abrir su chat. |
| Chat | Sala «Comunidad» y una sala por reporte (`request-<id>`) abierta a vecinos y funcionarios. Burbujas propias y ajenas, hora y desplazamiento automático. |
| Perfil | Cambio de nombre, foto de perfil con la cámara/galería, rol (Ciudadano/Funcionario), estado de la red, ubicación actual y modo de backend. |
| Panel del funcionario | Métricas en vivo (nuevos, en proceso, resueltos, dependencias), reportes abiertos por categoría y CRUD de dependencias con formulario en `IonModal` (puede tomar las coordenadas de su GPS). |
| Red | Indicador de conexión en la barra superior; sin red se deshabilitan las acciones que escriben (enviar mensajes, crear o cambiar reportes). |

### 2.3 Fuera del alcance

- Integración con los sistemas oficiales de la Alcaldía de Cali: ReportaCali **no** es un canal
  oficial; las dependencias son datos de ejemplo.
- Notificaciones push cuando cambia el estado de un reporte.
- Detección de reportes duplicados, votos de vecinos («a mí también me afecta») y moderación de fotos.
- Asignación del reporte a un funcionario específico (hoy cualquier funcionario gestiona todos).

## 3. Arquitectura

### 3.1 Vista general

```
┌──────────────────── App móvil (Ionic React + Capacitor) ────────────────────┐
│  pages/  →  components/  →  hooks/ (una capacidad por hook)                  │
│                                   │                       │                   │
│                     lib/supabase.js (cliente único)   helpers/geocoding.js    │
│               haySupabase ? Supabase : helpers/localDb.js         │           │
└───────────────────────────────────┼───────────────────────────────┼──────────┘
                                    │                               │
     ┌──────────────────────────────┴─────────────────┐   ┌─────────┴──────────────┐
     │ Supabase: Auth · PostgreSQL + RLS · Realtime ·  │   │ Nominatim (OSM)         │
     │ Storage                                         │   │ geocoding inverso       │
     └─────────────────────────────────────────────────┘   └────────────────────────┘
```

Seguí el estilo de las clases: **todo el acceso a datos, sensores y APIs está en custom hooks** y las
páginas solo los consumen. Por eso pude cambiar el tema de la app (empezó como una app genérica) sin
tocar la arquitectura: el nombre, los colores, las categorías, los estados, los roles y los nombres
visibles de las entidades viven en `src/helpers/brand.js`, y las tablas conservan nombres neutros.

### 3.2 Estructura de carpetas (la que pide la rúbrica)

- `helpers/`: `utils.js` (funciones generales: fechas, `formatearPrecio`, distancia Haversine, estados,
  validaciones, aplicación del tema), `brand.js`, `geocoding.js`, `seeds.js`, `localDb.js`, `archivos.js`.
- `context/`: `AuthContext.jsx`.
- `pages/`: una carpeta por página con `Index.jsx` e `Index.module.scss` (Login, Register, Home, Map,
  Orders, Chat, Profile, Admin).
- `components/`: `CardItem/CardItem.jsx` + `CardItem.module.scss`, `MapView`, `ChatBubble`,
  `RequestModal`, `NetworkBadge`, `Direccion`, y `components/shared/` con `Menu.jsx` +
  `Menu.module.scss` y `Header.jsx`.
- `hooks/`: los custom hooks de la tabla siguiente.
- `routes/`: `AppRoutes.jsx`, `UserRoutes.jsx` y `AdminRoutes.jsx`.

### 3.3 Custom hooks

| Hook | Responsabilidad |
|---|---|
| `useAuth` | Registro, login, logout, sesión y perfil. Se instancia una sola vez en `App.jsx` y se comparte por `AuthContext`. |
| `useCollection(tabla, { filtros, orden, realtime })` | CRUD genérico con filtros estilo Clase 07 (`[["campo", "==", valor]]`); con `realtime: true` se suscribe a los cambios de la tabla. |
| `useRealtimeChat(sala, autor)` | Historial de una sala y mensajes nuevos en vivo; `enviar(texto)`. |
| `useGeolocation({ seguir, auto })` | `getCurrentPosition` y `watchPosition` de Capacitor, con limpieza al desmontar. |
| `useCamera` | `Camera.getPhoto` en dataUrl. En el dispositivo pregunta cámara o galería; en web usa el selector de archivos. |
| `useDireccion(lat, lng)` | Dirección legible de unas coordenadas con Nominatim; si falla devuelve las coordenadas. |
| `useNetwork` | `Network.getStatus` y el evento `networkStatusChange`. |
| `useLocalStorage(clave, inicial)` | Estado de React persistido en la memoria local. |
| `useHaptics` | Impacto, notificación de éxito y vibración. |

### 3.4 Rutas protegidas

`AppRoutes` lee el contexto de autenticación. Mientras carga la sesión muestra un indicador; sin
sesión solo expone `/login` y `/registro`; con sesión monta el `IonMenu` y `/app/*`, que resuelve a
`AdminRoutes` (pestañas Panel, Mapa, Reportes, Chat, Perfil) o `UserRoutes` (Inicio, Mapa, Reportes,
Chat, Perfil) según `perfil.rol`.

### 3.5 Backend con respaldo local

`src/lib/supabase.js` crea el cliente solo si existen `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`.
Cada hook tiene dos ramas con **la misma interfaz**:

- **Supabase:** Auth para la sesión, PostgREST para el CRUD, `postgres_changes` de Realtime para el
  chat, las listas y el mapa, y Storage para las fotos.
- **Local:** `helpers/localDb.js` guarda cada tabla en `localStorage` y emite cada cambio por
  `BroadcastChannel`, así que el chat, las listas y el mapa se actualizan en vivo entre pestañas.
  Las contraseñas locales se guardan con hash SHA-256 solo para no tenerlas en texto plano.

La interfaz declara siempre el modo en que corre (login, menú y perfil).

### 3.6 API externa: geocoding inverso con Nominatim

`helpers/geocoding.js` llama a `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=..&lon=..`
(sin llave) y arma una dirección corta con la vía, el número, el barrio y la ciudad. Para respetar la
política de uso de Nominatim: envío un `User-Agent` propio, guardo cada resultado en `localStorage`
(clave por coordenadas con 5 decimales), espero al menos 1,1 s entre peticiones con una cola y
comparto las peticiones repetidas en curso. Si la petición falla, el componente `Direccion` muestra
las coordenadas.

## 4. Modelo de datos

| Tabla | En ReportaCali | Campos principales | Notas |
|---|---|---|---|
| `profiles` | Ciudadano / funcionario | `id` (uuid = `auth.users.id`), `nombre`, `email`, `rol` (`user`/`admin`), `avatar_url` | Se crea con un trigger al registrarse. |
| `places` | Dependencia responsable | `id`, `nombre`, `descripcion`, `categoria`, `precio`, `lat`, `lng` | `precio` conserva el nombre de la columna pero guarda los **días hábiles de respuesta estimada**; `formatearPrecio` lo muestra como «3 días hábiles» según `BRAND.valor`. |
| `requests` | Reporte | `id`, `user_id`, `cliente_nombre`, `categoria`, `detalle`, `estado`, `lat`, `lng`, `foto_url`, `place_id`, `place_nombre` | `estado` con `check`: `nuevo`, `en_revision`, `asignado`, `resuelto`, `descartado`. |
| `messages` | Chat | `id`, `room` (`general` o `request-<id>`), `user_id`, `autor`, `texto`, `created_at` | Índice por `(room, created_at)`. |

**Seguridad (RLS, Clase 09):** RLS activo en las cuatro tablas. Los reportes son legibles por cualquier
usuario autenticado (son públicos en el mapa); cada ciudadano solo crea reportes a su nombre y en
estado `nuevo`, y solo puede retirarlos (`descartado`) mientras siguen en `nuevo`; el funcionario
(`es_admin()` con `security definer`) cambia el estado de cualquiera. Solo el funcionario escribe en
`places`. Los mensajes son legibles por los autenticados y solo se puede escribir en la sala general o
en la de un reporte que exista. Nadie puede cambiarse el rol. El bucket `avatars` solo permite escribir
en la carpeta `<uid>/` propia. Realtime está activo para `messages`, `requests` y `places`.
Todo está en `supabase/schema.sql`; los datos de ejemplo en `supabase/seed.sql`.

## 5. Tecnologías usadas y justificación

| Tecnología | Versión | Por qué la usé |
|---|---|---|
| React | 19.3 | Base del curso; componentes, estado y custom hooks. |
| Vite | 8.3 | Proyecto creado con `npm create vite@latest` como en clase; arranque y build rápidos. |
| Ionic React + `@ionic/react-router` | 9.0 | Componentes móviles nativos en apariencia (`IonTabs`, `IonMenu`, `IonModal`, `IonSegment`, `IonFab`, `IonToast`…) y navegación con transiciones. |
| React Router | 6.30 | Es la versión que exige Ionic 9 (con la 5 npm falla por dependencias). |
| Capacitor | 8.6 | Acceso a GPS, cámara, vibración y red con la misma API en web y en Android. |
| Supabase (`@supabase/supabase-js`) | 2.119 | Auth, PostgreSQL, Realtime y Storage en un solo servicio (ver 5.1). |
| Leaflet + React Leaflet | 1.9 / 5.0 | Mapa visto en la Clase 10, libre y sin llave, con mosaicos de OpenStreetMap. |
| Nominatim (OpenStreetMap) | API pública | Geocoding inverso sin llave y con la misma fuente de datos del mapa. |
| Sass (CSS Modules) | 1.108 | Un `*.module.scss` por página y componente, como pide la rúbrica. |
| Puppeteer-core | 25.18 | Solo desarrollo: capturas automáticas y pruebas en Chrome headless. |

**Diseño:** el color primario `#2b5bd7` sale de la diapositiva del Color Generator de Ionic
(Diseño UI); el secundario `#14b8a6` (turquesa) y el terciario `#f59e0b` (ámbar) diferencian ubicación
y estados intermedios. Se aplican a las variables `--ion-color-*` en tiempo de ejecución desde
`brand.js`. Cada categoría tiene icono y color propios en el mapa.

### 5.1 ¿Por qué Supabase y no Firebase?

La rúbrica menciona Firebase, pero usé **Supabase** por estas razones:

1. **Es el backend que vimos en la Clase 09**, con el mismo patrón de cliente único, Auth, tablas, RLS,
   Realtime y Storage que apliqué aquí.
2. **Los datos de ReportaCali son relacionales**: un reporte pertenece a un ciudadano y a una
   dependencia, y los mensajes pertenecen a un reporte. PostgreSQL modela eso con llaves foráneas,
   `check` sobre los estados e índices, mientras que en Firestore tendría que duplicar datos.
3. **La seguridad se expresa en SQL con RLS**: reglas como «el ciudadano solo puede retirar su reporte
   mientras está nuevo» o «solo el funcionario cambia estados» quedan en `schema.sql`, versionadas
   junto al código.
4. **Realtime sobre la misma base**: `postgres_changes` avisa de inserciones y actualizaciones de
   `messages` y `requests` sin mantener una segunda base de datos para el chat.
5. **Cubre lo mismo que Firebase pide el curso** (autenticación real, base de datos, tiempo real y
   archivos) con plan gratuito y SDK de JavaScript.

## 6. Capacidades del dispositivo usadas

| Capacidad | Plugin | Dónde y para qué |
|---|---|---|
| GPS (posición actual) | `@capacitor/geolocation` `getCurrentPosition` | Ubicación obligatoria del reporte, distancia a las dependencias, coordenadas de una dependencia nueva. |
| GPS (seguimiento) | `watchPosition` / `clearWatch` | «Seguir mi ubicación en vivo» en el mapa y reportes activos más cercanos. |
| Cámara / galería | `@capacitor/camera` `getPhoto` | Foto del reporte y foto de perfil. |
| Vibración | `@capacitor/haptics` | Confirmación al enviar un reporte y al activar el seguimiento en el mapa. |
| Estado de la red | `@capacitor/network` | Indicador de conexión y bloqueo de escrituras sin red. |
| Memoria local | `localStorage` | Sesión y base del modo local, categoría elegida, caché de direcciones de Nominatim. |

## 7. Relación con los temas del curso

| Tema | Dónde lo apliqué |
|---|---|
| React (componentes, props, estado, efectos, contexto) | Toda la app; `AuthContext` para la sesión. |
| Custom hooks | Nueve hooks, uno por capacidad. |
| Sensores (Clase 08) | GPS, cámara, vibración y red (sección 6). |
| Memoria / storage (Clase 07) | `useLocalStorage`, modo local y caché de geocoding. |
| Bases de datos y login real (Clases 07 y 09) | Supabase Auth + PostgreSQL con RLS; `useCollection`. |
| Comunicación en tiempo real | Chat por reporte y Comunidad; listas, mapa y panel que se actualizan solos. |
| Mapas y APIs (Clases 10 y 11) | Leaflet + OpenStreetMap; Nominatim para geocoding inverso. |
| Diseño UI | Paleta del Color Generator, componentes Ionic, CSS Modules. |

## 8. Verificación realizada

- `npm run build` compila sin errores (solo el aviso de Vite por el tamaño del paquete).
- Con `npm run dev`, `curl` a `http://localhost:5173/` responde HTTP 200.
- `npm run capturas` recorre la app en Chrome headless y genera **16 capturas** en `capturas/`:
  login, registro, inicio, formulario de reporte con dirección real y foto, reporte creado, lista de
  reportes, chat del reporte, Comunidad, mapa con el popup del reporte, perfil, menú y, como
  funcionario, panel, cambio de estado, respuesta en el chat, nueva dependencia y mapa. Sin errores en
  la consola del navegador.
- `npm run prueba:realtime` abre dos pestañas, envía un mensaje en una y confirma que aparece en la
  otra sin recargar.
- `npm run prueba:formato` confirma que `formatearPrecio` devuelve «3 días hábiles» / «1 día hábil» y
  que con `formato: 'moneda'` sigue devolviendo «$ 60.000».

## 9. Limitaciones honestas

- **No hay proyecto Supabase**: el código del SDK y `schema.sql` están completos, pero no los he
  ejecutado contra un backend real. Todo lo verificado es el modo local. Las políticas RLS pueden
  necesitar ajustes al probarlas de verdad.
- **El tiempo real del modo local** solo funciona entre pestañas del mismo navegador; entre
  dispositivos distintos se necesita Supabase Realtime.
- **Cámara y vibración en el navegador**: la cámara abre el selector de archivos y la vibración no hace
  nada; con Capacitor en el teléfono funcionan, pero no generé ni probé el APK.
- **La foto de las capturas** es un dibujo generado para la prueba automática, no una foto real.
- **Nominatim** es un servicio comunitario limitado a 1 petición por segundo; para un uso real haría
  falta un servidor propio o un proveedor comercial. Sus direcciones dependen de los datos de
  OpenStreetMap y pueden ser imprecisas.
- **Las dependencias** usan nombres de entidades reales de Cali, pero las coordenadas son aproximadas y
  los tiempos de respuesta son ilustrativos.
- **El prototipo de Lovable** no estaba disponible al construir la app, así que no pude comparar el
  aspecto visual con él.
- **Moderación**: no hay filtro de fotos ni de mensajes ofensivos, ni control de reportes duplicados.
