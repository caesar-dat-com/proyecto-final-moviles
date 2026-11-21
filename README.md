# ServiCasa — Proyecto Final de Plataformas Móviles (UAO, curso 14780)

Construí una app móvil en **Ionic React** para pedir servicios a domicilio: catálogo de servicios,
mapa con mi ubicación, solicitudes (pedidos) con seguimiento de estado y chat en tiempo real
entre el cliente y el administrador.

> El nombre, los colores y los textos salen de `src/helpers/brand.js`. Para cambiar de tema
> solo edito ese archivo y los datos de ejemplo (`src/helpers/seeds.js` y `supabase/seed.sql`).

## Integrantes

| Nombre | Rama |
|---|---|
| César Armando Reyes | `proyecto-final-cesar-reyes` (mezclada en `main`) |

## Enlaces

- **Prototipo (Lovable):** _PENDIENTE — pegar aquí el enlace del prototipo_
- **Documento final (alcance y tecnologías):** [`DOCUMENTO_FINAL.md`](./DOCUMENTO_FINAL.md)
- **Capturas de la app funcionando:** carpeta [`capturas/`](./capturas)

## APIs de backend consumidas

Uso **Supabase** como backend (Clase 09) mediante `@supabase/supabase-js`, con un único cliente en
`src/lib/supabase.js`:

| API | Para qué la uso | Dónde |
|---|---|---|
| Supabase Auth — `signUp`, `signInWithPassword`, `signOut`, `getSession`, `onAuthStateChange` | Registro, login y sesión | `src/hooks/useAuth.js` |
| Supabase Database (PostgREST) — `from(tabla).select/insert/update/delete` | CRUD de `profiles`, `places`, `requests`, `messages` | `src/hooks/useCollection.js`, `useAuth.js`, `useRealtimeChat.js` |
| Supabase Realtime — `channel().on('postgres_changes')` | Chat en vivo y listas que se refrescan solas | `src/hooks/useRealtimeChat.js`, `useCollection.js` |
| Supabase Storage — bucket `avatars` (`upload`, `getPublicUrl`) | Foto de perfil y foto adjunta a la solicitud | `src/helpers/archivos.js` |
| OpenStreetMap Tile API (`tile.openstreetmap.org`) | Mosaicos del mapa en Leaflet | `src/components/MapView/MapView.jsx` |

APIs nativas con Capacitor: `@capacitor/geolocation`, `@capacitor/camera`, `@capacitor/haptics`,
`@capacitor/network`.

El esquema completo (tablas, RLS, trigger de perfiles, publicación de Realtime y bucket) está en
[`supabase/schema.sql`](./supabase/schema.sql), y los datos de ejemplo en `supabase/seed.sql`.

## Estado del backend (importante)

**Hoy el repositorio no trae llaves de Supabase.** Por eso dejé el mismo patrón que me funcionó en
el Parcial 1:

```js
// src/lib/supabase.js
export const haySupabase = Boolean(url && key);
```

- **Con llaves** (`.env`): los hooks usan Supabase Auth, Database, Realtime y Storage.
- **Sin llaves**: los **mismos hooks**, con la misma interfaz, guardan en `localStorage` y emiten
  los cambios por `BroadcastChannel`, así que el chat y las listas se actualizan en vivo entre
  pestañas del mismo navegador. La app muestra "Modo local (sin backend)" en el login, el menú y el
  perfil para que nadie lo confunda con un backend real.

En modo local hay dos cuentas de demostración: `admin@demo.local / admin123` (administrador) y
`tecnico@demo.local / demo123` (usuario). También se puede registrar cualquier cuenta nueva.
El modo local es solo para revisar la app sin backend; no es un sistema de seguridad.

## Cómo correr la app

Requisitos: Node 20+ y npm.

```bash
npm install
cp .env.example .env      # opcional: pegar VITE_SUPABASE_URL y VITE_SUPABASE_KEY
npm run dev               # http://localhost:5173
npm run build             # compila a dist/
```

### Conectar Supabase (cuando tenga el proyecto creado)

1. Crear el proyecto en supabase.com (región São Paulo).
2. SQL Editor → ejecutar `supabase/schema.sql` y luego `supabase/seed.sql`.
3. Authentication → Providers → Email activo (para desarrollo puedo desactivar "Confirm email").
4. Copiar Project URL y la llave **publishable/anon** en `.env` (nunca la secret/service_role).
5. Registrarme en la app y volverme admin:
   `update public.profiles set rol = 'admin' where email = 'mi@correo.com';`

### Pruebas automáticas en navegador (opcional)

Con `npm run dev` corriendo y Chrome/Chromium instalado:

```bash
npm run capturas          # recorre registro → solicitud → chat → mapa → admin y guarda capturas/
npm run prueba:realtime   # verifica que un mensaje enviado en una pestaña llega a otra sin recargar
```

### Android (Capacitor)

`capacitor.config.json` ya está creado. Para generar el proyecto nativo:

```bash
npm install -D @capacitor/cli@8 && npm install @capacitor/android@8
npm run build && npx cap add android && npx cap sync && npx cap open android
```

## Estructura de carpetas

```
src/
├── helpers/      brand.js (tema), utils.js (funciones generales), localDb.js, seeds.js, archivos.js
├── context/      AuthContext.jsx (comparte la única instancia de useAuth)
├── pages/        Login/ Register/ Home/ Map/ Orders/ Chat/ Profile/ Admin/  → Index.jsx + Index.module.scss
├── components/   CardItem/ MapView/ ChatBubble/ RequestModal/ NetworkBadge/
│   └── shared/   Menu.jsx + Menu.module.scss, Header.jsx + Header.module.scss
├── hooks/        useAuth, useCollection, useRealtimeChat, useGeolocation, useCamera,
│                 useNetwork, useLocalStorage, useHaptics
├── routes/       AppRoutes.jsx, UserRoutes.jsx, AdminRoutes.jsx
├── lib/          supabase.js (cliente único)
└── theme/        variables.css
```

## Limitaciones conocidas

- **Sin proyecto Supabase**: el código del SDK está completo, pero no lo he probado contra un
  proyecto real porque todavía no hay llaves. Lo verificado en navegador es el modo local.
- **Cámara**: en el navegador, Capacitor abre el selector de archivos en vez de la cámara; la
  cámara real solo funciona en el dispositivo (o instalando `@ionic/pwa-elements`).
- **Haptics**: en el navegador la vibración no hace nada; funciona en el teléfono.
- **Tiempo real en modo local**: solo entre pestañas del mismo navegador (BroadcastChannel); entre
  dispositivos distintos se necesita Supabase Realtime.
- El paquete JS pesa ~1.6 MB sin dividir (Vite avisa); no afecta el funcionamiento.
