// Orders — requests en tiempo real. El usuario ve las suyas; el admin ve todas
// y avanza su estado. Cada request tiene su propia sala de chat.
import { useState } from 'react';
import { IonButton, IonContent, IonIcon, IonLabel, IonPage, IonSegment, IonSegmentButton, IonSpinner, IonToast, IonToolbar } from '@ionic/react';
import { chatbubbleEllipsesOutline, closeCircleOutline, arrowForwardCircleOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import BRAND from '../../helpers/brand';
import { estadoInfo, formatearFecha, idCorto, siguienteEstado } from '../../helpers/utils';
import { useAuthContext } from '../../context/AuthContext';
import useCollection from '../../hooks/useCollection';
import useNetwork from '../../hooks/useNetwork';
import Header from '../../components/shared/Header';
import CardItem from '../../components/CardItem/CardItem';
import styles from './Index.module.scss';

const Orders = () => {
  const { perfil, esAdmin } = useAuthContext();
  const filtros = esAdmin ? [] : [['user_id', '==', perfil.id]];
  const { items, cargando, update, error } = useCollection('requests', { filtros, realtime: true });
  const { conectado } = useNetwork();
  const navigate = useNavigate();
  const [vista, setVista] = useState('activas');
  const [toast, setToast] = useState(null);

  const visibles = items.filter((r) =>
    vista === 'activas' ? !['completada', 'cancelada'].includes(r.estado) : ['completada', 'cancelada'].includes(r.estado),
  );

  const cambiarEstado = async (r, estado) => {
    try {
      await update(r.id, { estado });
      setToast({ texto: `Estado: ${estadoInfo(estado).texto}`, color: 'success' });
    } catch (e) {
      setToast({ texto: e.message, color: 'danger' });
    }
  };

  return (
    <IonPage>
      <Header titulo={BRAND.entidades.request.plural}>
        <IonToolbar>
          <IonSegment value={vista} onIonChange={(e) => setVista(e.detail.value)}>
            <IonSegmentButton value="activas" data-test="seg-activas">
              <IonLabel>Activas</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="historial" data-test="seg-historial">
              <IonLabel>Historial</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </Header>

      <IonContent>
        {cargando && (
          <div className={styles.centro}>
            <IonSpinner />
          </div>
        )}
        {error && <p className={styles.vacio}>Error: {error}</p>}
        {!cargando && visibles.length === 0 && (
          <p className={styles.vacio}>
            No hay {BRAND.entidades.request.plural.toLowerCase()} {vista === 'activas' ? 'activas' : 'en el historial'}.
          </p>
        )}

        {visibles.map((r) => {
          const estado = estadoInfo(r.estado);
          const siguiente = siguienteEstado(r.estado);
          return (
            <CardItem
              key={r.id}
              titulo={`${r.place_nombre || BRAND.entidades.request.singular} · #${idCorto(r.id)}`}
              subtitulo={`${formatearFecha(r.created_at)}${esAdmin ? ` · ${r.cliente_nombre || 'Cliente'}` : ''}`}
              descripcion={r.detalle}
              etiqueta={estado.texto}
              colorEtiqueta={estado.color}
              imagen={r.foto_url}
              dataTest="card-solicitud"
            >
              {r.lat != null && (
                <small className={styles.ubicacion}>
                  📍 {Number(r.lat).toFixed(4)}, {Number(r.lng).toFixed(4)}
                </small>
              )}
              <IonButton size="small" fill="outline" onClick={() => navigate(`/app/chat/request-${r.id}`)} data-test="btn-chat-solicitud">
                <IonIcon slot="start" icon={chatbubbleEllipsesOutline} />
                Chat
              </IonButton>
              {esAdmin && siguiente && (
                <IonButton size="small" disabled={!conectado} onClick={() => cambiarEstado(r, siguiente)} data-test="btn-avanzar">
                  <IonIcon slot="start" icon={arrowForwardCircleOutline} />
                  {estadoInfo(siguiente).texto}
                </IonButton>
              )}
              {r.estado === 'pendiente' && (
                <IonButton size="small" color="medium" fill="clear" disabled={!conectado} onClick={() => cambiarEstado(r, 'cancelada')} data-test="btn-cancelar">
                  <IonIcon slot="start" icon={closeCircleOutline} />
                  Cancelar
                </IonButton>
              )}
            </CardItem>
          );
        })}

        <IonToast isOpen={Boolean(toast)} message={toast?.texto} color={toast?.color} duration={2000} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Orders;
