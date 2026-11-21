// AdminRoutes — pestañas del administrador (panel + gestión de todo).
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { Navigate, Route } from 'react-router-dom';
import { chatbubblesOutline, gridOutline, mapOutline, personOutline, receiptOutline } from 'ionicons/icons';
import BRAND from '../helpers/brand';
import Admin from '../pages/Admin/Index';
import MapPage from '../pages/Map/Index';
import Orders from '../pages/Orders/Index';
import Chat from '../pages/Chat/Index';
import Profile from '../pages/Profile/Index';

const AdminRoutes = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="inicio" element={<Admin />} />
      <Route path="mapa" element={<MapPage />} />
      <Route path="solicitudes" element={<Orders />} />
      <Route path="chat" element={<Chat />} />
      <Route path="chat/:sala" element={<Chat />} />
      <Route path="perfil" element={<Profile />} />
      <Route path="*" element={<Navigate to="/app/inicio" replace />} />
    </IonRouterOutlet>

    <IonTabBar slot="bottom">
      <IonTabButton tab="inicio" href="/app/inicio" data-test="tab-panel">
        <IonIcon icon={gridOutline} />
        <IonLabel>Panel</IonLabel>
      </IonTabButton>
      <IonTabButton tab="mapa" href="/app/mapa" data-test="tab-mapa">
        <IonIcon icon={mapOutline} />
        <IonLabel>Mapa</IonLabel>
      </IonTabButton>
      <IonTabButton tab="solicitudes" href="/app/solicitudes" data-test="tab-solicitudes">
        <IonIcon icon={receiptOutline} />
        <IonLabel>{BRAND.entidades.request.plural}</IonLabel>
      </IonTabButton>
      <IonTabButton tab="chat" href="/app/chat" data-test="tab-chat">
        <IonIcon icon={chatbubblesOutline} />
        <IonLabel>Chat</IonLabel>
      </IonTabButton>
      <IonTabButton tab="perfil" href="/app/perfil" data-test="tab-perfil">
        <IonIcon icon={personOutline} />
        <IonLabel>Perfil</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

export default AdminRoutes;
