// Menú de challenges del Corte 3 (14 a 17). Cada tarjeta abre la solución dentro de la app.
// Los enunciados reconstruidos están en /challenges/<n>-<tema>/ENUNCIADO.md.
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonIcon, IonPage } from '@ionic/react';
import { checkboxOutline, hardwareChipOutline, imagesOutline, navigateOutline } from 'ionicons/icons';
import Header from '../../components/shared/Header';
import styles from './Index.module.scss';

export const CHALLENGES = [
  {
    numero: 14,
    ruta: '/app/challenges/14',
    titulo: 'Sensores',
    clase: 'Clase 08 · Sensors',
    resumen: 'Inicio con un botón por sensor y una página por cada uno: GPS, cámara, acelerómetro, dispositivo, vibración y red.',
    icono: hardwareChipOutline,
  },
  {
    numero: 15,
    ruta: '/app/challenges/15',
    titulo: 'Tareas con Supabase',
    clase: 'Clase 09 · Supabase',
    resumen: 'Tabla «tareas» con RLS, registro/login, CRUD, lista en vivo (Realtime) y foto al bucket «avatars».',
    icono: checkboxOutline,
  },
  {
    numero: 16,
    ruta: '/app/challenges/16',
    titulo: 'Mapas + sensores',
    clase: 'Clase 10 · APIs & Maps',
    resumen: 'Seguimiento en el mapa: vibra al iniciar, dirección si hay red, batería baja, historial JSON por día, foto con ubicación.',
    icono: navigateOutline,
  },
  {
    numero: 17,
    ruta: '/app/challenges/17',
    titulo: 'Buscador GIPHY',
    clase: 'Clase 11 · API requests',
    resumen: 'Buscar GIFs con fetch, llave en .env, cancelación con AbortController y manejo de errores HTTP.',
    icono: imagesOutline,
  },
];

const Challenges = () => (
  <IonPage>
    <Header titulo="Challenges · Corte 3" />
    <IonContent>
      <p className={styles.intro}>Soluciones de los challenges 14 a 17 (enunciados reconstruidos de las diapositivas).</p>
      {CHALLENGES.map((c) => (
        <IonCard key={c.numero} routerLink={c.ruta} button data-test={`challenge-${c.numero}`}>
          <IonCardHeader>
            <IonCardSubtitle>{c.clase}</IonCardSubtitle>
            <IonCardTitle className={styles.titulo}>
              <IonIcon icon={c.icono} /> {c.numero}. {c.titulo}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>{c.resumen}</IonCardContent>
        </IonCard>
      ))}
    </IonContent>
  </IonPage>
);

export default Challenges;
