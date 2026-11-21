// UserRoutes — pestañas del usuario normal.
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { Navigate, Route } from 'react-router-dom';
import { chatbubblesOutline, homeOutline, mapOutline, personOutline, megaphoneOutline } from 'ionicons/icons';
import BRAND from '../helpers/brand';
import Home from '../pages/Home/Index';
import MapPage from '../pages/Map/Index';
import Orders from '../pages/Orders/Index';
import Chat from '../pages/Chat/Index';
import Profile from '../pages/Profile/Index';
import rutasChallenges from './ChallengeRoutes';

const UserRoutes = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="inicio" element={<Home />} />
      <Route path="mapa" element={<MapPage />} />
      <Route path="reportes" element={<Orders />} />
      <Route path="chat" element={<Chat />} />
      <Route path="chat/:sala" element={<Chat />} />
      <Route path="perfil" element={<Profile />} />
      {rutasChallenges()}
      <Route path="*" element={<Navigate to="/app/inicio" replace />} />
    </IonRouterOutlet>

    <IonTabBar slot="bottom">
      <IonTabButton tab="inicio" href="/app/inicio" data-test="tab-inicio">
        <IonIcon icon={homeOutline} />
        <IonLabel>Inicio</IonLabel>
      </IonTabButton>
      <IonTabButton tab="mapa" href="/app/mapa" data-test="tab-mapa">
        <IonIcon icon={mapOutline} />
        <IonLabel>Mapa</IonLabel>
      </IonTabButton>
      <IonTabButton tab="reportes" href="/app/reportes" data-test="tab-reportes">
        <IonIcon icon={megaphoneOutline} />
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

export default UserRoutes;
