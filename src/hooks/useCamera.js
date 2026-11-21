// useCamera — cámara o galería con @capacitor/camera (Clase 08).
// En el dispositivo pregunta «Tomar foto / Elegir de la galería».
// En web, sin @ionic/pwa-elements, el origen Prompt crea un <pwa-action-sheet> que no
// existe y la promesa nunca termina; por eso en web se usa el selector de archivos
// (en un celular, el navegador ofrece la cámara desde ese mismo selector).
import { useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const ORIGEN_POR_DEFECTO = Capacitor.isNativePlatform() ? CameraSource.Prompt : CameraSource.Photos;

export const useCamera = () => {
  const [foto, setFoto] = useState(null); // dataUrl
  const [error, setError] = useState(null);

  const tomarFoto = useCallback(async (origen = ORIGEN_POR_DEFECTO) => {
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
