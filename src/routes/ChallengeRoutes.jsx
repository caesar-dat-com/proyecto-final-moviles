// ChallengeRoutes — rutas de los challenges 14-17, compartidas por UserRoutes y AdminRoutes.
// Se devuelve un arreglo de <Route> (no un componente) para que IonRouterOutlet las vea directo.
import { Route } from 'react-router-dom';
import Challenges from '../pages/Challenges/Index';
import Sensores from '../pages/Challenges/Sensores/Index';
import Geolocalizacion from '../pages/Challenges/Sensores/Geolocalizacion';
import Camara from '../pages/Challenges/Sensores/Camara';
import Movimiento from '../pages/Challenges/Sensores/Movimiento';
import Dispositivo from '../pages/Challenges/Sensores/Dispositivo';
import Haptica from '../pages/Challenges/Sensores/Haptica';
import Red from '../pages/Challenges/Sensores/Red';
import Tareas from '../pages/Challenges/Tareas/Index';
import Recorridos from '../pages/Challenges/Recorridos/Index';
import Historial from '../pages/Challenges/Recorridos/Historial';
import Gifs from '../pages/Challenges/Gifs/Index';

const RUTAS = [
  ['challenges', Challenges],
  ['challenges/14', Sensores],
  ['challenges/14/geolocalizacion', Geolocalizacion],
  ['challenges/14/camara', Camara],
  ['challenges/14/movimiento', Movimiento],
  ['challenges/14/dispositivo', Dispositivo],
  ['challenges/14/haptica', Haptica],
  ['challenges/14/red', Red],
  ['challenges/15', Tareas],
  ['challenges/16', Recorridos],
  ['challenges/16/historial', Historial],
  ['challenges/17', Gifs],
];

export const rutasChallenges = () => RUTAS.map(([path, Pagina]) => <Route key={path} path={path} element={<Pagina />} />);

export default rutasChallenges;
