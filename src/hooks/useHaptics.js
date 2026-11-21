// useHaptics — vibración / respuesta táctil con @capacitor/haptics (Clase 08).
// En dispositivos sin vibrador la API resuelve sin hacer nada.
import { useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const useHaptics = () => {
  const impacto = useCallback(async (estilo = ImpactStyle.Medium) => {
    try {
      await Haptics.impact({ style: estilo });
    } catch {
      /* navegador sin soporte: se ignora */
    }
  }, []);

  const exito = useCallback(async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      /* sin soporte */
    }
  }, []);

  const vibrar = useCallback(async (duracion = 300) => {
    try {
      await Haptics.vibrate({ duration: duracion });
    } catch {
      /* sin soporte */
    }
  }, []);

  return { impacto, exito, vibrar };
};

export default useHaptics;
