// ChatBubble — burbuja de chat: propia (derecha) o ajena (izquierda).
import { formatearHora } from '../../helpers/utils';
import styles from './ChatBubble.module.scss';

const ChatBubble = ({ mensaje, propio }) => (
  <div className={`${styles.fila} ${propio ? styles.propia : styles.ajena}`} data-test={propio ? 'burbuja-propia' : 'burbuja-ajena'}>
    <div className={styles.burbuja}>
      {!propio && <span className={styles.autor}>{mensaje.autor}</span>}
      <p className={styles.texto}>{mensaje.texto}</p>
      <span className={styles.hora}>{formatearHora(mensaje.created_at)}</span>
    </div>
  </div>
);

export default ChatBubble;
