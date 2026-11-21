// Direccion — muestra la dirección de un punto (Nominatim) o sus coordenadas si la API falla.
import useDireccion from '../../hooks/useDireccion';
import styles from './Direccion.module.scss';

const Direccion = ({ lat, lng, className = '' }) => {
  const { texto, cargando, error } = useDireccion(lat, lng);
  return (
    <span
      className={`${styles.direccion} ${className}`}
      title={error ? `No se pudo obtener la dirección (${error}); se muestran las coordenadas.` : texto}
      data-test="direccion"
    >
      📍 {cargando ? 'Buscando dirección…' : texto}
    </span>
  );
};

export default Direccion;
