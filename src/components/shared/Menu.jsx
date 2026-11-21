// Menu — menú lateral (IonMenu) con accesos según el rol y cierre de sesión.
import {
  IonAvatar, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList,
  IonMenu, IonMenuToggle, IonNote, IonTitle, IonToolbar,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import {
  chatbubblesOutline, gridOutline, homeOutline, logOutOutline, mapOutline, personOutline, receiptOutline,
} from 'ionicons/icons';
import BRAND from '../../helpers/brand';
import { iniciales } from '../../helpers/utils';
import { useAuthContext } from '../../context/AuthContext';
import styles from './Menu.module.scss';

const Menu = () => {
  const { perfil, usuario, esAdmin, logout, modo } = useAuthContext();
  const { pathname } = useLocation();

  const opciones = [
    { url: '/app/inicio', texto: esAdmin ? 'Panel de administración' : 'Inicio', icono: esAdmin ? gridOutline : homeOutline },
    { url: '/app/mapa', texto: 'Mapa', icono: mapOutline },
    { url: '/app/solicitudes', texto: BRAND.entidades.request.plural, icono: receiptOutline },
    { url: '/app/chat', texto: 'Chat', icono: chatbubblesOutline },
    { url: '/app/perfil', texto: 'Mi perfil', icono: personOutline },
  ];

  return (
    <IonMenu contentId="main" type="overlay" data-test="menu">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>{BRAND.nombre}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className={styles.usuario}>
          <IonAvatar className={styles.avatar}>
            {perfil?.avatar_url ? <img src={perfil.avatar_url} alt="avatar" /> : <span>{iniciales(perfil?.nombre)}</span>}
          </IonAvatar>
          <div>
            <strong>{perfil?.nombre}</strong>
            <IonNote className={styles.correo}>{usuario?.email}</IonNote>
            <IonNote className={styles.rol}>{esAdmin ? 'Administrador' : 'Usuario'}</IonNote>
          </div>
        </div>

        <IonList lines="none">
          {opciones.map((o) => (
            <IonMenuToggle key={o.url} autoHide={false}>
              <IonItem
                routerLink={o.url}
                routerDirection="root"
                detail={false}
                className={pathname.startsWith(o.url) ? styles.activo : ''}
              >
                <IonIcon slot="start" icon={o.icono} />
                <IonLabel>{o.texto}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
          <IonMenuToggle autoHide={false}>
            <IonItem button detail={false} onClick={logout} data-test="btn-logout">
              <IonIcon slot="start" icon={logOutOutline} color="danger" />
              <IonLabel color="danger">Cerrar sesión</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>

        <p className={styles.pie}>
          {modo === 'supabase' ? 'Conectado a Supabase' : 'Modo local (sin backend)'}
        </p>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
