# Notas — Challenge 15 (Tareas con Supabase)

## Código

| Archivo | Qué hace |
|---|---|
| `src/pages/Challenges/Tareas/Index.jsx` + `Index.module.scss` | Página de tareas: crear, completar, editar (alerta), borrar, filtros, foto de perfil |
| `src/hooks/useCollection.js` (existente) | CRUD + `realtime: true` (`postgres_changes`) sobre la tabla `tareas` |
| `src/hooks/useAuth.js` / `AuthContext` (existentes) | Registro y login reales con Supabase Auth |
| `src/hooks/useCamera.js` + `src/helpers/archivos.js` (existentes) | Foto → bucket `avatars/<uid>/avatar-*.jpg` |
| `challenges/15-supabase-tareas/tareas.sql` | Tabla, RLS, realtime y bucket, tomados de las diapositivas |

## Dos modos

- **Con Supabase** (`app/.env` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`; antes hay que correr
  `tareas.sql`): Auth, PostgREST, Realtime y Storage reales. RLS hace que cada usuario vea solo sus tareas.
- **Sin llaves** (lo que hay en este PC: no existe `app/.env`): la app usa su respaldo local
  (`localStorage` + `BroadcastChannel`) con la misma interfaz. La lista en vivo funciona entre
  pestañas del mismo navegador.

## Limitación honesta

**No se probó contra un proyecto real de Supabase**: en este PC no hay llaves y no creé ninguna cuenta.
Lo que sí quedó probado es el modo local, con captura real (`capturas/09-c15-tareas.png`): 3 tareas
creadas, 1 completada y foto de perfil puesta. El SQL sale de las diapositivas, pero no lo ejecuté.

## Cómo probar

1. Supabase → SQL Editor → pegar `tareas.sql`.
2. `cp .env.example .env` y llenar `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY` (solo la llave publishable).
3. `npm run dev` → registrarse → menú «Challenges 14-17» → 15.
4. Abrir la misma cuenta en dos pestañas: si se crea una tarea en una, aparece sola en la otra.
