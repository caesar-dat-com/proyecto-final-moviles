// Challenge 14 · Dispositivo — Device.getInfo() y Device.getBatteryInfo() con useDevice.
import { IonContent, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonPage } from '@ionic/react';
import useDevice from '../../../hooks/useDevice';
import Header from '../../../components/shared/Header';
import styles from './Sensores.module.scss';

const Dispositivo = () => {
  const { info, bateria, error } = useDevice({ intervaloBateria: 10000 });

  const filas = info
    ? [
        ['Plataforma', info.platform],
        ['Sistema operativo', `${info.operatingSystem} ${info.osVersion || ''}`],
        ['Modelo', info.model],
        ['Fabricante', info.manufacturer],
        ['Navegador / WebView', info.webViewVersion],
        ['¿Emulador?', info.isVirtual ? 'Sí' : 'No'],
      ]
    : [];

  return (
    <IonPage>
      <Header titulo="Dispositivo" atras="/app/challenges/14" />
      <IonContent>
        {error && <IonNote color="danger" className={styles.aviso}>{error}</IonNote>}
        <IonListHeader>Batería</IonListHeader>
        {bateria ? (
          <>
            <div className={styles.barra}>
              <span style={{ width: `${Math.round(bateria.nivel * 100)}%` }} />
            </div>
            <p className={styles.intro} data-test="bateria">
              {Math.round(bateria.nivel * 100)} % · {bateria.cargando ? 'cargando' : 'sin cargar'}
            </p>
          </>
        ) : (
          <p className={styles.aviso}>Este navegador no informa la batería (navigator.getBattery no existe).</p>
        )}
        <IonList inset data-test="info-dispositivo">
          {filas.map(([k, v]) => (
            <IonItem key={k}>
              <IonLabel>{k}</IonLabel>
              <IonNote slot="end">{v || '—'}</IonNote>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Dispositivo;
