// Challenge 14 · Acelerómetro — Motion.addListener('accel' | 'orientation') con useAccelerometer.
import { Capacitor } from '@capacitor/core';
import { IonButton, IonContent, IonIcon, IonListHeader, IonNote, IonPage } from '@ionic/react';
import { flashOutline, playOutline, stopOutline } from 'ionicons/icons';
import useAccelerometer, { magnitud } from '../../../hooks/useAccelerometer';
import Header from '../../../components/shared/Header';
import styles from './Sensores.module.scss';

const Valores = ({ datos, campos }) => (
  <div className={styles.valores}>
    {campos.map((c) => (
      <div key={c}>
        <small>{c}</small>
        <strong>{datos?.[c] ?? '—'}</strong>
      </div>
    ))}
  </div>
);

const Movimiento = () => {
  const accel = useAccelerometer('accel');
  const orientacion = useAccelerometer('orientation');
  const activo = accel.activo || orientacion.activo;
  const fuerza = accel.datos ? magnitud(accel.datos) : 0;

  const alternar = async () => {
    if (activo) {
      await accel.detener();
      await orientacion.detener();
    } else {
      await accel.iniciar();
      await orientacion.iniciar();
    }
  };

  const simular = () => {
    accel.simular();
    orientacion.simular();
  };

  return (
    <IonPage>
      <Header titulo="Acelerómetro" atras="/app/challenges/14" />
      <IonContent>
        <div className={styles.acciones}>
          <IonButton color={activo ? 'danger' : 'primary'} onClick={alternar} data-test="btn-motion">
            <IonIcon slot="start" icon={activo ? stopOutline : playOutline} />
            {activo ? 'Detener' : 'Escuchar movimiento'}
          </IonButton>
          {!Capacitor.isNativePlatform() && (
            <IonButton fill="outline" onClick={simular} data-test="btn-simular-motion">
              <IonIcon slot="start" icon={flashOutline} />
              Simular sacudida
            </IonButton>
          )}
        </div>
        {(accel.error || orientacion.error) && <IonNote color="danger" className={styles.aviso}>{accel.error || orientacion.error}</IonNote>}
        {!Capacitor.isNativePlatform() && (
          <p className={styles.aviso}>
            En un PC de escritorio el navegador no tiene acelerómetro y no llegan eventos: usa «Simular sacudida».
            Los valores simulados se marcan como tales.
          </p>
        )}

        <IonListHeader>Aceleración (m/s²){accel.datos?.simulado ? ' · simulada' : ''}</IonListHeader>
        <Valores datos={accel.datos} campos={['x', 'y', 'z']} />
        <div className={styles.barra} title="Magnitud">
          <span style={{ width: `${Math.min(100, (fuerza / 10) * 100)}%` }} />
        </div>
        <p className={styles.intro}>{fuerza > 3 ? '¡Sacudida detectada!' : 'Teléfono estable'}</p>

        <IonListHeader>Orientación (grados){orientacion.datos?.simulado ? ' · simulada' : ''}</IonListHeader>
        <Valores datos={orientacion.datos} campos={['alpha', 'beta', 'gamma']} />
      </IonContent>
    </IonPage>
  );
};

export default Movimiento;
