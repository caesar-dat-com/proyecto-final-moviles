// useGeolocation — GPS del teléfono con @capacitor/geolocation (Clase 08 / 10).
// En web Capacitor usa navigator.geolocation por debajo.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';

const OPCIONES = { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 };

const aPosicion = (pos) => ({
  lat: pos.coords.latitude,
  lng: pos.coords.longitude,
  precision: pos.coords.accuracy,
  fecha: pos.timestamp,
});

// seguir: watchPosition continuo; auto: pedir la posición al montar
export const useGeolocation = ({ seguir = false, auto = true } = {}) => {
  const [posicion, setPosicion] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const idSeguimiento = useRef(null);

  const obtenerActual = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const pos = await Geolocation.getCurrentPosition(OPCIONES);
      const p = aPosicion(pos);
      setPosicion(p);
      return p;
    } catch (e) {
      setError(e.message || 'No se pudo obtener la ubicación.');
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  const detener = useCallback(async () => {
    if (idSeguimiento.current) {
      await Geolocation.clearWatch({ id: idSeguimiento.current });
      idSeguimiento.current = null;
    }
  }, []);

  const iniciar = useCallback(async () => {
    await detener();
    idSeguimiento.current = await Geolocation.watchPosition(OPCIONES, (pos, err) => {
      if (err) setError(err.message);
      else if (pos) setPosicion(aPosicion(pos));
    });
  }, [detener]);

  useEffect(() => {
    if (seguir) iniciar();
    else if (auto) obtenerActual();
    return () => {
      detener();
    };
  }, [seguir, auto, iniciar, obtenerActual, detener]);

  return { posicion, error, cargando, obtenerActual, iniciar, detener };
};

export default useGeolocation;
