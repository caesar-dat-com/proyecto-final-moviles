// MapView — mapa con leaflet + react-leaflet (Clase 10).
// Muestra los reportes (marcador con el icono y color de su categoría), las dependencias
// responsables (marcador 🏛️) y la ubicación del usuario. El popup de cada reporte muestra
// la dirección obtenida por geocoding inverso (Nominatim).
import { useEffect } from 'react';
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import BRAND from '../../helpers/brand';
import { estadoInfo, formatearPrecio, idCorto } from '../../helpers/utils';
import Direccion from '../Direccion/Direccion';
import styles from './MapView.module.scss';

// Marcadores propios (divIcon): evitan las imágenes por defecto de Leaflet, que se rompen
// con Vite, y toman el color de brand.js. Se crean una vez por categoría.
const iconosReporte = new Map();
const iconoReporte = (categoria) => {
  if (!iconosReporte.has(categoria)) {
    const { emoji = '📌', color = BRAND.colores.primary } = BRAND.iconosCategoria[categoria] || {};
    iconosReporte.set(
      categoria,
      L.divIcon({
        className: styles.marcador,
        html: `<span style="background:${color}"><i>${emoji}</i></span>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30],
      }),
    );
  }
  return iconosReporte.get(categoria);
};

const iconoDependencia = L.divIcon({
  className: styles.dependencia,
  html: `<span style="border-color:${BRAND.colores.primary}">🏛️</span>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -12],
});

// Recalcula el tamaño (el mapa se monta dentro de una animación de Ionic)
// y centra el mapa cuando cambia `centro`.
const AjustarMapa = ({ centro }) => {
  const mapa = useMap();
  useEffect(() => {
    const t = setTimeout(() => mapa.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [mapa]);
  useEffect(() => {
    if (centro) mapa.flyTo(centro, Math.max(mapa.getZoom(), 15), { duration: 0.8 });
  }, [mapa, centro]);
  return null;
};

const conCoordenadas = (x) => x.lat != null && x.lng != null;

const MapView = ({ reportes = [], dependencias = [], posicion = null, centro = null, onAbrirReporte, alto = '100%' }) => (
  <div className={styles.contenedor} style={{ height: alto }} data-test="mapa">
    <MapContainer center={BRAND.mapa.centro} zoom={BRAND.mapa.zoom} className={styles.mapa} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjustarMapa centro={centro} />

      {dependencias.filter(conCoordenadas).map((d) => (
        <Marker key={`d-${d.id}`} position={[Number(d.lat), Number(d.lng)]} icon={iconoDependencia}>
          <Popup>
            <strong>{d.nombre}</strong>
            <br />
            {BRAND.valor.etiqueta}: {formatearPrecio(d.precio)}
          </Popup>
        </Marker>
      ))}

      {reportes.filter(conCoordenadas).map((r) => {
        const estado = estadoInfo(r.estado);
        return (
          <Marker key={`r-${r.id}`} position={[Number(r.lat), Number(r.lng)]} icon={iconoReporte(r.categoria)}>
            <Popup>
              <strong>
                {r.categoria} · #{idCorto(r.id)}
              </strong>
              <br />
              <span className={styles.estado} style={{ color: `var(--ion-color-${estado.color})` }}>
                {estado.texto}
              </span>
              <Direccion lat={r.lat} lng={r.lng} />
              {r.detalle && <p className={styles.detalle}>{r.detalle}</p>}
              {onAbrirReporte && (
                <button type="button" className={styles.botonPopup} onClick={() => onAbrirReporte(r)}>
                  Abrir chat del reporte
                </button>
              )}
            </Popup>
          </Marker>
        );
      })}

      {posicion && (
        <>
          <Circle center={[posicion.lat, posicion.lng]} radius={posicion.precision || 30} pathOptions={{ color: BRAND.colores.secondary, weight: 1 }} />
          <CircleMarker
            center={[posicion.lat, posicion.lng]}
            radius={9}
            pathOptions={{ color: '#fff', weight: 3, fillColor: BRAND.colores.secondary, fillOpacity: 1 }}
          >
            <Popup>Estás aquí</Popup>
          </CircleMarker>
        </>
      )}
    </MapContainer>
  </div>
);

export default MapView;
