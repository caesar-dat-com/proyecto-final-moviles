// MapView — mapa con leaflet + react-leaflet (Clase 10).
// Muestra los places como marcadores y la ubicación del usuario.
import { useEffect } from 'react';
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import BRAND from '../../helpers/brand';
import styles from './MapView.module.scss';

// Marcador propio (divIcon): evita las imágenes por defecto de Leaflet, que se rompen
// con Vite, y toma el color de brand.js.
const iconoPlace = L.divIcon({
  className: styles.marcador,
  html: `<span style="background:${BRAND.colores.primary}"></span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -26],
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
    if (centro) mapa.flyTo(centro, Math.max(mapa.getZoom(), 14), { duration: 0.8 });
  }, [mapa, centro]);
  return null;
};

const MapView = ({ places = [], posicion = null, centro = null, onSeleccionar, alto = '100%' }) => (
  <div className={styles.contenedor} style={{ height: alto }} data-test="mapa">
    <MapContainer center={BRAND.mapa.centro} zoom={BRAND.mapa.zoom} className={styles.mapa} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjustarMapa centro={centro} />

      {places
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => (
          <Marker key={p.id} position={[Number(p.lat), Number(p.lng)]} icon={iconoPlace}>
            <Popup>
              <strong>{p.nombre}</strong>
              <br />
              {p.categoria}
              {onSeleccionar && (
                <>
                  <br />
                  <button type="button" className={styles.botonPopup} onClick={() => onSeleccionar(p)}>
                    Ver / solicitar
                  </button>
                </>
              )}
            </Popup>
          </Marker>
        ))}

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
