// Header — barra superior reutilizable con botón de menú y estado de red.
import { IonBackButton, IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar } from '@ionic/react';
import NetworkBadge from '../NetworkBadge/NetworkBadge';
import styles from './Header.module.scss';

const Header = ({ titulo, atras = null, children }) => (
  <IonHeader className={styles.header}>
    <IonToolbar color="primary">
      <IonButtons slot="start">
        {atras ? <IonBackButton defaultHref={atras} text="" /> : <IonMenuButton data-test="btn-menu" />}
      </IonButtons>
      <IonTitle>{titulo}</IonTitle>
      <IonButtons slot="end">
        <NetworkBadge />
      </IonButtons>
    </IonToolbar>
    {children}
  </IonHeader>
);

export default Header;
