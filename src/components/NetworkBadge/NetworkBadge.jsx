// NetworkBadge — indicador de conexión usando useNetwork.
import { IonIcon } from '@ionic/react';
import { cloudDoneOutline, cloudOfflineOutline } from 'ionicons/icons';
import useNetwork from '../../hooks/useNetwork';
import styles from './NetworkBadge.module.scss';

const NetworkBadge = () => {
  const { conectado } = useNetwork();
  return (
    <span className={`${styles.badge} ${conectado ? '' : styles.offline}`} data-test="estado-red">
      <IonIcon icon={conectado ? cloudDoneOutline : cloudOfflineOutline} />
      {!conectado && <small>Sin conexión</small>}
    </span>
  );
};

export default NetworkBadge;
