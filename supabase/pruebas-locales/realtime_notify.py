"""Prueba LISTEN/NOTIFY — SOLO LOCAL.

Emula la suscripción de src/hooks/useRealtimeChat.js:
  .on('postgres_changes', {event:'INSERT', table:'messages', filter:'room=eq.<sala>'})
Crea un trigger TEMPORAL de prueba (pg_temp no se puede usar en triggers, así que lo crea
en public y lo borra al final) que hace pg_notify en el canal de la sala, inserta como
ciudadano (con RLS) y verifica que el oyente de la sala correcta recibe el mensaje y el
de otra sala no.

Uso: python -I realtime_notify.py "host=<socket_dir> port=55432 user=postgres dbname=fixed"
"""
import json
import select
import sys

import psycopg2

dsn = sys.argv[1]
oyente_sala = psycopg2.connect(dsn)
oyente_otra = psycopg2.connect(dsn)
escritor = psycopg2.connect(dsn)
for c in (oyente_sala, oyente_otra, escritor):
    c.autocommit = True

cur = escritor.cursor()
cur.execute("""
create or replace function public._prueba_notify_messages() returns trigger
language plpgsql as $$
begin
  perform pg_notify('messages:room=eq.' || new.room, row_to_json(new)::text);
  return new;
end $$;
drop trigger if exists _prueba_notify on public.messages;
create trigger _prueba_notify after insert on public.messages
  for each row execute function public._prueba_notify_messages();
""")
cur.execute("select id from public.requests order by id limit 1")
req_id = cur.fetchone()[0]
sala = f"request-{req_id}"

oyente_sala.cursor().execute(f'listen "messages:room=eq.{sala}"')
oyente_otra.cursor().execute('listen "messages:room=eq.request-999999"')

try:
    cur.execute("select id from public.profiles where email = 'ana@demo.local'")
    ana = cur.fetchone()[0]
    cur.execute("set role authenticated")
    cur.execute("select set_config('request.jwt.claims', %s, false)",
                (json.dumps({"sub": str(ana), "role": "authenticated"}),))
    cur.execute(
        "insert into public.messages (room, user_id, autor, texto) values (%s, auth.uid(), 'x', %s) returning id",
        (sala, "mensaje para el oyente"),
    )
    nuevo_id = cur.fetchone()[0]
    cur.execute("reset role")
    print(f"INSERT como ana (RLS activa) en sala {sala}: id={nuevo_id}")

    for nombre, conn in (("oyente " + sala, oyente_sala), ("oyente request-999999", oyente_otra)):
        select.select([conn], [], [], 2.0)
        conn.poll()
        if conn.notifies:
            n = conn.notifies.pop(0)
            fila = json.loads(n.payload)
            print(f"{nombre}: RECIBIDO canal={n.channel} id={fila['id']} autor={fila['autor']!r} texto={fila['texto']!r}")
        else:
            print(f"{nombre}: nada recibido en 2 s")
finally:
    cur.execute("reset role")
    cur.execute("drop trigger if exists _prueba_notify on public.messages; "
                "drop function if exists public._prueba_notify_messages();")
    for c in (oyente_sala, oyente_otra, escritor):
        c.close()
