# Documento final — Alcance del sistema y tecnologías utilizadas

**Proyecto:** ServiCasa — app móvil de servicios a domicilio
**Curso:** Desarrollo de Software para Plataformas Móviles (UAO, 14780)
**Autor:** César Armando Reyes (entrega individual)
**Fecha:** noviembre de 2026

---

## 1. Propósito

Desarrollé una aplicación móvil híbrida en Ionic React que permite a una persona encontrar
servicios para su hogar (plomería, electricidad, aseo, cerrajería, jardinería), solicitarlos
desde el teléfono indicando su ubicación y una foto del problema, seguir el estado de la
solicitud y conversar en tiempo real con quien la atiende. Del otro lado, un administrador
gestiona el catálogo de servicios, ve todas las solicitudes, las hace avanzar de estado y
responde los chats.

Elegí este dominio porque obliga a usar, de forma natural, todos los temas del curso: React y
sus custom hooks, sensores del dispositivo, memoria local, base de datos, autenticación real,
comunicación en tiempo real y mapas.

Desde el principio diseñé la app para que se pueda **re-tematizar** sin tocar la lógica: el
nombre, el eslogan, los colores, las categorías, los estados y los nombres visibles de las
entidades viven en `src/helpers/brand.js`, y las tablas de la base de datos tienen nombres
neutros (`profiles`, `places`, `requests`, `messages`). Si mañana el tema cambia a, por
ejemplo, reservas de canchas o domicilios de comida, edito ese archivo y los datos de ejemplo.

## 2. Alcance

### 2.1 Lo que el sistema hace

| Módulo | Funcionalidad |
|---|---|
| Autenticación | Registro con nombre, correo y contraseña; inicio y cierre de sesión; la sesión persiste al recargar. Al registrarse se crea automáticamente el perfil del usuario. |
| Roles | Dos roles: `user` y `admin`. Según el rol, `AppRoutes` carga `UserRoutes` o `AdminRoutes`. Sin sesión solo se ven login y registro. |
| Catálogo (Inicio) | Lista de servicios en tarjetas (`CardItem`), búsqueda por texto, filtro por categoría (se recuerda en memoria local) y orden por distancia a mi ubicación. |
| Solicitudes | Desde un servicio abro un `IonModal`, describo lo que necesito, adjunto mi ubicación GPS y opcionalmente una foto. Se guarda en la tabla `requests` y vibra al confirmar. |
| Seguimiento | Pestaña de solicitudes con vistas "Activas" e "Historial". El usuario puede cancelar mientras está pendiente; el admin la avanza: pendiente → aceptada → en camino → completada. La lista se actualiza en vivo. |
| Chat | Sala general "Comunidad" y una sala por cada solicitud (`request-<id>`). Burbujas propias y ajenas, hora de envío y desplazamiento automático al último mensaje. |
| Mapa | Mapa Leaflet con los servicios como marcadores, mi ubicación con su círculo de precisión, botón para centrarme, seguimiento en vivo (`watchPosition`) y los tres servicios más cercanos. |
| Perfil | Cambio de nombre, foto de perfil con la cámara/galería, estado de la red, ubicación actual y modo de backend. |
| Panel admin | Métricas en vivo (servicios, pendientes, en curso, completadas) y CRUD completo de servicios con formulario en `IonModal`, que permite tomar las coordenadas de mi GPS. |
| Red | Indicador de conexión en la barra superior; sin red se deshabilitan las acciones que escriben en el backend (enviar mensajes, crear o cambiar solicitudes). |

### 2.2 Lo que queda fuera del alcance

- Pagos en línea y facturación.
- Notificaciones push (requieren Firebase Cloud Messaging y un dispositivo físico).
- Calificaciones y reseñas de los servicios.
- Asignación automática de técnicos; en esta versión el administrador gestiona todo.

## 3. Arquitectura

### 3.1 Vista general

```
┌──────────────── App móvil (Ionic React + Capacitor) ────────────────┐
│  pages/  →  components/  →  hooks/ (una capacidad por hook)          │
│                                 │                                    │
│                       lib/supabase.js (cliente único)                │
│                 haySupabase ? Supabase : helpers/localDb.js          │
└─────────────────────────────────┼────────────────────────────────────┘
                                  │
        ┌─────────────────────────┴──────────────────────────┐
        │ Supabase: Auth · PostgreSQL + RLS · Realtime · Storage │
        └────────────────────────────────────────────────────────┘
```

Seguí el estilo de las clases: **toda la lógica de acceso a datos y a sensores está en custom
hooks** y las páginas solo los consumen. Esto me permitió cambiar el origen de los datos sin
tocar ninguna pantalla.

### 3.2 Estructura de carpetas

Respeté la estructura que pide la rúbrica:

- `helpers/`: funciones generales (`utils.js`: formato de fechas y precios, distancia Haversine,
  validaciones, aplicación del tema), `brand.js`, `seeds.js`, `localDb.js` y `archivos.js`.
- `context/`: `AuthContext.jsx`.
- `pages/`: una carpeta por página con `Index.jsx` e `Index.module.scss` (Login, Register, Home,
  Map, Orders, Chat, Profile, Admin).
- `components/`: `CardItem/CardItem.jsx` + `CardItem.module.scss`, `MapView`, `ChatBubble`,
  `RequestModal`, `NetworkBadge`, y `components/shared/` con `Menu.jsx` + `Menu.module.scss` y
  `Header.jsx`.
- `hooks/`: los custom hooks descritos abajo.
- `routes/`: `AppRoutes.jsx`, `UserRoutes.jsx` y `AdminRoutes.jsx`.

### 3.3 Custom hooks

| Hook | Responsabilidad |
|---|---|
| `useAuth` | Registro, login, logout, sesión y perfil. Se instancia **una sola vez** en `App.jsx` y se comparte por `AuthContext`; así evito el error del Parcial 1, donde dos instancias sueltas tenían sesiones distintas. |
| `useCollection(tabla, { filtros, orden, realtime })` | CRUD genérico (`getAll`, `add`, `update`, `remove`) con filtros en el formato de la Clase 07: `[["campo", "==", valor]]`. Con `realtime: true` se suscribe a los cambios de la tabla. |
| `useRealtimeChat(sala, autor)` | Carga el historial de una sala y escucha los mensajes nuevos; `enviar(texto)` inserta y evita duplicados. |
| `useGeolocation({ seguir, auto })` | `getCurrentPosition` y `watchPosition` de Capacitor, con limpieza del seguimiento al desmontar. |
| `useCamera` | `Camera.getPhoto` con resultado en dataUrl (cámara o galería). |
| `useNetwork` | `Network.getStatus` y el evento `networkStatusChange`. |
| `useLocalStorage(clave, inicial)` | Estado de React persistido en la memoria local y sincronizado entre pestañas. |
| `useHaptics` | Impacto, notificación de éxito y vibración. |

### 3.4 Rutas protegidas

`AppRoutes` lee el contexto de autenticación. Mientras carga la sesión y el perfil muestra un
indicador, para no enseñar por un instante las rutas del rol equivocado. Sin sesión monta un
`IonRouterOutlet` con `/login` y `/registro` y redirige todo lo demás a `/login`. Con sesión
monta el `IonMenu` y un outlet con `/app/*`, que resuelve a `AdminRoutes` o `UserRoutes` según
`perfil.rol`. Cada uno es un `IonTabs` con su propia barra de pestañas.

### 3.5 Backend con respaldo local

`src/lib/supabase.js` crea el cliente solo si existen `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`
(`haySupabase = Boolean(url && key)`). Cada hook tiene dos ramas con **la misma interfaz**:

- **Supabase:** Auth para la sesión, PostgREST para el CRUD, `postgres_changes` de Realtime para
  el chat y las listas, y Storage para las fotos.
- **Local:** `helpers/localDb.js` guarda cada tabla en `localStorage` y emite cada inserción,
  actualización o borrado por `BroadcastChannel` y a los oyentes de la misma pestaña. Así el
  chat y las listas se actualizan en vivo entre pestañas sin recargar. Las contraseñas del modo
  local se guardan con hash SHA-256 (solo para no tenerlas en texto plano; no pretende ser
  seguridad real).

Tomé esta decisión porque al momento de construir la app no tenía un proyecto Supabase creado.
Así la app se puede revisar completa sin llaves, el código del SDK queda listo para quien las
tenga, y en la interfaz se indica claramente en qué modo está corriendo.

## 4. Modelo de datos

| Tabla | Campos principales | Notas |
|---|---|---|
| `profiles` | `id` (uuid = `auth.users.id`), `nombre`, `email`, `rol`, `avatar_url` | Se crea con un trigger al registrarse. |
| `places` | `id`, `nombre`, `descripcion`, `categoria`, `precio`, `lat`, `lng` | Puntos del mapa / catálogo. |
| `requests` | `id`, `user_id`, `place_id`, `detalle`, `estado`, `lat`, `lng`, `foto_url` | Transacción principal; `estado` con `check`. |
| `messages` | `id`, `room`, `user_id`, `autor`, `texto`, `created_at` | Índice por `(room, created_at)`. |

**Seguridad (RLS):** activé RLS en las cuatro tablas, siguiendo la Clase 09. Cada usuario ve y
crea solo sus solicitudes; el administrador (función `es_admin()` con `security definer`) ve y
edita todas. Solo el admin escribe en `places`. En `messages`, la sala general es para cualquier
usuario autenticado y la sala de una solicitud solo para su dueño y el admin. Un usuario puede
editar su perfil pero no cambiarse el rol. El bucket `avatars` solo permite escribir dentro de la
carpeta `<uid>/` del propio usuario. Activé Realtime para `messages`, `requests` y `places`.

Todo está en `supabase/schema.sql`, listo para pegar en el SQL Editor.

## 5. Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Interfaz y custom hooks |
| Vite | 8 | Proyecto creado con `npm create vite@latest`, servidor de desarrollo y build |
| Ionic React / `@ionic/react-router` | 9 | Componentes móviles (`IonTabs`, `IonMenu`, `IonList`, `IonModal`, `IonToast`, `IonSegment`, `IonFab`…) y navegación |
| React Router | 6 | Rutas (es la versión que exige Ionic 9) |
| Capacitor | 8 | Geolocation, Camera, Haptics, Network |
| Supabase (`@supabase/supabase-js`) | 2 | Auth, PostgreSQL, Realtime, Storage |
| Leaflet + React Leaflet | 1.9 / 5 | Mapa con mosaicos de OpenStreetMap |
| Sass (CSS Modules) | 1.x | Un `*.module.scss` por página y componente |
| Puppeteer-core | 25 | Capturas y prueba automática del tiempo real (solo desarrollo) |

**Diseño:** tomé el color primario `#2b5bd7` de la diapositiva del Color Generator de Ionic y
lo apliqué a las variables `--ion-color-*` en tiempo de ejecución desde `brand.js`, para que el
cambio de tema también cambie los colores. Usé el modo `ios` de Ionic porque es el más cercano a
las referencias de Refero/Mobbin que vimos en clase.

## 6. Relación con los temas del curso

| Tema del curso | Dónde lo apliqué |
|---|---|
| React (componentes, props, estado, efectos, contexto) | Toda la app; `AuthContext` para la sesión |
| Custom hooks (Clases 07–11) | Ocho hooks, uno por capacidad |
| Memoria / almacenamiento local (Clase 07) | `useLocalStorage`, sesión y base local en `localStorage` |
| Base de datos (Clases 07 y 09) | Supabase PostgreSQL con RLS; `useCollection` con filtros estilo curso |
| Comunicación en tiempo real (Clases 07 y 09) | Supabase Realtime / BroadcastChannel en chat, solicitudes y panel |
| Sensores (Clase 08) | Geolocalización, cámara, vibración y red |
| Mapas y APIs (Clases 10 y 11) | Leaflet + OpenStreetMap; distancias con Haversine |
| Diseño UI | Paleta del Color Generator, componentes Ionic y CSS Modules |
| Firebase | La rúbrica lo menciona; usé Supabase, que fue el backend visto en la Clase 09 y cubre lo mismo (auth, base de datos, tiempo real y archivos). |

## 7. Verificación

- `npm run build` compila sin errores.
- Con `npm run dev` recorrí la app en Chrome headless con el script `scripts/capturas.mjs`:
  registro de un usuario nuevo, creación de una solicitud con GPS, chat en la sala de la
  solicitud y en la general, mapa, perfil y menú; luego, como administrador, el panel, el avance
  de estado, la respuesta en el chat y la creación de un servicio nuevo que aparece en el mapa.
  Las capturas están en `capturas/` y no hubo errores en la consola del navegador.
- `scripts/prueba-realtime.mjs` abre dos pestañas, envía un mensaje en una y confirma que aparece
  en la otra sin recargar.

## 8. Limitaciones y trabajo futuro

- **Supabase sin probar contra un proyecto real:** el código está completo, pero todavía no hay
  llaves; lo verificado es el modo local. El siguiente paso es crear el proyecto, ejecutar
  `schema.sql` y repetir las pruebas.
- **Cámara y vibración en navegador:** la cámara abre el selector de archivos y la vibración no
  hace nada; en el teléfono funcionan con Capacitor.
- **Tiempo real local:** solo entre pestañas del mismo navegador; entre dispositivos se requiere
  Supabase.
- **Trabajo futuro:** notificaciones push cuando cambia el estado de una solicitud, calificación
  del servicio, división del paquete JS (code splitting) y empaquetado Android con
  `npx cap add android`.
