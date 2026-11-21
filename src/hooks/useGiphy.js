// useGiphy — búsqueda de GIFs (Challenge 17 / Clase 11, slides 32-33).
// Encapsula estado, cancelación y errores: si el término cambia, la petición anterior se
// cancela con AbortController, y el cleanup evita actualizar un componente desmontado.
// La llave va en .env → VITE_GIPHY_KEY (nunca en el código). VITE_GIPHY_BASE es opcional
// (sirve para apuntar a un servidor simulado en las pruebas).
import { useCallback, useEffect, useMemo, useState } from 'react';
import { crearClienteGiphy } from '../helpers/giphy';

const API_KEY = import.meta.env.VITE_GIPHY_KEY;
const BASE = import.meta.env.VITE_GIPHY_BASE || 'https://api.giphy.com/v1';

export const hayLlaveGiphy = Boolean(API_KEY);

export const useGiphy = (termino, { limite = 24, esperaMs = 400 } = {}) => {
  const cliente = useMemo(() => crearClienteGiphy({ apiKey: API_KEY, base: BASE }), []);
  const [gifs, setGifs] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(0);

  // Si cambia el término se vuelve a la primera página
  useEffect(() => setPagina(0), [termino]);

  useEffect(() => {
    const q = String(termino ?? '').trim();
    if (!q) {
      setGifs([]);
      setTotal(0);
      setError(null);
      return undefined;
    }
    const control = new AbortController();
    // Espera corta (debounce) para no pedir en cada tecla
    const t = setTimeout(async () => {
      setCargando(true);
      setError(null);
      try {
        const r = await cliente.buscar(q, { limite, offset: pagina * limite, signal: control.signal });
        setGifs((prev) => (pagina === 0 ? r.gifs : [...prev, ...r.gifs]));
        setTotal(r.total);
      } catch (e) {
        if (e.name !== 'AbortError') {
          setError(e.message);
          if (pagina === 0) {
            setGifs([]);
            setTotal(0);
          }
        }
      } finally {
        if (!control.signal.aborted) setCargando(false);
      }
    }, pagina === 0 ? esperaMs : 0);
    return () => {
      clearTimeout(t);
      control.abort();
    };
  }, [cliente, termino, pagina, limite, esperaMs]);

  const cargarMas = useCallback(() => setPagina((p) => p + 1), []);
  const hayMas = gifs.length < total;

  return { gifs, total, cargando, error, cargarMas, hayMas };
};

export default useGiphy;
