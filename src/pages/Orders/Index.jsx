// Reportes (tabla requests) en tiempo real. Los reportes son públicos para los vecinos:
// cualquier ciudadano ve los activos del barrio y filtra los suyos; el funcionario (admin)
// avanza el estado (Nuevo → En revisión → Asignado → Resuelto) o lo descarta.
// Cada reporte tiene su propia sala de chat y muestra la dirección (Nominatim).
import { useState } from 'react';
import { IonButton, IonContent, IonIcon, IonLabel, IonPage, IonSegment, IonSegmentButton, IonSpinner, IonToast, IonToolbar } from '@ionic/react';
import { chatbubbleEllipsesOutline, closeCircleOutline, arrowForwardCircleOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import BRAND from '../../helpers/brand';
import { estadoFueraDeFlujo, estadoInfo, estadosCerrados, formatearFecha, idCorto, siguienteEstado } from '../../helpers/utils';
import { useAuthContext } from '../../context/AuthContext';
import useCollection from '../../hooks/useCollection';
import useNetwork from '../../hooks/useNetwork';
import Header from '../../components/shared/Header';
import CardItem from '../../components/CardItem/CardItem';
import Direccion from '../../components/Direccion/Direccion';
import styles from './Index.module.scss';

const Orders = () => {
  const { perfil, esAdmin } = useAuthContext();
  const { items, cargando, update, error } = useCollection('requests', { realtime: true });
  const { conectado } = useNetwork();
  const navigate = useNavigate();
  const [vista, setVista] = useState('activos');
  const [toast, setToast] = useState(null);

  const cerrados = estadosCerrados();
  const descartado = estadoFueraDeFlujo();
  const visibles = items.filter((r) => {
    if (vista === 'mios') return r.user_id === perfil.id;
    if (vista === 'cerrados') return cerrados.includes(r.estado);
    return !cerrados.includes(r.estado);
  });

  const cambiarEstado = async (r, estado) => {
    try {
      await update(r.id, { estado });
      setToast({ texto: `Estado: ${estadoInfo(estado).texto}`, color: 'success' });
    } catch (e) {
      setToast({ texto: e.message, color: 'danger' });
    }
  };

  const textoVacio = { activos: 'activos', mios: 'tuyos', cerrados: 'cerrados' }[vista];

  return (
    <IonPage>
      <Header titulo={BRAND.entidades.request.plural}>
        <IonToolbar>
          <IonSegment value={vista} onIonChange={(e) => setVista(e.detail.value)}>
            <IonSegmentButton value="activos" data-test="seg-activos">
              <IonLabel>Activos</IonLabel>
            </IonSegmentButton>
            {!esAdmin && (
              <IonSegmentButton value="mios" data-test="seg-mios">
                <IonLabel>Míos</IonLabel>
              </IonSegmentButton>
            )}
            <IonSegmentButton value="cerrados" data-test="seg-cerrados">
              <IonLabel>Cerrados</IonLabel>
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
            No hay {BRAND.entidades.request.plural.toLowerCase()} {textoVacio}.
          </p>
        )}

        {visibles.map((r) => {
          const estado = estadoInfo(r.estado);
          const siguiente = siguienteEstado(r.estado);
          const icono = BRAND.iconosCategoria[r.categoria]?.emoji ?? '📌';
          const propio = r.user_id === perfil.id;
          const puedeDescartar = !cerrados.includes(r.estado) && (esAdmin || (propio && r.estado === BRAND.estados[0].valor));
          return (
            <CardItem
              key={r.id}
              titulo={`${icono} ${r.categoria || BRAND.entidades.request.singular} · #${idCorto(r.id)}`}
              subtitulo={`${formatearFecha(r.created_at)} · ${propio ? 'Tú' : r.cliente_nombre || BRAND.roles.user}`}
              descripcion={r.detalle}
              etiqueta={estado.texto}
              colorEtiqueta={estado.color}
              imagen={r.foto_url}
              dataTest="card-reporte"
            >
              {r.lat != null && <Direccion lat={r.lat} lng={r.lng} className={styles.ubicacion} />}
              {r.place_nombre && <small className={styles.ubicacion}>🏛️ {r.place_nombre}</small>}
              <IonButton size="small" fill="outline" onClick={() => navigate(`/app/chat/request-${r.id}`)} data-test="btn-chat-reporte">
                <IonIcon slot="start" icon={chatbubbleEllipsesOutline} />
                Chat
              </IonButton>
              {esAdmin && siguiente && (
                <IonButton size="small" disabled={!conectado} onClick={() => cambiarEstado(r, siguiente)} data-test="btn-avanzar">
                  <IonIcon slot="start" icon={arrowForwardCircleOutline} />
                  {estadoInfo(siguiente).texto}
                </IonButton>
              )}
              {puedeDescartar && descartado && (
                <IonButton size="small" color="medium" fill="clear" disabled={!conectado} onClick={() => cambiarEstado(r, descartado)} data-test="btn-descartar">
                  <IonIcon slot="start" icon={closeCircleOutline} />
                  {esAdmin ? 'Descartar' : 'Retirar'}
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
