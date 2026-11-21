# Challenge 15 — Tareas con Supabase (auth, CRUD, realtime, storage, cámara)

> Enunciado reconstruido a partir de las diapositivas 7-23 de «Clase 09 - Supabase»; el profesor no
> publicó el enunciado original como documento aparte.

## De dónde sale

- La **diapositiva 23** de la Clase 09 trae un reto con el título «CHALLENGE 08». Su texto (en inglés en la diapositiva) es:
  > CHALLENGE 08
  > Create the project, the tasks table with RLS, and the avatars bucket.
  > Registration, login, CRUD, and live list.
  > Use Ionic components and camera photo capture.
- Detalles tomados de las diapositivas:
  - 7: `create table tareas (id, titulo, completada, user_id default auth.uid(), created_at)`.
  - 8: RLS: «ver / crear / editar / borrar mis tareas» con `(select auth.uid()) = user_id`.
  - 10: `alter publication supabase_realtime add table tareas;`
  - 11: Auth con email.
  - 12-13: bucket `avatars` y políticas por carpeta `<uid>/`.
  - 16-21: `.env` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`, cliente único en `src/lib/supabase.js`,
    CRUD, login/registro, storage y suscripción realtime.
- **Lo reconstruido es la numeración** (diapositiva «08» → hoja «15»; ver el README).

## Enunciado (versión de trabajo)

1. Crear el proyecto de Supabase, la tabla `tareas` con RLS y el bucket `avatars`.
2. Registro y login reales.
3. CRUD de tareas: crear, listar, marcar como completada o editar, y borrar.
4. Lista en vivo: si cambia la tabla, se actualiza sin recargar.
5. Interfaz con componentes de Ionic y foto con la cámara (subida al bucket `avatars`).
