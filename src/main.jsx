import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setupIonicReact } from '@ionic/react';

/* CSS base de Ionic */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Mapas (Clase 10) */
import 'leaflet/dist/leaflet.css';

import './theme/variables.css';
import App from './App.jsx';
import { aplicarTemaMarca } from './helpers/utils';

setupIonicReact({ mode: 'ios' });
aplicarTemaMarca();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
