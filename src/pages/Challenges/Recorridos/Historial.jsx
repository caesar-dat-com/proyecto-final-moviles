// Challenge 16 · Historial — recorridos guardados en JSON, agrupados por día.
// Permite ver la ruta de cada recorrido en el mapa, exportar/importar el archivo JSON y borrar.
import { useMemo, useRef, useState } from 'react';
import {
  IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonPage, IonToast,
} from '@ionic/react';
import { cloudDownloadOutline, cloudUploadOutline, trashOutline } from 'ionicons/icons';
import { aJSON, agruparPorDia, desdeJSON } from '../../../helpers/recorridos';
import useLocalStorage from '../../../hooks/useLocalStorage';
import Header from '../../../components/shared/Header';
import RutaMapa from '../../../components/RutaMapa/RutaMapa';
import { CLAVE_RECORRIDOS } from './Index';
import styles from './Recorridos.module.scss';

const hora = (ms) => new Date(ms).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
const nombreDia = (clave) =>
  new Date(`${clave}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const Historial = () => {
  const [recorridos, setRecorridos] = useLocalStorage(CLAVE_RECORRIDOS, []);
  const [elegido, setElegido] = useState(null);
  const [toast, setToast] = useState(null);
  const archivo = useRef(null);
  const grupos = useMemo(() => agruparPorDia(recorridos), [recorridos]);
  const seleccionado = recorridos.find((r) => r.id === elegido) || recorridos[0];

  const exportar = () => {
    const blob = new Blob([aJSON(recorridos)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `recorridos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importar = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const nuevos = desdeJSON(await f.text());
      setRecorridos((lista) => [...nuevos.filter((n) => !lista.some((x) => x.id === n.id)), ...lista]);
      setToast({ texto: `${nuevos.length} recorridos importados`, color: 'success' });
    } catch (err) {
      setToast({ texto: `Archivo inválido: ${err.message}`, color: 'danger' });
    }
    e.target.value = '';
  };

  const borrar = (id) => setRecorridos((lista) => lista.filter((r) => r.id !== id));

  return (
    <IonPage>
      <Header titulo="Historial de recorridos" atras="/app/challenges/16" />
      <IonContent>
        {seleccionado && (
          <div className={styles.mapa}>
            <RutaMapa puntos={seleccionado.puntos} alto="240px" />
          </div>
        )}
        <div className={styles.acciones}>
          <IonButton fill="outline" onClick={exportar} disabled={!recorridos.length} data-test="btn-exportar">
            <IonIcon slot="start" icon={cloudDownloadOutline} />
            Exportar JSON
          </IonButton>
          <IonButton fill="outline" onClick={() => archivo.current?.click()}>
            <IonIcon slot="start" icon={cloudUploadOutline} />
            Importar JSON
          </IonButton>
          <input ref={archivo} type="file" accept="application/json" hidden onChange={importar} />
        </div>

        {!recorridos.length && <p className={styles.vacio}>Aún no hay recorridos guardados.</p>}
        {Object.entries(grupos).map(([dia, lista]) => (
          <div key={dia}>
            <IonListHeader className={styles.dia}>
              {nombreDia(dia)} · {lista.reduce((s, r) => s + r.distanciaKm, 0).toFixed(2)} km
            </IonListHeader>
            <IonList inset data-test="lista-recorridos">
              {lista.map((r) => (
                <IonItem key={r.id} button detail={false} onClick={() => setElegido(r.id)} color={seleccionado?.id === r.id ? 'light' : undefined}>
                  <IonLabel>
                    {hora(r.inicio)} – {hora(r.fin)}
                    <IonNote className={styles.coords}>
                      {(r.distanciaKm * 1000).toFixed(0)} m · {r.puntos.length} puntos
                    </IonNote>
                  </IonLabel>
                  <IonButton slot="end" fill="clear" color="danger" onClick={(e) => { e.stopPropagation(); borrar(r.id); }} aria-label="Borrar">
                    <IonIcon slot="icon-only" icon={trashOutline} />
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          </div>
        ))}
        <IonToast isOpen={Boolean(toast)} message={toast?.texto} color={toast?.color} duration={2000} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Historial;
