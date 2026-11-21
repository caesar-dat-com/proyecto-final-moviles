// useRealtimeChat — mensajes de una sala en tiempo real.
// Supabase Realtime (postgres_changes INSERT) cuando hay llaves;
// BroadcastChannel + localStorage cuando no. Misma interfaz en ambos casos.
import { useCallback, useEffect, useState } from 'react';
import { haySupabase, supabase } from '../lib/supabase';
import { consultar, insertar, suscribir } from '../helpers/localDb';

const ordenar = (lista) => [...lista].sort((a, b) => (a.created_at > b.created_at ? 1 : -1));

export const useRealtimeChat = (sala, autor) => {
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Agrega un mensaje evitando duplicados (el emisor también recibe su propio INSERT)
  const agregar = useCallback((msg) => {
    setMensajes((prev) => (prev.some((m) => m.id === msg.id) ? prev : ordenar([...prev, msg])));
  }, []);

  useEffect(() => {
    if (!sala) return undefined;
    let activo = true;
    setCargando(true);
    setMensajes([]);

    if (haySupabase) {
      supabase
        .from('messages')
        .select('*')
        .eq('room', sala)
        .order('created_at', { ascending: true })
        .limit(200)
        .then(({ data, error: e }) => {
          if (!activo) return;
          if (e) setError(e.message);
          else setMensajes(data);
          setCargando(false);
        });

      const canal = supabase
        .channel(`chat-${sala}-${Math.random().toString(36).slice(2)}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `room=eq.${sala}` },
          (payload) => agregar(payload.new),
        )
        .subscribe();

      return () => {
        activo = false;
        supabase.removeChannel(canal);
      };
    }

    setMensajes(consultar('messages', [['room', '==', sala]], { campo: 'created_at', asc: true }));
    setCargando(false);
    const desuscribir = suscribir('messages', ({ tipo, fila }) => {
      if (tipo === 'INSERT' && fila.room === sala) agregar(fila);
    });
    return () => {
      activo = false;
      desuscribir();
    };
  }, [sala, agregar]);

  const enviar = useCallback(
    async (texto) => {
      const limpio = texto.trim();
      if (!limpio || !autor?.id) return;
      const datos = { room: sala, user_id: autor.id, autor: autor.nombre, texto: limpio };
      if (haySupabase) {
        const { data, error: e } = await supabase.from('messages').insert(datos).select().single();
        if (e) throw e;
        agregar(data);
      } else {
        agregar(insertar('messages', datos));
      }
    },
    [sala, autor, agregar],
  );

  return { mensajes, cargando, error, enviar };
};

export default useRealtimeChat;
