#!/usr/bin/env bash
# Corre todas las pruebas locales del backend contra un PostgreSQL 16 desechable.
# SOLO LOCAL. Conexión por variables estándar PGHOST/PGPORT/PGUSER/PGPASSWORD.
# El servidor debe tener wal_level=logical (para realtime.sql).
#   ./correr.sh             → modo por defecto (reportes públicos para vecinos, como el README)
#   ./correr.sh estricta    → además aplica opcional-privacidad-estricta.sql
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
SQL="$DIR/.."
DB="reportacali_test"
PSQL=(psql -X -v ON_ERROR_STOP=1 -q)

psql -X -q -d postgres -c "drop database if exists $DB" -c "create database $DB" || exit 1
for f in local-shim.sql schema.sql seed.sql; do
  echo "== $f"; "${PSQL[@]}" -d "$DB" -f "$SQL/$f" || { echo "FALLÓ $f"; exit 1; }
done
if [ "${1:-}" = "estricta" ]; then
  echo "== opcional-privacidad-estricta.sql"
  "${PSQL[@]}" -d "$DB" -f "$SQL/opcional-privacidad-estricta.sql" || exit 1
fi
echo "== re-ejecución de schema.sql + seed.sql (deben ser idempotentes)"
"${PSQL[@]}" -d "$DB" -f "$SQL/schema.sql" && "${PSQL[@]}" -d "$DB" -f "$SQL/seed.sql" || { echo "NO idempotente"; exit 1; }
[ "${1:-}" = "estricta" ] && "${PSQL[@]}" -d "$DB" -f "$SQL/opcional-privacidad-estricta.sql"

# rls.sql y cliente.sql muestran ERROR esperados: sin ON_ERROR_STOP
for f in rls.sql cliente.sql realtime.sql; do
  echo; echo "################ $f"; psql -X -d "$DB" -f "$DIR/$f" 2>&1
done
