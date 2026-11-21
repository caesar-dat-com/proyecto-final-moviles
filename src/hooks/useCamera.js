// useCamera — cámara o galería con @capacitor/camera (Clase 08).
// En web, sin @ionic/pwa-elements, Capacitor abre el selector de archivos.
import { useCallback, useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export const useCamera = () => {
  const [foto, setFoto] = useState(null); // dataUrl
  const [error, setError] = useState(null);

  const tomarFoto = useCallback(async (origen = CameraSource.Prompt) => {
    setError(null);
    try {
      const imagen = await Camera.getPhoto({
        quality: 70,
        width: 800,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: origen,
        promptLabelHeader: 'Foto',
        promptLabelPhoto: 'Elegir de la galería',
        promptLabelPicture: 'Tomar foto',
        promptLabelCancel: 'Cancelar',
      });
      setFoto(imagen.dataUrl);
      return imagen.dataUrl;
    } catch (e) {
      // Cancelar el selector no es un error para el usuario
      if (!/cancel/i.test(e.message || '')) setError(e.message || 'No se pudo usar la cámara.');
      return null;
    }
  }, []);

  const limpiar = useCallback(() => setFoto(null), []);

  return { foto, error, tomarFoto, limpiar };
};

export default useCamera;
