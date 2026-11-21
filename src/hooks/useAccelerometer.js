// useAccelerometer — movimiento del teléfono con @capacitor/motion (Clase 08, slides 8-11).
// Motion.addListener(OPCION) con OPCION = 'accel' | 'orientation'.
// En web Capacitor escucha devicemotion/deviceorientation; en un PC de escritorio esos
// eventos no llegan nunca, por eso el hook expone `simular()` como respaldo para probar.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Motion } from '@capacitor/motion';

const redondear = (n) => (n == null ? null : Math.round(n * 100) / 100);

// Magnitud de la aceleración (sin gravedad) en m/s²
export const magnitud = ({ x = 0, y = 0, z = 0 } = {}) => Math.sqrt(x * x + y * y + z * z);

export const useAccelerometer = (opcion = 'accel') => {
  const [datos, setDatos] = useState(null);
  const [activo, setActivo] = useState(false);
  const [error, setError] = useState(null);
  const oyente = useRef(null);

  const detener = useCallback(async () => {
    await oyente.current?.remove();
    oyente.current = null;
    setActivo(false);
  }, []);

  const iniciar = useCallback(async () => {
    setError(null);
    await detener();
    try {
      // iOS 13+ exige pedir permiso para leer el movimiento (solo en web)
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const permiso = await DeviceMotionEvent.requestPermission();
        if (permiso !== 'granted') throw new Error('Permiso de movimiento denegado.');
      }
      oyente.current = await Motion.addListener(opcion, (evento) => {
        if (opcion === 'accel') {
          const a = evento.acceleration || {};
          setDatos({ x: redondear(a.x), y: redondear(a.y), z: redondear(a.z), fecha: Date.now() });
        } else {
          setDatos({ alpha: redondear(evento.alpha), beta: redondear(evento.beta), gamma: redondear(evento.gamma), fecha: Date.now() });
        }
      });
      setActivo(true);
    } catch (e) {
      setError(e.message || 'Este dispositivo no entrega datos de movimiento.');
    }
  }, [opcion, detener]);

  // Respaldo web: genera una lectura aleatoria (sacudida) para probar la interfaz
  const simular = useCallback(() => {
    const r = () => redondear((Math.random() - 0.5) * 8);
    setDatos(
      opcion === 'accel'
        ? { x: r(), y: r(), z: r(), fecha: Date.now(), simulado: true }
        : { alpha: redondear(Math.random() * 360), beta: redondear((Math.random() - 0.5) * 180), gamma: redondear((Math.random() - 0.5) * 90), fecha: Date.now(), simulado: true },
    );
  }, [opcion]);

  useEffect(() => () => {
    oyente.current?.remove();
  }, []);

  return { datos, activo, error, iniciar, detener, simular };
};

export default useAccelerometer;
