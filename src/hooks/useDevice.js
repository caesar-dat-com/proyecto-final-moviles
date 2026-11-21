// useDevice — información del dispositivo y batería con @capacitor/device (Clase 08, slides 12-14).
// En web Capacitor usa navigator.userAgent y navigator.getBattery() (Chrome/Edge/Android);
// Firefox y Safari no tienen getBattery(), entonces la batería queda en null.
import { useCallback, useEffect, useState } from 'react';
import { Device } from '@capacitor/device';

export const useDevice = ({ intervaloBateria = 30000 } = {}) => {
  const [info, setInfo] = useState(null);
  const [bateria, setBateria] = useState(null); // { nivel: 0..1, cargando: bool }
  const [error, setError] = useState(null);

  const leerBateria = useCallback(async () => {
    try {
      const b = await Device.getBatteryInfo();
      const datos = b?.batteryLevel != null ? { nivel: b.batteryLevel, cargando: !!b.isCharging } : null;
      setBateria(datos);
      return datos;
    } catch {
      setBateria(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let vigente = true;
    Device.getInfo()
      .then((i) => vigente && setInfo(i))
      .catch((e) => vigente && setError(e.message));
    leerBateria();
    const t = intervaloBateria ? setInterval(leerBateria, intervaloBateria) : null;
    return () => {
      vigente = false;
      if (t) clearInterval(t);
    };
  }, [leerBateria, intervaloBateria]);

  return { info, bateria, error, leerBateria };
};

export default useDevice;
