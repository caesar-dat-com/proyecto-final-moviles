// useNetwork — estado de la red con @capacitor/network (Clase 07).
// Permite habilitar/deshabilitar acciones que requieren conexión.
import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';

export const useNetwork = () => {
  const [estado, setEstado] = useState({ connected: true, connectionType: 'unknown' });

  useEffect(() => {
    let oyente;
    Network.getStatus().then(setEstado).catch(() => {});
    Network.addListener('networkStatusChange', setEstado).then((h) => {
      oyente = h;
    });
    return () => {
      oyente?.remove();
    };
  }, []);

  return { conectado: estado.connected, tipo: estado.connectionType };
};

export default useNetwork;
