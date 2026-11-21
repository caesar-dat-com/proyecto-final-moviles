// Subida de imágenes: Supabase Storage (bucket "avatars") o dataUrl en modo local.
import { haySupabase, supabase } from '../lib/supabase';

export const dataUrlABlob = async (dataUrl) => (await fetch(dataUrl)).blob();

// Ruta <uid>/<nombre>.jpg: coincide con la política RLS de la Clase 09
export const subirImagen = async (uid, dataUrl, nombre = 'avatar') => {
  if (!haySupabase) return dataUrl;
  const blob = await dataUrlABlob(dataUrl);
  const ruta = `${uid}/${nombre}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('avatars').upload(ruta, blob, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;
  return supabase.storage.from('avatars').getPublicUrl(ruta).data.publicUrl;
};
