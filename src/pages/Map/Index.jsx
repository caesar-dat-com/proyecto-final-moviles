// Mapa — reportes activos y dependencias en Leaflet + ubicación del usuario en vivo
// (useGeolocation con watchPosition). El panel inferior lista los reportes más cercanos
// con su dirección (geocoding inverso con Nominatim).
import { useMemo, useState } from 'react';
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonNote, IonPage, IonToggle } from '@ionic/react';
import { locate } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import BRAND from '../../helpers/brand';
import { distanciaKm, estadoInfo, estadosCerrados } from '../../helpers/utils';
import useCollection from '../../hooks/useCollection';
import useGeolocation from '../../hooks/useGeolocation';
import useHaptics from '../../hooks/useHaptics';
import Header from '../../components/shared/Header';
import MapView from '../../components/MapView/MapView';
import Direccion from '../../components/Direccion/Direccion';
import styles from './Index.module.scss';

const MapPage = () => {
  const { items: reportes } = useCollection('requests', { realtime: true });
  const { items: dependencias } = useCollection('places', { realtime: true });
  const [seguir, setSeguir] = useState(false);
  const { posicion, error, obtenerActual } = useGeolocation({ seguir });
  const { vibrar } = useHaptics();
  const [centro, setCentro] = useState(null);
  const navigate = useNavigate();

  const activos = useMemo(() => reportes.filter((r) => !estadosCerrados().includes(r.estado)), [reportes]);

  const cercanos = useMemo(() => {
    if (!posicion) return [];
    return activos
      .filter((r) => r.lat != null && r.lng != null)
      .map((r) => ({ ...r, distancia: distanciaKm(posicion.lat, posicion.lng, Number(r.lat), Number(r.lng)) }))
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 3);
  }, [activos, posicion]);

  const centrarEnMi = async () => {
    const p = posicion || (await obtenerActual());
    if (p) setCentro([p.lat, p.lng]);
  };

  const cambiarSeguimiento = (activo) => {
    setSeguir(activo);
    vibrar(200); // feedback táctil al iniciar/detener el seguimiento
  };

  return (
    <IonPage>
      <Header titulo="Mapa de reportes" />
      <IonContent scrollY={false}>
        <div className={styles.layout}>
          <div className={styles.mapa}>
            <MapView
              reportes={activos}
              dependencias={dependencias}
              posicion={posicion}
              centro={centro}
              onAbrirReporte={(r) => navigate(`/app/chat/request-${r.id}`)}
            />
            <IonFab vertical="bottom" horizontal="end" slot="fixed" className={styles.fab}>
              <IonFabButton onClick={centrarEnMi} data-test="btn-centrar">
                <IonIcon icon={locate} />
              </IonFabButton>
            </IonFab>
          </div>

          <div className={styles.panel}>
            <IonItem lines="none">
              <IonToggle checked={seguir} onIonChange={(e) => cambiarSeguimiento(e.detail.checked)} data-test="toggle-seguir">
                Seguir mi ubicación en vivo
              </IonToggle>
            </IonItem>
            {error && <IonNote color="danger" className={styles.nota}>{error}</IonNote>}
            {posicion && (
              <IonNote className={styles.nota} data-test="mi-posicion">
                Tú: {posicion.lat.toFixed(5)}, {posicion.lng.toFixed(5)} (±{Math.round(posicion.precision || 0)} m)
              </IonNote>
            )}
            {cercanos.length > 0 && <IonNote className={styles.nota}>{BRAND.entidades.request.plural} activos más cercanos:</IonNote>}
            <IonList lines="full">
              {cercanos.map((r) => (
                <IonItem key={r.id} button detail={false} onClick={() => setCentro([Number(r.lat), Number(r.lng)])} data-test="item-cercano">
                  <IonLabel>
                    <h3>
                      {BRAND.iconosCategoria[r.categoria]?.emoji} {r.categoria} · {estadoInfo(r.estado).texto}
                    </h3>
                    <Direccion lat={r.lat} lng={r.lng} />
                  </IonLabel>
                  <IonNote slot="end">{r.distancia.toFixed(1)} km</IonNote>
                </IonItem>
              ))}
            </IonList>
            {posicion && cercanos.length === 0 && <IonNote className={styles.nota}>No hay reportes activos con ubicación.</IonNote>}
            {!posicion && !error && <IonNote className={styles.nota}>Obteniendo tu ubicación…</IonNote>}
            <IonButton fill="clear" expand="block" onClick={() => navigate('/app/reportes')}>
              Ver todos los {BRAND.entidades.request.plural.toLowerCase()}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
