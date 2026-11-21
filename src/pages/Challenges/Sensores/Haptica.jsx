// Challenge 14 · Vibración — Haptics.impact / notification / vibrate con useHaptics.
// Respaldo web: si el equipo no vibra, la tarjeta se sacude en pantalla para que se note.
import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { ImpactStyle } from '@capacitor/haptics';
import { IonButton, IonCard, IonCardContent, IonContent, IonPage } from '@ionic/react';
import useHaptics from '../../../hooks/useHaptics';
import Header from '../../../components/shared/Header';
import styles from './Sensores.module.scss';

const puedeVibrar = Capacitor.isNativePlatform() || (typeof navigator !== 'undefined' && 'vibrate' in navigator);

const Haptica = () => {
  const { impacto, exito, vibrar } = useHaptics();
  const [animando, setAnimando] = useState(false);
  const [ultimo, setUltimo] = useState('Ninguno');

  const ejecutar = async (nombre, accion) => {
    setUltimo(nombre);
    setAnimando(false);
    requestAnimationFrame(() => setAnimando(true));
    await accion();
  };

  return (
    <IonPage>
      <Header titulo="Vibración" atras="/app/challenges/14" />
      <IonContent>
        <IonCard className={animando ? styles.vibrando : ''} onAnimationEnd={() => setAnimando(false)}>
          <IonCardContent>
            <strong>Último efecto:</strong> <span data-test="ultimo-efecto">{ultimo}</span>
          </IonCardContent>
        </IonCard>
        <div className={styles.acciones}>
          <IonButton onClick={() => ejecutar('Impacto suave', () => impacto(ImpactStyle.Light))}>Impacto suave</IonButton>
          <IonButton onClick={() => ejecutar('Impacto fuerte', () => impacto(ImpactStyle.Heavy))}>Impacto fuerte</IonButton>
          <IonButton color="success" onClick={() => ejecutar('Notificación de éxito', exito)}>Éxito</IonButton>
          <IonButton color="secondary" onClick={() => ejecutar('Vibrar 500 ms', () => vibrar(500))} data-test="btn-vibrar">
            Vibrar 500 ms
          </IonButton>
        </div>
        {!puedeVibrar && (
          <p className={styles.aviso}>
            Este equipo no tiene vibrador (navigator.vibrate no existe): la API resuelve sin hacer nada, así que la
            tarjeta se sacude en pantalla como respaldo visual.
          </p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Haptica;
