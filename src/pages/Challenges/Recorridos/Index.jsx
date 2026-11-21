// Challenge 16 (Clase 10, CHALLENGE 08): app de mapas completada con varios sensores.
// Implementa los ejemplos del enunciado:
//  - Con conexión muestra la dirección actual (geocoding); sin conexión, solo coordenadas.
//  - Detecta si el teléfono se mueve (velocidad entre puntos) y lo muestra.
//  - Guarda cada recorrido en JSON (memoria local) y tiene una página de historial por día.
//  - Foto con la ubicación actual como marca de agua.
//  - Vibra al iniciar el seguimiento.
//  - Detiene el seguimiento con batería baja (< 15 % y sin cargar).
//  - Avisos inteligentes: mucho tiempo quieto, sin conexión, movimiento rápido.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  IonBadge, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonNote, IonPage, IonToast,
} from '@ionic/react';
import {
  batteryHalfOutline, cameraOutline, footstepsOutline, playOutline, stopOutline, timeOutline, walkOutline,
} from 'ionicons/icons';
import {
  avisosInteligentes, bateriaBaja, crearRecorrido, debeAgregar, distanciaTotalKm, estadoMovimiento, velocidadKmh,
} from '../../../helpers/recorridos';
import useGeolocation from '../../../hooks/useGeolocation';
import useNetwork from '../../../hooks/useNetwork';
import useHaptics from '../../../hooks/useHaptics';
import useDevice from '../../../hooks/useDevice';
import useCamera from '../../../hooks/useCamera';
import useLocalStorage from '../../../hooks/useLocalStorage';
import useDireccion from '../../../hooks/useDireccion';
import Header from '../../../components/shared/Header';
import RutaMapa from '../../../components/RutaMapa/RutaMapa';
import styles from './Recorridos.module.scss';

export const CLAVE_RECORRIDOS = 'challenge16:recorridos';
const esNativo = Capacitor.isNativePlatform();

// Dibuja la ubicación y la fecha sobre la foto (marca de agua) con un canvas
const marcarFoto = (dataUrl, lineas) =>
  new Promise((resolver, rechazar) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const tam = Math.max(14, Math.round(img.width / 28));
      const alto = tam * 1.4 * lineas.length + tam;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, img.height - alto, img.width, alto);
      ctx.fillStyle = '#fff';
      ctx.font = `600 ${tam}px sans-serif`;
      lineas.forEach((l, i) => ctx.fillText(l, tam / 2, img.height - alto + tam * 1.4 * (i + 1)));
      resolver(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => rechazar(new Error('No se pudo leer la foto.'));
    img.src = dataUrl;
  });

const Recorridos = () => {
  const [activo, setActivo] = useState(false);
  const [puntos, setPuntos] = useState([]);
  const [recorridos, setRecorridos] = useLocalStorage(CLAVE_RECORRIDOS, []);
  const [toast, setToast] = useState(null);
  const [foto, setFoto] = useState(null);
  const [ahora, setAhora] = useState(() => Date.now());
  const inicio = useRef(null);
  // Copia de los puntos para leerlos al detener sin efectos dentro de un updater de estado
  const puntosRef = useRef(puntos);
  useEffect(() => {
    puntosRef.current = puntos;
  }, [puntos]);

  const { posicion, error: errorGps } = useGeolocation({ seguir: activo, auto: true });
  const { conectado, tipo } = useNetwork();
  const { vibrar, exito } = useHaptics();
  const { bateria } = useDevice({ intervaloBateria: 30000 });
  const { tomarFoto } = useCamera();
  // Solo se consulta la dirección si hay conexión (la API es externa)
  const { texto: direccion, cargando: cargandoDir } = useDireccion(conectado ? posicion?.lat : null, conectado ? posicion?.lng : null);

  // Reloj para los avisos de «mucho tiempo quieto»
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  // Cada nueva posición del GPS se agrega a la ruta si de verdad se movió
  useEffect(() => {
    if (!activo || !posicion) return;
    const nuevo = { lat: posicion.lat, lng: posicion.lng, fecha: posicion.fecha || Date.now() };
    setPuntos((prev) => (debeAgregar(prev, nuevo) ? [...prev, nuevo] : prev));
  }, [activo, posicion]);

  const iniciar = async () => {
    inicio.current = Date.now();
    setPuntos(posicion ? [{ lat: posicion.lat, lng: posicion.lng, fecha: Date.now() }] : []);
    setActivo(true);
    await vibrar(400); // vibra al iniciar el seguimiento
    setToast({ texto: 'Seguimiento iniciado', color: 'primary' });
  };

  const detener = useCallback(
    (motivo = null) => {
      setActivo(false);
      const actuales = puntosRef.current;
      if (actuales.length) {
        const r = crearRecorrido(actuales, inicio.current ?? actuales[0].fecha);
        setRecorridos((lista) => (lista.some((x) => x.id === r.id) ? lista : [r, ...lista]));
      }
      exito();
      setToast({ texto: motivo ? `Seguimiento detenido: ${motivo}` : 'Recorrido guardado en el historial', color: motivo ? 'warning' : 'success' });
    },
    [setRecorridos, exito],
  );

  // Batería baja → se detiene solo
  useEffect(() => {
    if (activo && bateriaBaja(bateria)) detener('batería baja');
  }, [activo, bateria, detener]);

  // Respaldo web: en un PC el GPS casi no cambia; esto agrega un punto ~40 m al noreste
  const simularPaso = () => {
    setPuntos((prev) => {
      const base = prev[prev.length - 1] || posicion;
      if (!base) return prev;
      return [...prev, { lat: base.lat + 0.00028, lng: base.lng + 0.00022, fecha: Date.now(), simulado: true }];
    });
  };

  const fotoConUbicacion = async () => {
    const dataUrl = await tomarFoto();
    if (!dataUrl) return;
    const lineas = [
      posicion ? `${posicion.lat.toFixed(5)}, ${posicion.lng.toFixed(5)}` : 'Ubicación desconocida',
      conectado && direccion ? direccion.slice(0, 60) : null,
      new Date().toLocaleString('es-CO'),
    ].filter(Boolean);
    try {
      setFoto(await marcarFoto(dataUrl, lineas));
    } catch (e) {
      setToast({ texto: e.message, color: 'danger' });
    }
  };

  const velocidad = velocidadKmh(puntos);
  const movimiento = estadoMovimiento(activo ? velocidad : 0);
  const distancia = distanciaTotalKm(puntos);
  const avisos = activo ? avisosInteligentes({ puntos, ahora, conectado }) : conectado ? [] : avisosInteligentes({ conectado });
  const actual = puntos[puntos.length - 1] || posicion;

  return (
    <IonPage>
      <Header titulo="Challenge 16 · Recorridos" atras="/app/challenges" />
      <IonContent>
        {foto && (
          <div className={styles.vistaFoto}>
            <img src={foto} alt="Foto con marca de agua de ubicación" data-test="foto-marca" />
            <IonButton size="small" fill="clear" onClick={() => setFoto(null)}>Cerrar foto</IonButton>
          </div>
        )}
        <div className={styles.mapa}>
          <RutaMapa puntos={puntos} actual={actual} alto="280px" />
        </div>

        <div className={styles.datos}>
          <div>
            <small>Distancia</small>
            <strong data-test="distancia">{(distancia * 1000).toFixed(0)} m</strong>
          </div>
          <div>
            <small>Puntos</small>
            <strong data-test="puntos">{puntos.length}</strong>
          </div>
          <div>
            <small>Estado</small>
            <IonBadge color={movimiento.color}>{activo ? movimiento.texto : 'Detenido'}</IonBadge>
          </div>
        </div>

        <IonList inset>
          <IonItem>
            <IonIcon slot="start" icon={footstepsOutline} />
            <IonLabel className="ion-text-wrap">
              {conectado ? (cargandoDir ? 'Buscando dirección…' : direccion) : 'Sin conexión: solo coordenadas'}
              {posicion && <IonNote className={styles.coords}>{posicion.lat.toFixed(5)}, {posicion.lng.toFixed(5)}</IonNote>}
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon slot="start" icon={batteryHalfOutline} />
            <IonLabel>
              {bateria ? `Batería ${Math.round(bateria.nivel * 100)} %${bateria.cargando ? ' (cargando)' : ''}` : 'Batería no disponible en este navegador'}
            </IonLabel>
            <IonNote slot="end">{tipo}</IonNote>
          </IonItem>
        </IonList>
        {errorGps && <IonNote color="danger" className={styles.aviso}>{errorGps}</IonNote>}
        {avisos.map((a) => (
          <p key={a} className={styles.aviso} data-test="aviso">{a}</p>
        ))}

        <div className={styles.acciones}>
          {activo ? (
            <IonButton color="danger" onClick={() => detener()} data-test="btn-detener">
              <IonIcon slot="start" icon={stopOutline} />
              Detener y guardar
            </IonButton>
          ) : (
            <IonButton onClick={iniciar} data-test="btn-iniciar">
              <IonIcon slot="start" icon={playOutline} />
              Iniciar seguimiento
            </IonButton>
          )}
          {activo && !esNativo && (
            <IonButton fill="outline" onClick={simularPaso} data-test="btn-simular-paso">
              <IonIcon slot="start" icon={walkOutline} />
              Simular paso
            </IonButton>
          )}
          <IonButton fill="outline" onClick={fotoConUbicacion} data-test="btn-foto-marca">
            <IonIcon slot="start" icon={cameraOutline} />
            Foto con ubicación
          </IonButton>
          <IonButton fill="clear" routerLink="/app/challenges/16/historial" data-test="btn-historial">
            <IonIcon slot="start" icon={timeOutline} />
            Historial ({recorridos.length})
          </IonButton>
        </div>
        <IonToast isOpen={Boolean(toast)} message={toast?.texto} color={toast?.color} duration={2000} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Recorridos;
