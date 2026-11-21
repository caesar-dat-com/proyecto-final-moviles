// AppRoutes — decide qué rutas ve el usuario:
//  - sin sesión: solo login y registro
//  - con sesión: UserRoutes o AdminRoutes según el rol del perfil
import { IonRouterOutlet, IonSpinner } from '@ionic/react';
import { Navigate, Route } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import Menu from '../components/shared/Menu';
import Login from '../pages/Login/Index';
import Register from '../pages/Register/Index';
import UserRoutes from './UserRoutes';
import AdminRoutes from './AdminRoutes';

const Cargando = () => (
  <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
    <IonSpinner name="crescent" color="primary" />
  </div>
);

const AppRoutes = () => {
  const { usuario, perfil, cargando, esAdmin } = useAuthContext();

  // Esperamos sesión y perfil para no mostrar por un instante las rutas de otro rol
  if (cargando || (usuario && !perfil)) return <Cargando />;

  if (!usuario) {
    return (
      <IonRouterOutlet key="publico">
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </IonRouterOutlet>
    );
  }

  return (
    <>
      <Menu />
      <IonRouterOutlet id="main" key={esAdmin ? 'admin' : 'user'}>
        <Route path="/app/*" element={esAdmin ? <AdminRoutes /> : <UserRoutes />} />
        <Route path="*" element={<Navigate to="/app/inicio" replace />} />
      </IonRouterOutlet>
    </>
  );
};

export default AppRoutes;
