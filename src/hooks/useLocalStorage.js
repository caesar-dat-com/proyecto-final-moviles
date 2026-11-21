// useLocalStorage — estado de React persistido en la memoria local del dispositivo.
import { useCallback, useEffect, useState } from 'react';

export const useLocalStorage = (clave, valorInicial) => {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave);
      return guardado !== null ? JSON.parse(guardado) : valorInicial;
    } catch {
      return valorInicial;
    }
  });

  useEffect(() => {
    localStorage.setItem(clave, JSON.stringify(valor));
  }, [clave, valor]);

  // Sincroniza si otra pestaña cambia la misma clave
  useEffect(() => {
    const alCambiar = (e) => {
      if (e.key === clave && e.newValue !== null) setValor(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', alCambiar);
    return () => window.removeEventListener('storage', alCambiar);
  }, [clave]);

  const borrar = useCallback(() => {
    localStorage.removeItem(clave);
    setValor(valorInicial);
  }, [clave, valorInicial]);

  return [valor, setValor, borrar];
};

export default useLocalStorage;
