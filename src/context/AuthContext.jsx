// AuthContext — comparte la ÚNICA instancia de useAuth creada en App.jsx.
// Así toda la app ve la misma sesión (evita el bug de dos instancias sueltas).
import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ value, children }) => (
  <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
);

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de <AuthProvider>');
  return ctx;
};
