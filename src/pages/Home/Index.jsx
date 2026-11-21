// Home — catálogo de places con búsqueda, filtro por categoría y creación de requests.
import { useMemo, useState } from 'react';
import {
  IonContent, IonLabel, IonPage, IonRefresher, IonRefresherContent, IonSearchbar,
  IonSegment, IonSegmentButton, IonSpinner, IonToast, IonToolbar,
} from '@ionic/react';
import BRAND from '../../helpers/brand';
import { distanciaKm, formatearPrecio } from '../../helpers/utils';
import { subirImagen } from '../../helpers/archivos';
import { useAuthContext } from '../../context/AuthContext';
import useCollection from '../../hooks/useCollection';
import useGeolocation from '../../hooks/useGeolocation';
import useNetwork from '../../hooks/useNetwork';
import useHaptics from '../../hooks/useHaptics';
import useLocalStorage from '../../hooks/useLocalStorage';
import Header from '../../components/shared/Header';
import CardItem from '../../components/CardItem/CardItem';
import RequestModal from '../../components/RequestModal/RequestModal';
import styles from './Index.module.scss';

const Home = () => {
  const { perfil } = useAuthContext();
  const { items: places, cargando, getAll } = useCollection('places', { orden: { campo: 'nombre', asc: true }, realtime: true });
  const solicitudes = useCollection('requests', { realtime: true, filtros: [['user_id', '==', perfil.id]] });
  const { posicion } = useGeolocation();
  const { conectado } = useNetwork();
  const { exito } = useHaptics();

  // La última categoría elegida se recuerda en la memoria local
  const [categoria, setCategoria] = useLocalStorage('home:categoria', 'todas');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [toast, setToast] = useState(null);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return places
      .filter((p) => categoria === 'todas' || p.categoria === categoria)
      .filter((p) => !texto || `${p.nombre} ${p.descripcion}`.toLowerCase().includes(texto))
      .map((p) => ({
        ...p,
        distancia: posicion && p.lat != null ? distanciaKm(posicion.lat, posicion.lng, Number(p.lat), Number(p.lng)) : null,
      }))
      .sort((a, b) => (a.distancia ?? 0) - (b.distancia ?? 0));
  }, [places, categoria, busqueda, posicion]);

  const crearSolicitud = async ({ detalle, posicion: pos, foto }) => {
    try {
      const foto_url = foto ? await subirImagen(perfil.id, foto, 'solicitud') : null;
      await solicitudes.add({
        user_id: perfil.id,
        place_id: seleccionado.id,
        place_nombre: seleccionado.nombre,
        cliente_nombre: perfil.nombre,
        detalle: detalle.trim(),
        estado: 'pendiente',
        lat: pos?.lat ?? null,
        lng: pos?.lng ?? null,
        foto_url,
      });
      exito();
      setSeleccionado(null);
      setToast({ texto: `${BRAND.entidades.request.singular} enviada. Síguela en la pestaña ${BRAND.entidades.request.plural}.`, color: 'success' });
    } catch (e) {
      setToast({ texto: `No se pudo enviar: ${e.message}`, color: 'danger' });
    }
  };

  const refrescar = async (e) => {
    await getAll();
    e.detail.complete();
  };

  return (
    <IonPage>
      <Header titulo={BRAND.nombre}>
        <IonToolbar>
          <IonSearchbar
            placeholder={`Buscar ${BRAND.entidades.place.plural.toLowerCase()}`}
            value={busqueda}
            onIonInput={(e) => setBusqueda(e.detail.value ?? '')}
            data-test="buscador"
          />
        </IonToolbar>
        <IonToolbar>
          <IonSegment scrollable value={categoria} onIonChange={(e) => setCategoria(e.detail.value)}>
            <IonSegmentButton value="todas">
              <IonLabel>Todas</IonLabel>
            </IonSegmentButton>
            {BRAND.categorias.map((c) => (
              <IonSegmentButton key={c} value={c}>
                <IonLabel>{c}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </Header>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={refrescar}>
          <IonRefresherContent />
        </IonRefresher>

        <div className={styles.saludo}>
          <h2>Hola, {perfil.nombre.split(' ')[0]} 👋</h2>
          <p>{BRAND.descripcion}</p>
        </div>

        {cargando && (
          <div className={styles.centro}>
            <IonSpinner />
          </div>
        )}
        {!cargando && visibles.length === 0 && <p className={styles.vacio}>No hay {BRAND.entidades.place.plural.toLowerCase()} que coincidan.</p>}

        {visibles.map((p) => (
          <CardItem
            key={p.id}
            titulo={p.nombre}
            subtitulo={p.distancia != null ? `${p.categoria} · a ${p.distancia.toFixed(1)} km` : p.categoria}
            descripcion={p.descripcion}
            extra={`Desde ${formatearPrecio(p.precio)}`}
            etiqueta={p.categoria}
            colorEtiqueta="secondary"
            onClick={() => setSeleccionado(p)}
            dataTest="card-place"
          />
        ))}

        <RequestModal
          place={seleccionado}
          abierto={Boolean(seleccionado)}
          onCerrar={() => setSeleccionado(null)}
          onConfirmar={crearSolicitud}
          deshabilitado={!conectado}
        />
        <IonToast isOpen={Boolean(toast)} message={toast?.texto} color={toast?.color} duration={2500} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Home;
