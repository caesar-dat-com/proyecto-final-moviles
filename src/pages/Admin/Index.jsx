// Admin — panel del funcionario: métricas de reportes en vivo y CRUD de dependencias
// (tabla places; el campo `precio` guarda los días hábiles de respuesta estimada).
import { useState } from 'react';
import {
  IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput,
  IonItem, IonList, IonModal, IonPage, IonSelect, IonSelectOption, IonTextarea, IonTitle,
  IonToast, IonToolbar, useIonAlert,
} from '@ionic/react';
import { add, createOutline, locateOutline, trashOutline } from 'ionicons/icons';
import BRAND from '../../helpers/brand';
import { estadoInfo, formatearPrecio } from '../../helpers/utils';
import useCollection from '../../hooks/useCollection';
import useGeolocation from '../../hooks/useGeolocation';
import Header from '../../components/shared/Header';
import CardItem from '../../components/CardItem/CardItem';
import styles from './Index.module.scss';

const VACIO = { nombre: '', descripcion: '', categoria: BRAND.categorias[0], precio: '', lat: '', lng: '' };

const Admin = () => {
  const places = useCollection('places', { orden: { campo: 'nombre', asc: true }, realtime: true });
  const { items: reportes } = useCollection('requests', { realtime: true });
  const { obtenerActual } = useGeolocation({ auto: false });
  const [form, setForm] = useState(null); // null = modal cerrado
  const [toast, setToast] = useState(null);
  const [alerta] = useIonAlert();

  const conteo = (...estados) => reportes.filter((r) => estados.includes(r.estado)).length;
  const metricas = [
    { titulo: estadoInfo('nuevo').texto + 's', valor: conteo('nuevo') },
    { titulo: 'En proceso', valor: conteo('en_revision', 'asignado') },
    { titulo: estadoInfo('resuelto').texto + 's', valor: conteo('resuelto') },
    { titulo: BRAND.entidades.place.plural, valor: places.items.length },
  ];
  // Carga por categoría: cuántos reportes abiertos tiene cada tipo de incidencia
  const porCategoria = BRAND.categorias
    .map((c) => ({ c, n: reportes.filter((r) => r.categoria === c && ['nuevo', 'en_revision', 'asignado'].includes(r.estado)).length }))
    .filter((x) => x.n > 0);

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
      <Header titulo="Panel del funcionario" />
      <IonContent>
        <div className={styles.metricas}>
          {metricas.map((m) => (
            <div key={m.titulo} className={styles.metrica}>
              <strong>{m.valor}</strong>
              <span>{m.titulo}</span>
            </div>
          ))}
        </div>

        {porCategoria.length > 0 && (
          <p className={styles.seccion} data-test="carga-categorias">
            Abiertos: {porCategoria.map((x) => `${BRAND.iconosCategoria[x.c]?.emoji} ${x.c} (${x.n})`).join(' · ')}
          </p>
        )}

        <h3 className={styles.seccion}>{BRAND.entidades.place.plural} responsables</h3>
        {places.items.map((p) => (
          <CardItem key={p.id} titulo={p.nombre} subtitulo={p.categoria} descripcion={p.descripcion} extra={`${BRAND.valor.etiqueta}: ${formatearPrecio(p.precio)}`} dataTest="card-admin-dependencia">
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
          <IonFabButton onClick={() => setForm({ ...VACIO })} data-test="btn-nueva-dependencia">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={Boolean(form)} onDidDismiss={() => setForm(null)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>{form?.id ? 'Editar' : 'Nueva'} {BRAND.entidades.place.singular.toLowerCase()}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setForm(null)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          {form && (
            <IonContent className="ion-padding">
              <IonList inset>
                <IonItem>
                  <IonInput label="Nombre" labelPlacement="stacked" value={form.nombre} onIonInput={cambiar('nombre')} data-test="dependencia-nombre" />
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
                  <IonInput
                    label={BRAND.valor.formato === 'dias' ? `${BRAND.valor.etiqueta} (días hábiles)` : `${BRAND.valor.etiqueta} (${BRAND.moneda})`}
                    labelPlacement="stacked"
                    type="number"
                    min="0"
                    value={form.precio}
                    onIonInput={cambiar('precio')}
                    data-test="dependencia-dias"
                  />
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
              <IonButton expand="block" onClick={guardar} data-test="btn-guardar-dependencia">
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
