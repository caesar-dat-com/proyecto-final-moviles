// Cliente único de Supabase para toda la app (Clase 09).
// Si no hay llaves en el .env, `supabase` queda en null y los hooks
// usan el respaldo local (localStorage + BroadcastChannel) con la misma interfaz.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

export const haySupabase = Boolean(url && key);

export const supabase = haySupabase ? createClient(url, key) : null;

export default supabase;
