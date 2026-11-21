// Perfil — datos del usuario, foto con la cámara, estado de sensores y cierre de sesión.
import { useState } from 'react';
import {
  IonAvatar, IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonList,
  IonListHeader, IonNote, IonPage, IonToast,
} from '@ionic/react';
import { cameraOutline, logOutOutline } from 'ionicons/icons';
import BRAND from '../../helpers/brand';
import { iniciales } from '../../helpers/utils';
import { subirImagen } from '../../helpers/archivos';
import { useAuthContext } from '../../context/AuthContext';
import useCamera from '../../hooks/useCamera';
import useNetwork from '../../hooks/useNetwork';
import useGeolocation from '../../hooks/useGeolocation';
import Header from '../../components/shared/Header';
import styles from './Index.module.scss';

const Profile = () => {
  const { perfil, usuario, esAdmin, modo, actualizarPerfil, logout } = useAuthContext();
  const { tomarFoto, error: errorCamara } = useCamera();
  const { conectado, tipo } = useNetwork();
  const { posicion, error: errorGps } = useGeolocation();
  const [nombre, setNombre] = useState(perfil.nombre);
  const [toast, setToast] = useState(null);

  const cambiarFoto = async () => {
    const dataUrl = await tomarFoto();
    if (!dataUrl) return;
    try {
      const url = await subirImagen(perfil.id, dataUrl);
      await actualizarPerfil({ avatar_url: url });
      setToast({ texto: 'Foto actualizada', color: 'success' });
    } catch (e) {
      setToast({ texto: e.message, color: 'danger' });
    }
  };

  const guardar = async () => {
    try {
      await actualizarPerfil({ nombre: nombre.trim() });
      setToast({ texto: 'Perfil guardado', color: 'success' });
    } catch (e) {
      setToast({ texto: e.message, color: 'danger' });
    }
  };

  return (
    <IonPage>
      <Header titulo="Mi perfil" />
      <IonContent>
        <div className={styles.cabecera}>
          <IonAvatar className={styles.avatar}>
            {perfil.avatar_url ? <img src={perfil.avatar_url} alt="avatar" /> : <span>{iniciales(perfil.nombre)}</span>}
          </IonAvatar>
          <IonButton size="small" fill="outline" onClick={cambiarFoto} data-test="btn-cambiar-foto">
            <IonIcon slot="start" icon={cameraOutline} />
            Cambiar foto
          </IonButton>
          {errorCamara && <IonNote color="danger">{errorCamara}</IonNote>}
        </div>

        <IonList inset>
          <IonItem>
            <IonInput label="Nombre" labelPlacement="stacked" value={nombre} onIonInput={(e) => setNombre(e.detail.value ?? '')} data-test="perfil-nombre" />
          </IonItem>
          <IonItem>
            <IonLabel>Correo</IonLabel>
            <IonNote slot="end">{usuario.email}</IonNote>
          </IonItem>
          <IonItem>
            <IonLabel>Rol</IonLabel>
            <IonNote slot="end">{esAdmin ? BRAND.roles.admin : BRAND.roles.user}</IonNote>
          </IonItem>
        </IonList>
        <div className="ion-padding-horizontal">
          <IonButton expand="block" onClick={guardar} disabled={nombre.trim().length < 2 || nombre === perfil.nombre} data-test="btn-guardar-perfil">
            Guardar cambios
          </IonButton>
        </div>

        <IonList inset>
          <IonListHeader>
            <IonLabel>Dispositivo</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonLabel>Red</IonLabel>
            <IonNote slot="end">{conectado ? `Conectado (${tipo})` : 'Sin conexión'}</IonNote>
          </IonItem>
          <IonItem>
            <IonLabel>Ubicación</IonLabel>
            <IonNote slot="end">{posicion ? `${posicion.lat.toFixed(4)}, ${posicion.lng.toFixed(4)}` : errorGps || '…'}</IonNote>
          </IonItem>
          <IonItem>
            <IonLabel>Backend</IonLabel>
            <IonNote slot="end">{modo === 'supabase' ? 'Supabase' : 'Local (sin llaves)'}</IonNote>
          </IonItem>
        </IonList>

        <div className="ion-padding">
          <IonButton expand="block" color="danger" fill="outline" onClick={logout} data-test="btn-logout-perfil">
            <IonIcon slot="start" icon={logOutOutline} />
            Cerrar sesión
          </IonButton>
        </div>

        <IonToast isOpen={Boolean(toast)} message={toast?.texto} color={toast?.color} duration={2000} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
