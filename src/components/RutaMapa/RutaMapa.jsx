// RutaMapa — mapa leaflet con la línea de un recorrido (Challenge 16).
// Dibuja la ruta (Polyline), el punto de inicio y la posición actual.
import { useEffect } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import BRAND from '../../helpers/brand';
import styles from './RutaMapa.module.scss';

// Ajusta el tamaño tras la animación de Ionic y encuadra la ruta
const Encuadrar = ({ puntos, actual }) => {
  const mapa = useMap();
  useEffect(() => {
    const t = setTimeout(() => mapa.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [mapa]);
  useEffect(() => {
    if (puntos.length > 1) mapa.fitBounds(puntos.map((p) => [p.lat, p.lng]), { padding: [30, 30], maxZoom: 17 });
    else if (actual) mapa.setView([actual.lat, actual.lng], 16);
  }, [mapa, puntos, actual]);
  return null;
};

const RutaMapa = ({ puntos = [], actual = null, alto = '300px' }) => {
  const inicio = puntos[0];
  return (
    <div className={styles.contenedor} style={{ height: alto }} data-test="ruta-mapa">
      <MapContainer center={BRAND.mapa.centro} zoom={BRAND.mapa.zoom} className={styles.mapa} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Encuadrar puntos={puntos} actual={actual} />
        {puntos.length > 1 && (
          <Polyline positions={puntos.map((p) => [p.lat, p.lng])} pathOptions={{ color: BRAND.colores.primary, weight: 5 }} />
        )}
        {inicio && (
          <CircleMarker center={[inicio.lat, inicio.lng]} radius={7} pathOptions={{ color: '#fff', weight: 2, fillColor: '#2dd36f', fillOpacity: 1 }}>
            <Popup>Inicio · {new Date(inicio.fecha).toLocaleTimeString('es-CO')}</Popup>
          </CircleMarker>
        )}
        {actual && (
          <CircleMarker
            center={[actual.lat, actual.lng]}
            radius={9}
            pathOptions={{ color: '#fff', weight: 3, fillColor: BRAND.colores.secondary, fillOpacity: 1 }}
          >
            <Popup>Estás aquí</Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
};

export default RutaMapa;
