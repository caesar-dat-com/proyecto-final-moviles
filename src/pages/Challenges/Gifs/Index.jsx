// Challenge 17 (Clase 11, CHALLENGE 09): buscador de GIFs con la API de GIPHY.
// Input de búsqueda → useGiphy (fetch + AbortController) → grilla de GIFs.
// La llave va en .env (VITE_GIPHY_KEY), nunca en el código.
import { useState } from 'react';
import {
  IonButton, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonNote, IonPage, IonSearchbar, IonSpinner, IonToolbar,
} from '@ionic/react';
import useGiphy, { hayLlaveGiphy } from '../../../hooks/useGiphy';
import useNetwork from '../../../hooks/useNetwork';
import Header from '../../../components/shared/Header';
import styles from './Index.module.scss';

const SUGERENCIAS = ['gatos', 'fútbol', 'feliz', 'programar', 'café'];

const Gifs = () => {
  const [termino, setTermino] = useState('');
  const { gifs, total, cargando, error, cargarMas, hayMas } = useGiphy(termino);
  const { conectado } = useNetwork();

  return (
    <IonPage>
      <Header titulo="Challenge 17 · GIPHY" atras="/app/challenges">
        <IonToolbar>
          <IonSearchbar
            placeholder="Buscar GIFs"
            value={termino}
            debounce={0}
            onIonInput={(e) => setTermino(e.detail.value ?? '')}
            data-test="buscar-gif"
          />
        </IonToolbar>
      </Header>
      <IonContent>
        {!hayLlaveGiphy && (
          <p className={styles.aviso}>
            Falta la llave: crea una app en developers.giphy.com y pon <code>VITE_GIPHY_KEY=...</code> en el archivo
            <code> .env</code>; luego reinicia <code>npm run dev</code>.
          </p>
        )}
        {!conectado && <p className={styles.aviso}>Sin conexión: la búsqueda necesita internet.</p>}

        {!termino.trim() && (
          <div className={styles.sugerencias}>
            {SUGERENCIAS.map((s) => (
              <IonButton key={s} size="small" fill="outline" onClick={() => setTermino(s)}>
                {s}
              </IonButton>
            ))}
          </div>
        )}

        {error && <IonNote color="danger" className={styles.aviso} data-test="error-gif">{error}</IonNote>}
        {termino.trim() && !error && (
          <p className={styles.total} data-test="total-gifs">
            {cargando && !gifs.length ? 'Buscando…' : `${total.toLocaleString('es-CO')} resultados para «${termino.trim()}»`}
          </p>
        )}

        <div className={styles.grilla} data-test="grilla-gifs">
          {gifs.map((g) => (
            <a key={g.id} href={g.enlace} target="_blank" rel="noreferrer" className={styles.gif}>
              <img src={g.url} alt={g.titulo} loading="lazy" style={{ aspectRatio: `${g.ancho} / ${g.alto}` }} />
            </a>
          ))}
        </div>
        {cargando && !gifs.length && (
          <div className={styles.centro}><IonSpinner name="crescent" /></div>
        )}
        <IonInfiniteScroll
          disabled={!hayMas || cargando}
          onIonInfinite={(e) => {
            cargarMas();
            setTimeout(() => e.target.complete(), 500);
          }}
        >
          <IonInfiniteScrollContent loadingText="Cargando más GIFs…" />
        </IonInfiniteScroll>
        <p className={styles.creditos}>Powered by GIPHY</p>
      </IonContent>
    </IonPage>
  );
};

export default Gifs;
