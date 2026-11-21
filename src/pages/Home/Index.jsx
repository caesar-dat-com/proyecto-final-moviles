// Home (ciudadano) — botón para reportar un problema y «catálogo» de dependencias
// responsables, con búsqueda y filtro por categoría. Tocar una dependencia abre el
// formulario de reporte con su categoría ya elegida.
import { useMemo, useState } from 'react';
import {
  IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonLabel, IonPage, IonRefresher,
  IonRefresherContent, IonSearchbar, IonSegment, IonSegmentButton, IonSpinner, IonToast, IonToolbar,
} from '@ionic/react';
import { add, megaphoneOutline } from 'ionicons/icons';
import BRAND from '../../helpers/brand';
import { distanciaKm, estadosCerrados, formatearPrecio } from '../../helpers/utils';
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
  const { items: dependencias, cargando, getAll } = useCollection('places', { orden: { campo: 'nombre', asc: true }, realtime: true });
  const reportes = useCollection('requests', { realtime: true, filtros: [['user_id', '==', perfil.id]] });
  const { posicion } = useGeolocation();
  const { conectado } = useNetwork();
  const { exito } = useHaptics();

  // La última categoría elegida se recuerda en la memoria local
  const [categoria, setCategoria] = useLocalStorage('home:categoria', 'todas');
  const [busqueda, setBusqueda] = useState('');
  // null = modal cerrado; { categoria } = abierto (categoría opcional)
  const [formulario, setFormulario] = useState(null);
  const [toast, setToast] = useState(null);

  const activos = reportes.items.filter((r) => !estadosCerrados().includes(r.estado)).length;

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return dependencias
      .filter((p) => categoria === 'todas' || p.categoria === categoria)
      .filter((p) => !texto || `${p.nombre} ${p.descripcion} ${p.categoria}`.toLowerCase().includes(texto))
      .map((p) => ({
        ...p,
        distancia: posicion && p.lat != null ? distanciaKm(posicion.lat, posicion.lng, Number(p.lat), Number(p.lng)) : null,
      }))
      .sort((a, b) => (a.distancia ?? 0) - (b.distancia ?? 0));
  }, [dependencias, categoria, busqueda, posicion]);

  const crearReporte = async ({ categoria: cat, dependencia, detalle, posicion: pos, foto }) => {
    try {
      const foto_url = foto ? await subirImagen(perfil.id, foto, 'reporte') : null;
      await reportes.add({
        user_id: perfil.id,
        place_id: dependencia?.id ?? null,
        place_nombre: dependencia?.nombre ?? null,
        cliente_nombre: perfil.nombre,
        categoria: cat,
        detalle: detalle.trim(),
        estado: BRAND.estados[0].valor,
        lat: pos?.lat ?? null,
        lng: pos?.lng ?? null,
        foto_url,
      });
      exito();
      setFormulario(null);
      setToast({ texto: `${BRAND.entidades.request.singular} enviado. Síguelo en la pestaña ${BRAND.entidades.request.plural}.`, color: 'success' });
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
                <IonLabel>
                  {BRAND.iconosCategoria[c]?.emoji} {c}
                </IonLabel>
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

        <IonButton expand="block" className={styles.cta} onClick={() => setFormulario({})} data-test="btn-nuevo-reporte">
          <IonIcon slot="start" icon={megaphoneOutline} />
          Reportar un problema
        </IonButton>
        <p className={styles.vacio} style={{ padding: '8px 16px 0' }} data-test="mis-activos">
          Tienes {activos} {activos === 1 ? 'reporte activo' : 'reportes activos'}.
        </p>

        <h3 className={styles.seccion}>{BRAND.entidades.place.plural} responsables</h3>

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
            subtitulo={`${BRAND.iconosCategoria[p.categoria]?.emoji ?? ''} ${p.categoria}${p.distancia != null ? ` · a ${p.distancia.toFixed(1)} km` : ''}`}
            descripcion={p.descripcion}
            extra={`${BRAND.valor.etiqueta}: ${formatearPrecio(p.precio)}`}
            onClick={() => setFormulario({ categoria: p.categoria })}
            dataTest="card-dependencia"
          />
        ))}
        <div className={styles.espacioFab} />

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setFormulario({})} data-test="fab-nuevo-reporte">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <RequestModal
          abierto={Boolean(formulario)}
          categoriaInicial={formulario?.categoria}
          dependencias={dependencias}
          onCerrar={() => setFormulario(null)}
          onConfirmar={crearReporte}
          deshabilitado={!conectado}
        />
        <IonToast isOpen={Boolean(toast)} message={toast?.texto} color={toast?.color} duration={2500} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Home;
