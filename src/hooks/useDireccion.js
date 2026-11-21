// useDireccion — dirección legible de unas coordenadas (geocoding inverso con Nominatim).
// Devuelve { direccion, cargando, error, texto }:
//   texto = la dirección si se obtuvo; si no, las coordenadas (respaldo cuando falla la API).
import { useEffect, useState } from 'react';
import { coordenadasTexto, direccionDesdeCoords, leerCache } from '../helpers/geocoding';

export const useDireccion = (lat, lng) => {
  const valido = lat != null && lng != null && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng));
  const [estado, setEstado] = useState(() => ({
    direccion: valido ? leerCache(lat, lng) : null,
    cargando: false,
    error: null,
  }));

  useEffect(() => {
    if (!valido) return undefined;
    let vigente = true;
    const enCache = leerCache(lat, lng);
    if (enCache) {
      setEstado({ direccion: enCache, cargando: false, error: null });
      return undefined;
    }
    setEstado({ direccion: null, cargando: true, error: null });
    direccionDesdeCoords(lat, lng)
      .then((direccion) => vigente && setEstado({ direccion, cargando: false, error: null }))
      .catch((e) => vigente && setEstado({ direccion: null, cargando: false, error: e.message }));
    return () => {
      vigente = false;
    };
  }, [lat, lng, valido]);

  const texto = estado.direccion || (valido ? coordenadasTexto(lat, lng) : 'Sin ubicación');
  return { ...estado, texto };
};

export default useDireccion;
