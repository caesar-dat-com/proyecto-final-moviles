// Login — inicio de sesión real (Supabase Auth o respaldo local).
import { useState } from 'react';
import { IonButton, IonContent, IonInput, IonItem, IonList, IonNote, IonPage, IonSpinner, IonText, IonToast } from '@ionic/react';
import { Link } from 'react-router-dom';
import BRAND from '../../helpers/brand';
import { useAuthContext } from '../../context/AuthContext';
import styles from './Index.module.scss';

const Login = () => {
  const { login, modo } = useAuthContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.detail.value ?? '' }));

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await login(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <IonPage>
      <IonContent className={styles.contenido} fullscreen>
        <div className={styles.hero}>
          <div className={styles.logo}>{BRAND.nombre.charAt(0)}</div>
          <h1>{BRAND.nombre}</h1>
          <p>{BRAND.eslogan}</p>
        </div>

        <form onSubmit={enviar} className={styles.formulario}>
          <IonList inset className={styles.lista}>
            <IonItem>
              <IonInput
                label="Correo"
                labelPlacement="stacked"
                type="email"
                autocomplete="email"
                placeholder="tu@correo.com"
                value={form.email}
                onIonInput={cambiar('email')}
                data-test="email"
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Contraseña"
                labelPlacement="stacked"
                type="password"
                autocomplete="current-password"
                placeholder="••••••"
                value={form.password}
                onIonInput={cambiar('password')}
                data-test="password"
              />
            </IonItem>
          </IonList>

          <IonButton type="submit" expand="block" className={styles.boton} disabled={enviando} data-test="btn-login">
            {enviando ? <IonSpinner name="dots" /> : 'Iniciar sesión'}
          </IonButton>
        </form>

        <p className={styles.enlace}>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" data-test="link-registro">
            Regístrate
          </Link>
        </p>

        {modo === 'local' && (
          <IonText color="medium">
            <IonNote className={styles.aviso} data-test="aviso-modo-local">
              Modo local sin backend (no hay llaves de Supabase). Cuentas de demostración:
              <br />
              ciudadano@demo.local / demo123 · funcionario@demo.local / admin123
            </IonNote>
          </IonText>
        )}

        <IonToast isOpen={Boolean(error)} message={error} duration={2500} color="danger" onDidDismiss={() => setError('')} />
      </IonContent>
    </IonPage>
  );
};

export default Login;
