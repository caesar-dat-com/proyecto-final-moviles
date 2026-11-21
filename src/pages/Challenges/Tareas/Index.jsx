// Challenge 15 (Clase 09, CHALLENGE 08): tareas con Supabase.
// - Registro y login reales: los de la app (useAuth + Supabase Auth).
// - CRUD de la tabla `tareas` con RLS (SQL en challenges/15-supabase-tareas/tareas.sql).
// - Lista en vivo: useCollection con realtime (postgres_changes; sin llaves, BroadcastChannel).
// - Foto con la cámara subida al bucket `avatars` en la carpeta <uid>/.
import { useState } from 'react';
import {
  IonAvatar, IonButton, IonButtons, IonCheckbox, IonContent, IonIcon, IonInput, IonItem, IonLabel,
  IonList, IonNote, IonPage, IonSegment, IonSegmentButton, IonSpinner, IonToast, useIonAlert,
} from '@ionic/react';
import { addOutline, cameraOutline, createOutline, radioButtonOnOutline, trashOutline } from 'ionicons/icons';
import { iniciales } from '../../../helpers/utils';
import { subirImagen } from '../../../helpers/archivos';
import { useAuthContext } from '../../../context/AuthContext';
import useCollection from '../../../hooks/useCollection';
import useCamera from '../../../hooks/useCamera';
import useNetwork from '../../../hooks/useNetwork';
import Header from '../../../components/shared/Header';
import styles from './Index.module.scss';

const Tareas = () => {
  const { perfil, usuario, modo, actualizarPerfil } = useAuthContext();
  const { items, cargando, error, add, update, remove } = useCollection('tareas', {
    filtros: [['user_id', '==', usuario.id]],
    orden: { campo: 'created_at', asc: false },
    realtime: true,
  });
  const { tomarFoto } = useCamera();
  const { conectado } = useNetwork();
  const [alerta] = useIonAlert();
  const [titulo, setTitulo] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [toast, setToast] = useState(null);

  const avisar = (texto, color = 'danger') => setToast({ texto, color });

  const crear = async () => {
    const limpio = titulo.trim();
    if (!limpio) return;
    try {
      await add({ titulo: limpio, completada: false, user_id: usuario.id });
      setTitulo('');
    } catch (e) {
      avisar(`No se pudo crear: ${e.message}`);
    }
  };

  const alternar = async (t) => {
    try {
      await update(t.id, { completada: !t.completada });
    } catch (e) {
      avisar(e.message);
    }
  };

  const editar = (t) =>
    alerta({
      header: 'Editar tarea',
      inputs: [{ name: 'titulo', value: t.titulo, placeholder: 'Título' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async ({ titulo: nuevo }) => {
            if (!nuevo?.trim()) return false;
            try {
              await update(t.id, { titulo: nuevo.trim() });
            } catch (e) {
              avisar(e.message);
            }
            return true;
          },
        },
      ],
    });

  const borrar = (t) =>
    alerta({
      header: '¿Borrar tarea?',
      message: t.titulo,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Borrar', role: 'destructive', handler: () => remove(t.id).catch((e) => avisar(e.message)) },
      ],
    });

  const cambiarFoto = async () => {
    const dataUrl = await tomarFoto();
    if (!dataUrl) return;
    try {
      const url = await subirImagen(usuario.id, dataUrl, 'avatar');
      await actualizarPerfil({ avatar_url: url });
      avisar('Foto subida al bucket avatars', 'success');
    } catch (e) {
      avisar(`No se pudo subir la foto: ${e.message}`);
    }
  };

  const visibles = items.filter((t) => (filtro === 'todas' ? true : filtro === 'hechas' ? t.completada : !t.completada));
  const hechas = items.filter((t) => t.completada).length;

  return (
    <IonPage>
      <Header titulo="Challenge 15 · Tareas" atras="/app/challenges" />
      <IonContent>
        <div className={styles.cabecera}>
          <IonAvatar className={styles.avatar}>
            {perfil.avatar_url ? <img src={perfil.avatar_url} alt="avatar" /> : <span>{iniciales(perfil.nombre)}</span>}
          </IonAvatar>
          <div>
            <strong>{perfil.nombre}</strong>
            <IonNote className={styles.sub}>
              {hechas}/{items.length} hechas · {modo === 'supabase' ? 'Supabase' : 'modo local'}
            </IonNote>
            <span className={styles.vivo} data-test="en-vivo">
              <IonIcon icon={radioButtonOnOutline} /> En vivo
            </span>
          </div>
          <IonButton size="small" fill="outline" onClick={cambiarFoto} data-test="btn-avatar">
            <IonIcon slot="icon-only" icon={cameraOutline} />
          </IonButton>
        </div>

        <IonItem className={styles.nueva} lines="none">
          <IonInput
            placeholder={conectado ? 'Nueva tarea…' : 'Sin conexión'}
            value={titulo}
            disabled={!conectado && modo === 'supabase'}
            onIonInput={(e) => setTitulo(e.detail.value ?? '')}
            onKeyDown={(e) => e.key === 'Enter' && crear()}
            data-test="input-tarea"
          />
          <IonButton slot="end" onClick={crear} disabled={!titulo.trim()} data-test="btn-agregar-tarea">
            <IonIcon slot="icon-only" icon={addOutline} />
          </IonButton>
        </IonItem>

        <IonSegment value={filtro} onIonChange={(e) => setFiltro(e.detail.value)} className={styles.filtros}>
          <IonSegmentButton value="todas"><IonLabel>Todas</IonLabel></IonSegmentButton>
          <IonSegmentButton value="pendientes"><IonLabel>Pendientes</IonLabel></IonSegmentButton>
          <IonSegmentButton value="hechas"><IonLabel>Hechas</IonLabel></IonSegmentButton>
        </IonSegment>

        {error && <IonNote color="danger" className={styles.error}>Error: {error} (¿creaste la tabla «tareas» con tareas.sql?)</IonNote>}
        {cargando ? (
          <div className={styles.centro}><IonSpinner name="crescent" /></div>
        ) : visibles.length === 0 ? (
          <p className={styles.vacio}>No hay tareas aquí.</p>
        ) : (
          <IonList inset data-test="lista-tareas">
            {visibles.map((t) => (
              <IonItem key={t.id}>
                <IonCheckbox slot="start" checked={!!t.completada} onIonChange={() => alternar(t)} aria-label="Completada" />
                <IonLabel className={t.completada ? styles.hecha : ''}>{t.titulo}</IonLabel>
                <IonButtons slot="end">
                  <IonButton onClick={() => editar(t)} aria-label="Editar">
                    <IonIcon slot="icon-only" icon={createOutline} />
                  </IonButton>
                  <IonButton color="danger" onClick={() => borrar(t)} aria-label="Borrar">
                    <IonIcon slot="icon-only" icon={trashOutline} />
                  </IonButton>
                </IonButtons>
              </IonItem>
            ))}
          </IonList>
        )}
        <IonToast isOpen={Boolean(toast)} message={toast?.texto} color={toast?.color} duration={2200} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Tareas;
