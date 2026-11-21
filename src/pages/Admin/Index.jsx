// Admin — panel del administrador: métricas en vivo y CRUD de places.
import { useState } from 'react';
import {
  IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput,
  IonItem, IonList, IonModal, IonPage, IonSelect, IonSelectOption, IonTextarea, IonTitle,
  IonToast, IonToolbar, useIonAlert,
} from '@ionic/react';
import { add, createOutline, locateOutline, trashOutline } from 'ionicons/icons';
import BRAND from '../../helpers/brand';
import { formatearPrecio } from '../../helpers/utils';
import useCollection from '../../hooks/useCollection';
import useGeolocation from '../../hooks/useGeolocation';
import Header from '../../components/shared/Header';
import CardItem from '../../components/CardItem/CardItem';
import styles from './Index.module.scss';

const VACIO = { nombre: '', descripcion: '', categoria: BRAND.categorias[0], precio: '', lat: '', lng: '' };

const Admin = () => {
  const places = useCollection('places', { orden: { campo: 'nombre', asc: true }, realtime: true });
  const { items: solicitudes } = useCollection('requests', { realtime: true });
  const { obtenerActual } = useGeolocation({ auto: false });
  const [form, setForm] = useState(null); // null = modal cerrado
  const [toast, setToast] = useState(null);
  const [alerta] = useIonAlert();

  const conteo = (estado) => solicitudes.filter((s) => s.estado === estado).length;
  const metricas = [
    { titulo: BRAND.entidades.place.plural, valor: places.items.length },
    { titulo: 'Pendientes', valor: conteo('pendiente') },
    { titulo: 'En curso', valor: conteo('aceptada') + conteo('en_camino') },
    { titulo: 'Completadas', valor: conteo('completada') },
  ];

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.detail.value ?? '' }));

  const usarMiUbicacion = async () => {
    const p = await obtenerActual();
    if (p) setForm((f) => ({ ...f, lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) }));
  };

  const guardar = async () => {
    const { id, created_at: _c, ...resto } = form;
    const datos = { ...resto, precio: Number(resto.precio) || 0, lat: Number(resto.lat), lng: Number(resto.lng) };
    if (!datos.nombre.trim() || Number.isNaN(datos.lat) || Number.isNaN(datos.lng)) {
      setToast({ texto: 'Nombre y coordenadas son obligatorios.', color: 'warning' });
      return;
    }
    try {
      if (id) await places.update(id, datos);
      else await places.add(datos);
      setForm(null);
      setToast({ texto: 'Guardado', color: 'success' });
    } catch (e) {
      setToast({ texto: e.message, color: 'danger' });
    }
  };

  const confirmarBorrado = (p) =>
    alerta({
      header: `Eliminar ${BRAND.entidades.place.singular.toLowerCase()}`,
      message: `¿Seguro que quieres eliminar "${p.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => places.remove(p.id).catch((e) => setToast({ texto: e.message, color: 'danger' })) },
      ],
    });

  return (
    <IonPage>
      <Header titulo="Panel de administración" />
      <IonContent>
        <div className={styles.metricas}>
          {metricas.map((m) => (
            <div key={m.titulo} className={styles.metrica}>
              <strong>{m.valor}</strong>
              <span>{m.titulo}</span>
            </div>
          ))}
        </div>

        <h3 className={styles.seccion}>{BRAND.entidades.place.plural}</h3>
        {places.items.map((p) => (
          <CardItem key={p.id} titulo={p.nombre} subtitulo={p.categoria} descripcion={p.descripcion} extra={formatearPrecio(p.precio)} dataTest="card-admin-place">
            <IonButton size="small" fill="outline" onClick={() => setForm({ ...p })}>
              <IonIcon slot="start" icon={createOutline} />
              Editar
            </IonButton>
            <IonButton size="small" fill="clear" color="danger" onClick={() => confirmarBorrado(p)}>
              <IonIcon slot="start" icon={trashOutline} />
              Eliminar
            </IonButton>
          </CardItem>
        ))}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setForm({ ...VACIO })} data-test="btn-nuevo-place">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={Boolean(form)} onDidDismiss={() => setForm(null)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>{form?.id ? 'Editar' : 'Nuevo'} {BRAND.entidades.place.singular.toLowerCase()}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setForm(null)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          {form && (
            <IonContent className="ion-padding">
              <IonList inset>
                <IonItem>
                  <IonInput label="Nombre" labelPlacement="stacked" value={form.nombre} onIonInput={cambiar('nombre')} data-test="place-nombre" />
                </IonItem>
                <IonItem>
                  <IonTextarea label="Descripción" labelPlacement="stacked" autoGrow value={form.descripcion} onIonInput={cambiar('descripcion')} />
                </IonItem>
                <IonItem>
                  <IonSelect label="Categoría" labelPlacement="stacked" value={form.categoria} onIonChange={cambiar('categoria')}>
                    {BRAND.categorias.map((c) => (
                      <IonSelectOption key={c} value={c}>
                        {c}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonInput label={`Precio (${BRAND.moneda})`} labelPlacement="stacked" type="number" value={form.precio} onIonInput={cambiar('precio')} data-test="place-precio" />
                </IonItem>
                <IonItem>
                  <IonInput label="Latitud" labelPlacement="stacked" type="number" value={form.lat} onIonInput={cambiar('lat')} />
                </IonItem>
                <IonItem>
                  <IonInput label="Longitud" labelPlacement="stacked" type="number" value={form.lng} onIonInput={cambiar('lng')} />
                </IonItem>
              </IonList>
              <IonButton expand="block" fill="outline" onClick={usarMiUbicacion}>
                <IonIcon slot="start" icon={locateOutline} />
                Usar mi ubicación
              </IonButton>
              <IonButton expand="block" onClick={guardar} data-test="btn-guardar-place">
                Guardar
              </IonButton>
            </IonContent>
          )}
        </IonModal>

        <IonToast isOpen={Boolean(toast)} message={toast?.texto} color={toast?.color} duration={2000} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Admin;
