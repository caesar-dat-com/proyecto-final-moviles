// Challenge 14 · Cámara — Camera.getPhoto() con useCamera.
// En el teléfono abre cámara o galería; en web el hook usa el selector de archivos (respaldo).
import { Capacitor } from '@capacitor/core';
import { CameraSource } from '@capacitor/camera';
import { IonButton, IonContent, IonIcon, IonNote, IonPage } from '@ionic/react';
import { cameraOutline, imagesOutline, trashOutline } from 'ionicons/icons';
import useCamera from '../../../hooks/useCamera';
import Header from '../../../components/shared/Header';
import styles from './Sensores.module.scss';

const esNativo = Capacitor.isNativePlatform();

const Camara = () => {
  const { foto, error, tomarFoto, limpiar } = useCamera();

  return (
    <IonPage>
      <Header titulo="Cámara" atras="/app/challenges/14" />
      <IonContent>
        <div className={styles.acciones}>
          {esNativo && (
            <IonButton onClick={() => tomarFoto(CameraSource.Camera)}>
              <IonIcon slot="start" icon={cameraOutline} />
              Tomar foto
            </IonButton>
          )}
          <IonButton fill={esNativo ? 'outline' : 'solid'} onClick={() => tomarFoto(CameraSource.Photos)} data-test="btn-foto">
            <IonIcon slot="start" icon={imagesOutline} />
            {esNativo ? 'Galería' : 'Elegir imagen'}
          </IonButton>
          {foto && (
            <IonButton fill="clear" color="danger" onClick={limpiar}>
              <IonIcon slot="start" icon={trashOutline} />
              Quitar
            </IonButton>
          )}
        </div>
        {!esNativo && (
          <p className={styles.aviso}>
            Estás en el navegador: se usa el selector de archivos como respaldo. En un celular el navegador ofrece la
            cámara desde ese mismo selector; en la app nativa se abre la cámara real.
          </p>
        )}
        {error && <IonNote color="danger" className={styles.aviso}>{error}</IonNote>}
        {foto ? <img className={styles.foto} src={foto} alt="Foto tomada" data-test="foto" /> : <p className={styles.intro}>Aún no hay foto.</p>}
      </IonContent>
    </IonPage>
  );
};

export default Camara;
