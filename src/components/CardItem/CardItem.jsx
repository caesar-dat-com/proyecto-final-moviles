// CardItem — tarjeta genérica para places, requests o cualquier entidad.
import { IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/react';
import styles from './CardItem.module.scss';

const CardItem = ({ titulo, subtitulo, descripcion, etiqueta, colorEtiqueta = 'primary', extra, imagen, onClick, children, dataTest }) => (
  <IonCard className={styles.card} button={Boolean(onClick)} onClick={onClick} data-test={dataTest}>
    {imagen && <img className={styles.imagen} src={imagen} alt={titulo} />}
    <IonCardHeader>
      <div className={styles.cabecera}>
        <IonCardTitle className={styles.titulo}>{titulo}</IonCardTitle>
        {etiqueta && <IonBadge color={colorEtiqueta}>{etiqueta}</IonBadge>}
      </div>
      {subtitulo && <IonCardSubtitle>{subtitulo}</IonCardSubtitle>}
    </IonCardHeader>
    {(descripcion || extra || children) && (
      <IonCardContent>
        {descripcion && <p className={styles.descripcion}>{descripcion}</p>}
        {extra && <p className={styles.extra}>{extra}</p>}
        {children && <div className={styles.acciones}>{children}</div>}
      </IonCardContent>
    )}
  </IonCard>
);

export default CardItem;
