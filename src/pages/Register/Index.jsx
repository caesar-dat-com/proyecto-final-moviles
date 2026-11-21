// Register — registro real de usuarios (crea la cuenta y su fila en profiles).
import { useState } from 'react';
import { IonButton, IonContent, IonInput, IonItem, IonList, IonPage, IonSpinner, IonToast } from '@ionic/react';
import { Link } from 'react-router-dom';
import BRAND from '../../helpers/brand';
import { useAuthContext } from '../../context/AuthContext';
import styles from './Index.module.scss';

const Register = () => {
  const { registrar } = useAuthContext();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmacion: '' });
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState(null);

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.detail.value ?? '' }));

  const enviar = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmacion) {
      setToast({ texto: 'Las contraseñas no coinciden.', color: 'danger' });
      return;
    }
    setEnviando(true);
    try {
      const { requiereConfirmacion } = await registrar(form);
      if (requiereConfirmacion) {
        setToast({ texto: 'Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.', color: 'success' });
      }
    } catch (err) {
      setToast({ texto: err.message, color: 'danger' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <IonPage>
      <IonContent className={styles.contenido} fullscreen>
        <div className={styles.hero}>
          <h1>Crea tu cuenta</h1>
          <p>Únete a {BRAND.nombre}</p>
        </div>

        <form onSubmit={enviar} className={styles.formulario}>
          <IonList inset className={styles.lista}>
            <IonItem>
              <IonInput label="Nombre" labelPlacement="stacked" placeholder="Tu nombre" value={form.nombre} onIonInput={cambiar('nombre')} data-test="nombre" />
            </IonItem>
            <IonItem>
              <IonInput label="Correo" labelPlacement="stacked" type="email" placeholder="tu@correo.com" value={form.email} onIonInput={cambiar('email')} data-test="email" />
            </IonItem>
            <IonItem>
              <IonInput label="Contraseña" labelPlacement="stacked" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onIonInput={cambiar('password')} data-test="password" />
            </IonItem>
            <IonItem>
              <IonInput label="Confirmar contraseña" labelPlacement="stacked" type="password" value={form.confirmacion} onIonInput={cambiar('confirmacion')} data-test="confirmacion" />
            </IonItem>
          </IonList>

          <IonButton type="submit" expand="block" className={styles.boton} disabled={enviando} data-test="btn-registro">
            {enviando ? <IonSpinner name="dots" /> : 'Registrarme'}
          </IonButton>
        </form>

        <p className={styles.enlace}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" data-test="link-login">
            Inicia sesión
          </Link>
        </p>

        <IonToast isOpen={Boolean(toast)} message={toast?.texto} color={toast?.color} duration={3000} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Register;
