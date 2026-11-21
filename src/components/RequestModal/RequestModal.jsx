// RequestModal — IonModal para crear una request sobre un place.
// Usa sensores: geolocalización (dirección del servicio), cámara (foto del problema)
// y haptics (vibración al confirmar).
import { useState } from 'react';
import {
  IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList,
  IonModal, IonNote, IonTextarea, IonTitle, IonToolbar, IonSpinner,
} from '@ionic/react';
import { cameraOutline, locateOutline } from 'ionicons/icons';
import BRAND from '../../helpers/brand';
import { formatearPrecio } from '../../helpers/utils';
import useGeolocation from '../../hooks/useGeolocation';
import useCamera from '../../hooks/useCamera';
import styles from './RequestModal.module.scss';

const RequestModal = ({ place, abierto, onCerrar, onConfirmar, deshabilitado }) => {
  const [detalle, setDetalle] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { posicion, cargando: ubicando, obtenerActual, error: errorGps } = useGeolocation({ auto: false });
  const { foto, tomarFoto, limpiar } = useCamera();

  const confirmar = async () => {
    setEnviando(true);
    try {
      await onConfirmar({ detalle, posicion, foto });
      setDetalle('');
      limpiar();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <IonModal isOpen={abierto} onDidDismiss={onCerrar} data-test="modal-solicitud">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Nueva {BRAND.entidades.request.singular.toLowerCase()}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onCerrar}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {place && (
          <div className={styles.resumen}>
            <h2>{place.nombre}</h2>
            <p>{place.descripcion}</p>
            <strong>{formatearPrecio(place.precio)}</strong>
          </div>
        )}

        <IonList inset>
          <IonItem>
            <IonTextarea
              label="¿Qué necesitas?"
              labelPlacement="stacked"
              placeholder="Describe el problema o la tarea"
              autoGrow
              value={detalle}
              onIonInput={(e) => setDetalle(e.detail.value ?? '')}
              data-test="detalle-solicitud"
            />
          </IonItem>
          <IonItem button detail={false} onClick={obtenerActual} data-test="btn-ubicacion">
            <IonIcon slot="start" icon={locateOutline} color="primary" />
            <IonLabel>
              Ubicación del servicio
              <IonNote className={styles.nota}>
                {ubicando ? 'Buscando…' : posicion ? `${posicion.lat.toFixed(5)}, ${posicion.lng.toFixed(5)}` : errorGps || 'Toca para usar tu GPS'}
              </IonNote>
            </IonLabel>
          </IonItem>
          <IonItem button detail={false} onClick={() => tomarFoto()} data-test="btn-foto">
            <IonIcon slot="start" icon={cameraOutline} color="primary" />
            <IonLabel>{foto ? 'Cambiar foto' : 'Adjuntar foto (opcional)'}</IonLabel>
          </IonItem>
        </IonList>

        {foto && <img src={foto} alt="Foto adjunta" className={styles.foto} />}

        <IonButton
          expand="block"
          className="ion-margin-top"
          onClick={confirmar}
          disabled={enviando || deshabilitado || detalle.trim().length < 3}
          data-test="btn-confirmar-solicitud"
        >
          {enviando ? <IonSpinner name="dots" /> : `Enviar ${BRAND.entidades.request.singular.toLowerCase()}`}
        </IonButton>
        {deshabilitado && <IonNote color="warning">Sin conexión: no se pueden enviar solicitudes.</IonNote>}
      </IonContent>
    </IonModal>
  );
};

export default RequestModal;
