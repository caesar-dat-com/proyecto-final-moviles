// Challenge 14 · Red — Network.getStatus() y el evento networkStatusChange con useNetwork.
import { useEffect, useState } from 'react';
import { IonContent, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonPage } from '@ionic/react';
import useNetwork from '../../../hooks/useNetwork';
import Header from '../../../components/shared/Header';
import styles from './Sensores.module.scss';

const Red = () => {
  const { conectado, tipo } = useNetwork();
  const [historial, setHistorial] = useState([]);

  // Registra cada cambio de estado de la red
  useEffect(() => {
    setHistorial((h) => [{ fecha: new Date(), conectado, tipo }, ...h].slice(0, 20));
  }, [conectado, tipo]);

  return (
    <IonPage>
      <Header titulo="Red" atras="/app/challenges/14" />
      <IonContent>
        <div className={`${styles.estadoRed} ${conectado ? '' : styles.sinRed}`} data-test="estado-conexion">
          <strong>{conectado ? 'Conectado' : 'Sin conexión'}</strong>
          Tipo: {tipo}
        </div>
        <p className={styles.aviso}>Prueba: apaga el wifi o activa «Offline» en las herramientas del navegador.</p>
        <IonListHeader>Cambios detectados</IonListHeader>
        <IonList inset>
          {historial.map((h) => (
            <IonItem key={h.fecha.getTime() + h.tipo}>
              <IonLabel>{h.conectado ? 'Conectado' : 'Desconectado'} ({h.tipo})</IonLabel>
              <IonNote slot="end">{h.fecha.toLocaleTimeString('es-CO')}</IonNote>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Red;
