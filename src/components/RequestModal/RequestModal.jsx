// RequestModal — IonModal para crear un reporte urbano.
// Pide categoría, descripción, foto y ubicación. Usa sensores: GPS (ubicación del problema),
// cámara (foto del problema) y haptics (vibración al confirmar, en la página que lo abre).
// La dependencia responsable se asigna sola según la categoría elegida.
import { useState } from 'react';
import {
  IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList,
  IonModal, IonNote, IonSelect, IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar,
} from '@ionic/react';
import { cameraOutline, locateOutline } from 'ionicons/icons';
import BRAND from '../../helpers/brand';
import { formatearPrecio } from '../../helpers/utils';
import useGeolocation from '../../hooks/useGeolocation';
import useCamera from '../../hooks/useCamera';
import Direccion from '../Direccion/Direccion';
import styles from './RequestModal.module.scss';

const RequestModal = ({ abierto, categoriaInicial, dependencias = [], onCerrar, onConfirmar, deshabilitado }) => {
  const [categoria, setCategoria] = useState(null);
  const [detalle, setDetalle] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { posicion, cargando: ubicando, obtenerActual, error: errorGps } = useGeolocation({ auto: false });
  const { foto, tomarFoto, limpiar, error: errorCamara } = useCamera();

  // La categoría elegida en el modal manda; si no hay, la que trae quien lo abre
  const categoriaActual = categoria ?? categoriaInicial ?? null;
  const dependencia = dependencias.find((d) => d.categoria === categoriaActual) || null;
  const listo = Boolean(categoriaActual) && detalle.trim().length >= 5 && Boolean(posicion);

  const cerrar = () => {
    setCategoria(null);
    onCerrar();
  };

  const confirmar = async () => {
    setEnviando(true);
    try {
      await onConfirmar({ categoria: categoriaActual, dependencia, detalle, posicion, foto });
      setDetalle('');
      setCategoria(null);
      limpiar();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <IonModal isOpen={abierto} onDidDismiss={cerrar} data-test="modal-reporte">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Nuevo {BRAND.entidades.request.singular.toLowerCase()}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={cerrar}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList inset>
          <IonItem>
            <IonSelect
              label="Categoría *"
              labelPlacement="stacked"
              placeholder="¿Qué tipo de problema es?"
              interface="action-sheet"
              value={categoriaActual}
              onIonChange={(e) => setCategoria(e.detail.value)}
              data-test="categoria-reporte"
            >
              {BRAND.categorias.map((c) => (
                <IonSelectOption key={c} value={c}>
                  {BRAND.iconosCategoria[c]?.emoji} {c}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonTextarea
              label="Descripción *"
              labelPlacement="stacked"
              placeholder="Describe el problema y alguna referencia del lugar"
              autoGrow
              value={detalle}
              onIonInput={(e) => setDetalle(e.detail.value ?? '')}
              data-test="detalle-reporte"
            />
          </IonItem>
          <IonItem button detail={false} onClick={obtenerActual} data-test="btn-ubicacion">
            <IonIcon slot="start" icon={locateOutline} color="primary" />
            <IonLabel>
              Ubicación del problema *
              <IonNote className={styles.nota}>
                {ubicando ? 'Buscando…' : posicion ? null : errorGps || 'Toca para usar tu GPS'}
              </IonNote>
              {posicion && !ubicando && <Direccion lat={posicion.lat} lng={posicion.lng} className={styles.nota} />}
            </IonLabel>
          </IonItem>
          <IonItem button detail={false} onClick={() => tomarFoto()} data-test="btn-foto">
            <IonIcon slot="start" icon={cameraOutline} color="primary" />
            <IonLabel>
              {foto ? 'Cambiar foto' : 'Foto del problema'}
              <IonNote className={styles.nota}>{errorCamara || 'Muy recomendada: ayuda al funcionario a priorizar'}</IonNote>
            </IonLabel>
          </IonItem>
        </IonList>

        {foto && <img src={foto} alt="Foto del problema" className={styles.foto} data-test="foto-reporte" />}

        {dependencia && (
          <div className={styles.resumen} data-test="dependencia-asignada">
            <small>Lo atiende</small>
            <h2>{dependencia.nombre}</h2>
            <p>
              {BRAND.valor.etiqueta}: <strong>{formatearPrecio(dependencia.precio)}</strong>
            </p>
          </div>
        )}

        <IonButton
          expand="block"
          className="ion-margin-top"
          onClick={confirmar}
          disabled={enviando || deshabilitado || !listo}
          data-test="btn-confirmar-reporte"
        >
          {enviando ? <IonSpinner name="dots" /> : `Enviar ${BRAND.entidades.request.singular.toLowerCase()}`}
        </IonButton>
        {!listo && <IonNote className={styles.nota}>* Categoría, descripción (mínimo 5 letras) y ubicación son obligatorias.</IonNote>}
        {deshabilitado && <IonNote color="warning">Sin conexión: no se pueden enviar reportes.</IonNote>}
      </IonContent>
    </IonModal>
  );
};

export default RequestModal;
