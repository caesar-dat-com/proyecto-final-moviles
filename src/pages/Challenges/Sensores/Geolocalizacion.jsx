// Challenge 14 · Geolocalización — getCurrentPosition() y watchPosition() con useGeolocation.
import { useState } from 'react';
import { IonButton, IonContent, IonIcon, IonNote, IonPage, IonSpinner } from '@ionic/react';
import { locateOutline, playOutline, stopOutline } from 'ionicons/icons';
import useGeolocation from '../../../hooks/useGeolocation';
import Header from '../../../components/shared/Header';
import MapView from '../../../components/MapView/MapView';
import styles from './Sensores.module.scss';

const Geolocalizacion = () => {
  const [siguiendo, setSiguiendo] = useState(false);
  const { posicion, error, cargando, obtenerActual } = useGeolocation({ seguir: siguiendo, auto: false });

  return (
    <IonPage>
      <Header titulo="Geolocalización" atras="/app/challenges/14" />
      <IonContent>
        <div className={styles.acciones}>
          <IonButton onClick={obtenerActual} data-test="btn-posicion">
            <IonIcon slot="start" icon={locateOutline} />
            Posición actual
          </IonButton>
          <IonButton color={siguiendo ? 'danger' : 'secondary'} onClick={() => setSiguiendo((s) => !s)} data-test="btn-seguir">
            <IonIcon slot="start" icon={siguiendo ? stopOutline : playOutline} />
            {siguiendo ? 'Detener seguimiento' : 'Seguir (watchPosition)'}
          </IonButton>
          {cargando && <IonSpinner name="dots" />}
        </div>
        {error && <IonNote color="danger" className={styles.aviso}>{error}</IonNote>}
        <div className={styles.valores}>
          <div>
            <small>Latitud</small>
            <strong data-test="lat">{posicion ? posicion.lat.toFixed(5) : '—'}</strong>
          </div>
          <div>
            <small>Longitud</small>
            <strong>{posicion ? posicion.lng.toFixed(5) : '—'}</strong>
          </div>
          <div>
            <small>Precisión</small>
            <strong>{posicion ? `${Math.round(posicion.precision)} m` : '—'}</strong>
          </div>
        </div>
        <div className={styles.mapa}>
          <MapView posicion={posicion} centro={posicion ? [posicion.lat, posicion.lng] : null} alto="320px" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Geolocalizacion;
