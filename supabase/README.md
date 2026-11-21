# Backend de ReportaCali (Supabase)

| Archivo | Qué es | ¿Va a Supabase? |
|---|---|---|
| `schema.sql` | Tablas, funciones, triggers, RLS, publicación Realtime, bucket `avatars` | **Sí** (1.º) |
| `seed.sql` | 6 dependencias de ejemplo (`places`) | **Sí** (2.º) |
| `opcional-privacidad-estricta.sql` | Variante: cada ciudadano ve solo sus reportes y chats | Solo si se decide (3.º) |
| `local-shim.sql` | Emula `auth`, `storage`, roles y `supabase_realtime` en Postgres puro | **NO. Solo pruebas locales** |
| `pruebas-locales/` | Pruebas RLS, contrato cliente↔schema y Realtime | **NO** |

Todos los `.sql` que van a Supabase son **re-ejecutables** (se pueden correr dos veces sin error).

## 1. Crear el proyecto en supabase.com

1. Entrar a <https://supabase.com> → **New project**. Elegir organización, nombre
   (`reportacali`), contraseña de la base de datos (guardarla) y región cercana
   (p. ej. *East US* o *South America (São Paulo)*). Plan Free.
2. Esperar a que el proyecto quede *Healthy*.
3. **SQL Editor → New query** → pegar `schema.sql` completo → **Run**. Debe terminar en
   *Success. No rows returned*.
4. **SQL Editor → New query** → pegar `seed.sql` → **Run** (inserta 6 dependencias).
5. *(Opcional)* Solo si se quiere que los reportes NO sean públicos entre vecinos:
   correr `opcional-privacidad-estricta.sql`. Ojo: con esto el Mapa y la pestaña «Activos»
   de un ciudadano solo muestran sus propios reportes.
6. **Authentication → Sign In / Providers → Email**: activo. En desarrollo se puede
   desactivar *Confirm email* para que el registro entre directo.
7. **Database → Publications → `supabase_realtime`**: verificar que aparezcan
   `messages`, `requests` y `places` (las agrega `schema.sql`).
8. **Storage**: verificar que existe el bucket público `avatars` (lo crea `schema.sql`).
9. Registrar desde la app `ciudadano@demo.local` / `demo123` y `funcionario@demo.local` /
   `admin123`, y volver funcionario al segundo (SQL Editor):
   ```sql
   update public.profiles set rol = 'admin' where email = 'funcionario@demo.local';
   ```

## 2. Variables de `.env` (en `app/`)

```bash
cp .env.example .env
```

```dotenv
VITE_SUPABASE_URL=https://<ref-del-proyecto>.supabase.co
VITE_SUPABASE_KEY=<llave publishable / anon>
```

Ambas están en **Project Settings → API Keys** (la URL también en *Data API*).
Usa **solo** la llave *publishable/anon*; **nunca** la *secret/service_role* (salta RLS).
Si las dejas vacías la app corre en modo local (localStorage + BroadcastChannel).

## 3. Pruebas locales (sin cuenta de Supabase)

Las pruebas corren `local-shim.sql → schema.sql → seed.sql` en un PostgreSQL 16 desechable
y luego `pruebas-locales/rls.sql`, `cliente.sql` y `realtime.sql`. Requisitos del servidor:
`wal_level=logical` (para la prueba de Realtime). Cómo se simula un usuario:

```sql
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"<uuid>","role":"authenticated"}', false);
-- ... consultas: RLS evalúa auth.uid() = <uuid>
reset role;
set role anon;   -- anónimo: sin claims, auth.uid() = null
```

### Opción A — Docker (`postgres:16-alpine`)

Requiere que tu usuario pueda usar Docker. El puerto se publica **solo en 127.0.0.1**.

```bash
docker run -d --rm --name reportacali-pg \
  -e POSTGRES_PASSWORD=solo-local-123 \
  -p 127.0.0.1:55432:5432 \
  postgres:16-alpine -c wal_level=logical

cd app/supabase/pruebas-locales
PGHOST=127.0.0.1 PGPORT=55432 PGUSER=postgres PGPASSWORD=solo-local-123 ./correr.sh
PGHOST=127.0.0.1 PGPORT=55432 PGUSER=postgres PGPASSWORD=solo-local-123 ./correr.sh estricta

# Prueba LISTEN/NOTIFY (necesita psycopg2: pip install psycopg2-binary)
python -I realtime_notify.py "host=127.0.0.1 port=55432 user=postgres password=solo-local-123 dbname=reportacali_test"

docker rm -f reportacali-pg      # apagar y borrar
docker ps                        # no debe quedar nada
```

### Opción B — sin Docker (binarios de Postgres 16 por pip)

Es la que se usó el 21-nov-2026 (el usuario de pruebas no tenía acceso a Docker).
Escucha solo en un socket Unix, sin TCP.

```bash
cd /srv/mark02/moviles-supabase
python3 -m venv .pgtest/venv
.pgtest/venv/bin/pip install --no-cache-dir pgserver psycopg2-binary
BIN=$(ls -d .pgtest/venv/lib/python3*/site-packages/pgserver/pginstall/bin)
$BIN/initdb -D .pgtest/data -U postgres --auth=trust -E UTF8 --locale=C.UTF-8
mkdir -p .pgtest/sock
$BIN/pg_ctl -D .pgtest/data -l .pgtest/pg.log \
  -o "-c listen_addresses='' -c port=55432 -c unix_socket_directories=$PWD/.pgtest/sock -c wal_level=logical" start

PATH=$BIN:$PATH PGHOST=$PWD/.pgtest/sock PGPORT=55432 PGUSER=postgres app/supabase/pruebas-locales/correr.sh
.pgtest/venv/bin/python -I app/supabase/pruebas-locales/realtime_notify.py \
  "host=$PWD/.pgtest/sock port=55432 user=postgres dbname=reportacali_test"

$BIN/pg_ctl -D .pgtest/data stop -m fast && rm -rf .pgtest   # apagar y borrar
```

### Qué debe salir

- `correr.sh` termina con código 0; los únicos `ERROR` son las negaciones esperadas de RLS
  (pruebas T2c, T2d, T3a, T3f, T3h, T4d, T4e, T6-carpeta ajena, T5b; en modo estricto además T4h).
- `realtime.sql` lista `INSERT messages`, `UPDATE requests`, `UPDATE places` y **no** el
  cambio en `profiles` (tabla no publicada).
- `realtime_notify.py`: el oyente de la sala correcta recibe el mensaje; el de otra sala no.

Las salidas reales de la corrida del 21-nov-2026 están en `pruebas-locales/salidas/`.

## Qué NO prueba el entorno local

- El servidor Realtime de Supabase (WebSocket, `postgres_changes` con `filter`, y que
  aplique RLS por suscriptor). Se probó la capa Postgres: publicación + decodificación lógica.
- La API de Storage (subida real, `upsert`, URLs públicas): solo se probaron sus políticas
  RLS sobre una tabla `storage.objects` emulada.
- GoTrue (registro, login, confirmación de correo, JWT reales): `auth.users` y `auth.uid()`
  están emulados en `local-shim.sql`.
