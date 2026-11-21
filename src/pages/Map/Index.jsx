// Mapa — places en leaflet + ubicación del usuario en vivo (useGeolocation con watchPosition).
import { useMemo, useState } from 'react';
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonNote, IonPage, IonToggle } from '@ionic/react';
import { locate } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import BRAND from '../../helpers/brand';
import { distanciaKm } from '../../helpers/utils';
import useCollection from '../../hooks/useCollection';
import useGeolocation from '../../hooks/useGeolocation';
import useHaptics from '../../hooks/useHaptics';
import Header from '../../components/shared/Header';
import MapView from '../../components/MapView/MapView';
import styles from './Index.module.scss';

const MapPage = () => {
  const { items: places } = useCollection('places', { realtime: true });
  const [seguir, setSeguir] = useState(false);
  const { posicion, error, obtenerActual } = useGeolocation({ seguir });
  const { vibrar } = useHaptics();
  const [centro, setCentro] = useState(null);
  const navigate = useNavigate();

  const cercanos = useMemo(() => {
    if (!posicion) return [];
    return places
      .map((p) => ({ ...p, distancia: distanciaKm(posicion.lat, posicion.lng, Number(p.lat), Number(p.lng)) }))
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 3);
  }, [places, posicion]);

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
      <Header titulo="Mapa" />
      <IonContent scrollY={false}>
        <div className={styles.layout}>
          <div className={styles.mapa}>
            <MapView places={places} posicion={posicion} centro={centro} onSeleccionar={(p) => setCentro([Number(p.lat), Number(p.lng)])} />
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
            <IonList lines="full">
              {cercanos.map((p) => (
                <IonItem key={p.id} button detail={false} onClick={() => setCentro([Number(p.lat), Number(p.lng)])}>
                  <IonLabel>
                    <h3>{p.nombre}</h3>
                    <p>{p.categoria}</p>
                  </IonLabel>
                  <IonNote slot="end">{p.distancia.toFixed(1)} km</IonNote>
                </IonItem>
              ))}
            </IonList>
            {!posicion && !error && <IonNote className={styles.nota}>Obteniendo tu ubicación…</IonNote>}
            <IonButton fill="clear" expand="block" onClick={() => navigate('/app/inicio')}>
              Ver todos los {BRAND.entidades.place.plural.toLowerCase()}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
