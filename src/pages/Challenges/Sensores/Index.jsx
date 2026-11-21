// Challenge 14 (Clase 08, CHALLENGE 07): pantalla de inicio con un botón por sensor.
// Cada botón abre una página propia que implementa ese sensor.
import { IonButton, IonContent, IonIcon, IonPage } from '@ionic/react';
import {
  cameraOutline, hardwareChipOutline, locateOutline, phonePortraitOutline, pulseOutline, wifiOutline,
} from 'ionicons/icons';
import Header from '../../../components/shared/Header';
import styles from './Sensores.module.scss';

export const SENSORES = [
  { ruta: 'geolocalizacion', texto: 'Geolocalización', icono: locateOutline, plugin: '@capacitor/geolocation' },
  { ruta: 'camara', texto: 'Cámara', icono: cameraOutline, plugin: '@capacitor/camera' },
  { ruta: 'movimiento', texto: 'Acelerómetro', icono: pulseOutline, plugin: '@capacitor/motion' },
  { ruta: 'dispositivo', texto: 'Dispositivo', icono: hardwareChipOutline, plugin: '@capacitor/device' },
  { ruta: 'haptica', texto: 'Vibración', icono: phonePortraitOutline, plugin: '@capacitor/haptics' },
  { ruta: 'red', texto: 'Red', icono: wifiOutline, plugin: '@capacitor/network' },
];

const Sensores = () => (
  <IonPage>
    <Header titulo="Challenge 14 · Sensores" atras="/app/challenges" />
    <IonContent>
      <div className={styles.intro}>
        <h2>Sensores del teléfono</h2>
        <p>Un botón por sensor; cada uno abre su propia página.</p>
      </div>
      <div className={styles.botones}>
        {SENSORES.map((s) => (
          <IonButton
            key={s.ruta}
            className={styles.boton}
            fill="outline"
            routerLink={`/app/challenges/14/${s.ruta}`}
            data-test={`sensor-${s.ruta}`}
          >
            <span className={styles.contenidoBoton}>
              <IonIcon icon={s.icono} />
              {s.texto}
            </span>
          </IonButton>
        ))}
      </div>
    </IonContent>
  </IonPage>
);

export default Sensores;
