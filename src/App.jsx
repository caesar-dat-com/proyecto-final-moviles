import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import useAuth from './hooks/useAuth';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  // ÚNICA instancia de useAuth en toda la app; se comparte por contexto.
  const auth = useAuth();

  return (
    <IonApp>
      <AuthProvider value={auth}>
        <IonReactRouter>
          <AppRoutes />
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
