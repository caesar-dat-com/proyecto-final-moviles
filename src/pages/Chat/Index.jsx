// Chat — sala en tiempo real con useRealtimeChat.
// /app/chat → sala «Comunidad»; /app/chat/request-12 → sala del reporte 12 (vecinos + funcionario).
import { useEffect, useRef, useState } from 'react';
import {
  IonButton, IonContent, IonFooter, IonIcon, IonInput, IonItem, IonList,
  IonPage, IonSpinner, IonToast, IonToolbar,
} from '@ionic/react';
import { send } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import BRAND from '../../helpers/brand';
import { idCorto } from '../../helpers/utils';
import { useAuthContext } from '../../context/AuthContext';
import useRealtimeChat from '../../hooks/useRealtimeChat';
import useNetwork from '../../hooks/useNetwork';
import Header from '../../components/shared/Header';
import ChatBubble from '../../components/ChatBubble/ChatBubble';
import styles from './Index.module.scss';

const tituloSala = (sala) => {
  if (sala === BRAND.salaGeneral.id) return BRAND.salaGeneral.titulo;
  const [, id] = sala.split('request-');
  return id ? `${BRAND.entidades.request.singular} #${idCorto(id)}` : sala;
};

const Chat = () => {
  const { sala = BRAND.salaGeneral.id } = useParams();
  const { perfil } = useAuthContext();
  const { mensajes, cargando, enviar, error } = useRealtimeChat(sala, perfil);
  const { conectado } = useNetwork();
  const [texto, setTexto] = useState('');
  const [errorEnvio, setErrorEnvio] = useState('');
  const contenido = useRef(null);

  // Scroll al último mensaje cada vez que llega uno nuevo
  useEffect(() => {
    const t = setTimeout(() => contenido.current?.scrollToBottom(300), 50);
    return () => clearTimeout(t);
  }, [mensajes.length]);

  const enviarMensaje = async (e) => {
    e?.preventDefault();
    const valor = texto;
    setTexto('');
    try {
      await enviar(valor);
    } catch (err) {
      setTexto(valor);
      setErrorEnvio(err.message);
    }
  };

  return (
    <IonPage>
      <Header titulo={`Chat · ${tituloSala(sala)}`} atras={sala !== BRAND.salaGeneral.id ? '/app/reportes' : null} />

      <IonContent ref={contenido} className={styles.contenido}>
        {cargando && (
          <div className={styles.centro}>
            <IonSpinner />
          </div>
        )}
        {error && <p className={styles.vacio}>Error: {error}</p>}
        {!cargando && mensajes.length === 0 && <p className={styles.vacio}>Aún no hay mensajes. ¡Escribe el primero!</p>}

        <IonList lines="none" className={styles.lista} data-test="lista-mensajes">
          {mensajes.map((m) => (
            <IonItem key={m.id} className={styles.item}>
              <ChatBubble mensaje={m} propio={m.user_id === perfil.id} />
            </IonItem>
          ))}
        </IonList>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <form onSubmit={enviarMensaje} className={styles.barra}>
            <IonInput
              className={styles.input}
              placeholder={conectado ? 'Escribe un mensaje…' : 'Sin conexión'}
              value={texto}
              disabled={!conectado}
              onIonInput={(e) => setTexto(e.detail.value ?? '')}
              data-test="chat-input"
            />
            <IonButton type="submit" shape="round" disabled={!conectado || !texto.trim()} data-test="chat-enviar">
              <IonIcon slot="icon-only" icon={send} />
            </IonButton>
          </form>
        </IonToolbar>
      </IonFooter>

      <IonToast isOpen={Boolean(errorEnvio)} message={errorEnvio} color="danger" duration={2500} onDidDismiss={() => setErrorEnvio('')} />
    </IonPage>
  );
};

export default Chat;
