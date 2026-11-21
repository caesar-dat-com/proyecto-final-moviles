// useCollection — CRUD genérico sobre cualquier tabla (estilo Clase 07).
// Filtros con el formato del curso: [["categoria", "==", "Aseo"], ["precio", "<", 80000]]
// Con `realtime: true` la lista se refresca sola ante cambios de otros usuarios/pestañas.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { haySupabase, supabase } from '../lib/supabase';
import * as localDb from '../helpers/localDb';

// Traduce los operadores del curso a métodos del query builder de Supabase
const OPERADORES_SB = { '==': 'eq', '!=': 'neq', '>': 'gt', '>=': 'gte', '<': 'lt', '<=': 'lte', in: 'in' };

export const useCollection = (tabla, { filtros = [], orden = { campo: 'created_at', asc: false }, realtime = false } = {}) => {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Claves estables para no re-ejecutar efectos en cada render
  const claveFiltros = JSON.stringify(filtros);
  const claveOrden = JSON.stringify(orden);
  const filtrosMemo = useMemo(() => JSON.parse(claveFiltros), [claveFiltros]);
  const ordenMemo = useMemo(() => JSON.parse(claveOrden), [claveOrden]);

  const getAll = useCallback(async () => {
    setError(null);
    try {
      if (haySupabase) {
        let query = supabase.from(tabla).select('*');
        filtrosMemo.forEach(([campo, op, valor]) => {
          query = query[OPERADORES_SB[op] || 'eq'](campo, valor);
        });
        if (ordenMemo?.campo) query = query.order(ordenMemo.campo, { ascending: !!ordenMemo.asc });
        const { data, error: e } = await query;
        if (e) throw e;
        setItems(data);
        return data;
      }
      const data = localDb.consultar(tabla, filtrosMemo, ordenMemo);
      setItems(data);
      return data;
    } catch (e) {
      setError(e.message);
      return [];
    } finally {
      setCargando(false);
    }
  }, [tabla, filtrosMemo, ordenMemo]);

  const add = useCallback(
    async (datos) => {
      let fila;
      if (haySupabase) {
        const { data, error: e } = await supabase.from(tabla).insert(datos).select().single();
        if (e) throw e;
        fila = data;
      } else {
        fila = localDb.insertar(tabla, datos);
      }
      if (!realtime) await getAll();
      return fila;
    },
    [tabla, realtime, getAll],
  );

  const update = useCallback(
    async (id, cambios) => {
      let fila;
      if (haySupabase) {
        const { data, error: e } = await supabase.from(tabla).update(cambios).eq('id', id).select().single();
        if (e) throw e;
        fila = data;
      } else {
        fila = localDb.actualizar(tabla, id, cambios);
      }
      if (!realtime) await getAll();
      return fila;
    },
    [tabla, realtime, getAll],
  );

  const remove = useCallback(
    async (id) => {
      if (haySupabase) {
        const { error: e } = await supabase.from(tabla).delete().eq('id', id);
        if (e) throw e;
      } else {
        localDb.eliminar(tabla, id);
      }
      if (!realtime) await getAll();
    },
    [tabla, realtime, getAll],
  );

  // Carga inicial + suscripción en tiempo real
  useEffect(() => {
    getAll();
    if (!realtime) return undefined;

    if (haySupabase) {
      const canal = supabase
        .channel(`coleccion-${tabla}-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tabla }, () => getAll())
        .subscribe();
      return () => {
        supabase.removeChannel(canal);
      };
    }
    return localDb.suscribir(tabla, () => getAll());
  }, [tabla, realtime, getAll]);

  return { items, cargando, error, getAll, add, update, remove };
};

export default useCollection;
