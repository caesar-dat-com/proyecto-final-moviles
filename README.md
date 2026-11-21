# ReportaCali — Proyecto Final de Plataformas Móviles (UAO, curso 14780)

> **Reporta lo que ves, arregla tu barrio.**

Construí **ReportaCali**, una app móvil en **Ionic React** para reportar problemas de la ciudad
de Cali —huecos, alumbrado dañado, basuras, fugas de acueducto, semáforos fuera de servicio e
inseguridad— con **foto + ubicación GPS**. Cada reporte queda en el mapa con su dirección, tiene un
**chat en tiempo real** donde los vecinos y el funcionario responsable conversan, y un
**funcionario** (rol `admin`) lo mueve de estado hasta resolverlo:
`Nuevo → En revisión → Asignado → Resuelto` (o `Descartado`).

## Integrantes

| Nombre | Rama |
|---|---|
| César Armando Reyes | `proyecto-final-cesar-reyes` (mezclada en `main`) |

## Enlaces

- **Prototipo (Lovable):** PENDIENTE (prototipo Lovable)
- **Documento final (alcance, arquitectura y tecnologías):** [`DOCUMENTO_FINAL.md`](./DOCUMENTO_FINAL.md)
- **Capturas de la app funcionando:** carpeta [`capturas/`](./capturas) (16 capturas generadas con `npm run capturas`)

## APIs consumidas

### Backend: Supabase

Uso **Supabase** (Clase 09) con `@supabase/supabase-js` y un único cliente en `src/lib/supabase.js`:

| API | Para qué la uso | Dónde |
|---|---|---|
| Supabase Auth — `signUp`, `signInWithPassword`, `signOut`, `getSession`, `onAuthStateChange` | Registro, login y sesión de ciudadanos y funcionarios | `src/hooks/useAuth.js` |
| Supabase Database (PostgREST) — `from(tabla).select/insert/update/delete` | CRUD de `profiles`, `places` (dependencias), `requests` (reportes) y `messages` | `src/hooks/useCollection.js`, `useAuth.js`, `useRealtimeChat.js` |
| Supabase Realtime — `channel().on('postgres_changes')` | Chat de cada reporte y de la Comunidad; listas y mapa que se actualizan solos | `src/hooks/useRealtimeChat.js`, `useCollection.js` |
| Supabase Storage — bucket `avatars` (`upload`, `getPublicUrl`) | Foto del reporte y foto de perfil | `src/helpers/archivos.js` |

### APIs externas (sin llave)

| API | Para qué la uso | Dónde |
|---|---|---|
| **Nominatim (OpenStreetMap) — geocoding inverso** `GET https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=..&lon=..` | Convertir las coordenadas del reporte en una dirección legible («Calle 12 #5-37, San Pedro, Cali»), que se muestra en la tarjeta del reporte, en el formulario, en el popup del mapa y en la lista de reportes cercanos | `src/helpers/geocoding.js`, `src/hooks/useDireccion.js`, `src/components/Direccion/` |
| OpenStreetMap Tile API (`tile.openstreetmap.org`) | Mosaicos del mapa en Leaflet | `src/components/MapView/MapView.jsx` |

Cómo uso Nominatim respetando su [política de uso](https://operations.osmfoundation.org/policies/nominatim/):

- Envío un `User-Agent` propio (`ReportaCali/1.0 …`). Nominatim lo acepta en CORS
  (`Access-Control-Allow-Headers: user-agent`); si algún navegador lo ignora, el `Referer` identifica la app.
- **Caché en `localStorage`** por coordenadas redondeadas a 5 decimales (≈1 m): la misma ubicación no se vuelve a pedir.
- Una **cola** deja al menos 1,1 s entre peticiones y las peticiones repetidas en curso se comparten.
- **Si la petición falla** (sin red, error HTTP o sin resultado), la app muestra las coordenadas en lugar de la dirección.

APIs nativas con Capacitor: `@capacitor/geolocation`, `@capacitor/camera`, `@capacitor/haptics`,
`@capacitor/network`.

## Cómo se mapea el tema sobre la base de datos

Las tablas tienen nombres neutros; la app las muestra con los nombres de `src/helpers/brand.js`:

| Tabla | En ReportaCali | Notas |
|---|---|---|
| `profiles` | Ciudadano (`rol = 'user'`) / Funcionario (`rol = 'admin'`) | |
| `places` | Dependencia responsable de un tipo de incidencia | El campo `precio` **no es dinero**: guarda los **días hábiles de respuesta estimada** («3 días hábiles»). |
| `requests` | Reporte del ciudadano | Foto, `lat`/`lng`, `categoria`, `estado`, dependencia asignada |
| `messages` | Chat del reporte (`request-<id>`) y sala «Comunidad» (`general`) | |

Categorías: Huecos y vías, Alumbrado, Basuras, Acueducto, Semáforos, Inseguridad.
Las 6 dependencias de ejemplo usan nombres de entidades reales de Cali, pero sus **coordenadas son
aproximadas y los tiempos de respuesta son ilustrativos**: ReportaCali es un proyecto académico, no un
canal oficial de la Alcaldía.

## Estado del backend (importante)

**El repositorio no trae llaves de Supabase y no hay un proyecto Supabase creado.** Por eso la app
tiene dos modos:

```js
// src/lib/supabase.js
export const haySupabase = Boolean(url && key);
```

- **Con llaves** (`.env`): los hooks usan Supabase Auth, Database, Realtime y Storage.
- **Sin llaves (modo local)**: los **mismos hooks**, con la misma interfaz, guardan en `localStorage`
  y emiten los cambios por `BroadcastChannel`, así que el chat, las listas y el mapa se actualizan en
  vivo entre pestañas del mismo navegador. La app lo declara en la pantalla de login
  («Modo local sin backend…»), en el menú lateral y en el perfil.

Cuentas de demostración del modo local (no existen en ningún backend):

| Rol | Correo | Contraseña |
|---|---|---|
| Ciudadano | `ciudadano@demo.local` | `demo123` |
| Funcionario | `funcionario@demo.local` | `admin123` |

También se puede registrar cualquier cuenta nueva (queda como ciudadano). El modo local es solo para
revisar la app sin backend; no es un sistema de seguridad.

## Cómo correr la app

Requisitos: Node 20+ y npm.

```bash
npm install
cp .env.example .env      # opcional: pegar VITE_SUPABASE_URL y VITE_SUPABASE_KEY
npm run dev               # http://localhost:5173
npm run build             # compila a dist/
```

### Conectar Supabase (cuando exista el proyecto)

1. Crear el proyecto en supabase.com.
2. SQL Editor → ejecutar `supabase/schema.sql` y luego `supabase/seed.sql` (6 dependencias).
3. Authentication → Providers → Email activo (en desarrollo se puede desactivar «Confirm email»).
4. Copiar la Project URL y la llave **publishable/anon** en `.env` (nunca la secret/service_role).
5. Registrar `ciudadano@demo.local` y `funcionario@demo.local` desde la app y volver funcionario al segundo:
   `update public.profiles set rol = 'admin' where email = 'funcionario@demo.local';`

### Pruebas automáticas en navegador

Con `npm run dev` corriendo y Chrome/Chromium instalado:

```bash
npm run capturas          # recorrido ciudadano → funcionario; guarda 16 capturas en capturas/
npm run prueba:realtime   # un mensaje enviado en una pestaña llega a la otra sin recargar
npm run prueba:formato    # formatearPrecio: «3 días hábiles» y, con formato 'moneda', «$ 60.000»
```

La foto que usa el guion de capturas (`scripts/fixtures/foto-prueba.jpg`) es un **dibujo generado**
para la prueba, no una foto real. Las capturas consultan Nominatim de verdad, así que las direcciones
que aparecen son reales para las coordenadas simuladas (barrio San Antonio).

### Android (Capacitor)

`capacitor.config.json` ya está creado (`appName: ReportaCali`). Para generar el proyecto nativo:

```bash
npm install -D @capacitor/cli@8 && npm install @capacitor/android@8
npm run build && npx cap add android && npx cap sync && npx cap open android
```

## Estructura de carpetas

```
src/
├── helpers/      brand.js (tema), utils.js (funciones generales), geocoding.js (Nominatim),
│                 localDb.js, seeds.js, archivos.js
├── context/      AuthContext.jsx (comparte la única instancia de useAuth)
├── pages/        Login/ Register/ Home/ Map/ Orders/ Chat/ Profile/ Admin/  → Index.jsx + Index.module.scss
├── components/   CardItem/ MapView/ ChatBubble/ RequestModal/ NetworkBadge/ Direccion/
│   └── shared/   Menu.jsx + Menu.module.scss, Header.jsx + Header.module.scss
├── hooks/        useAuth, useCollection, useRealtimeChat, useGeolocation, useCamera,
│                 useNetwork, useLocalStorage, useHaptics, useDireccion
├── routes/       AppRoutes.jsx, UserRoutes.jsx, AdminRoutes.jsx
├── lib/          supabase.js (cliente único)
└── theme/        variables.css
```

## Limitaciones conocidas

- **Supabase sin probar contra un proyecto real**: el código del SDK y `schema.sql` están completos,
  pero no hay llaves; lo verificado en navegador es el modo local.
- **Tiempo real en modo local**: solo entre pestañas del mismo navegador (BroadcastChannel); entre
  dispositivos distintos hace falta Supabase Realtime.
- **Cámara en navegador**: abre el selector de archivos (en un celular, el navegador ofrece la cámara
  desde ahí); la cámara nativa funciona en el dispositivo con Capacitor.
- **Haptics**: en el navegador la vibración no hace nada.
- **Nominatim** es un servicio público con límite de 1 petición/s; para un despliegue real habría que
  usar un servidor propio o un proveedor comercial. Las direcciones de OpenStreetMap pueden ser imprecisas.
- El paquete JS pesa ~1,6 MB sin dividir (Vite avisa); no afecta el funcionamiento.
