// useAuth — login, registro, sesión y perfil.
// IMPORTANTE: se instancia UNA sola vez en App.jsx y se comparte con AuthContext.
// Con llaves usa Supabase Auth + tabla profiles; sin llaves usa el respaldo local.
import { useCallback, useEffect, useState } from 'react';
import { haySupabase, supabase } from '../lib/supabase';
import { actualizar, consultar, insertar, leerTabla, sembrarDatos } from '../helpers/localDb';
import { esEmailValido, hashTexto } from '../helpers/utils';

const CLAVE_SESION = 'reportacali-local:_sesion';

const validar = ({ email, password, nombre }, esRegistro) => {
  if (!esEmailValido(email)) throw new Error('Escribe un correo válido.');
  if (!password || password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
  if (esRegistro && (!nombre || nombre.trim().length < 2)) throw new Error('Escribe tu nombre.');
};

export const useAuth = () => {
  const [usuario, setUsuario] = useState(null); // { id, email }
  const [perfil, setPerfil] = useState(null); // { id, nombre, rol, avatar_url }
  const [cargando, setCargando] = useState(true);

  // ---------- Perfil ----------
  const cargarPerfil = useCallback(async (user) => {
    if (!user) {
      setPerfil(null);
      return;
    }
    if (haySupabase) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (error) throw error;
      if (data) {
        setPerfil(data);
      } else {
        // Respaldo por si el trigger de la BD no creó el perfil
        const nuevo = { id: user.id, nombre: user.user_metadata?.nombre || user.email, rol: 'user' };
        const { data: creado, error: e2 } = await supabase.from('profiles').insert(nuevo).select().single();
        if (e2) throw e2;
        setPerfil(creado);
      }
    } else {
      setPerfil(consultar('profiles', [['id', '==', user.id]])[0] || null);
    }
  }, []);

  // ---------- Sesión inicial ----------
  useEffect(() => {
    let activo = true;

    if (haySupabase) {
      supabase.auth.getSession().then(async ({ data }) => {
        const user = data.session?.user ?? null;
        if (!activo) return;
        setUsuario(user ? { id: user.id, email: user.email } : null);
        await cargarPerfil(user).catch(console.error);
        if (activo) setCargando(false);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_evento, session) => {
        const user = session?.user ?? null;
        setUsuario(user ? { id: user.id, email: user.email } : null);
        // Se difiere para no llamar a Supabase dentro del callback (recomendación del SDK)
        setTimeout(() => cargarPerfil(user).catch(console.error), 0);
      });
      return () => {
        activo = false;
        sub.subscription.unsubscribe();
      };
    }

    sembrarDatos().then(() => {
      if (!activo) return;
      const id = localStorage.getItem(CLAVE_SESION);
      const user = id ? leerTabla('_usuarios').find((u) => u.id === id) : null;
      setUsuario(user ? { id: user.id, email: user.email } : null);
      setPerfil(user ? consultar('profiles', [['id', '==', user.id]])[0] || null : null);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [cargarPerfil]);

  // ---------- Acciones ----------
  const login = useCallback(async ({ email, password }) => {
    validar({ email, password });
    const correo = email.trim().toLowerCase();
    if (haySupabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: correo, password });
      if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message);
      return;
    }
    const hash = await hashTexto(password);
    const user = leerTabla('_usuarios').find((u) => u.email === correo && u.password_hash === hash);
    if (!user) throw new Error('Correo o contraseña incorrectos.');
    localStorage.setItem(CLAVE_SESION, user.id);
    setUsuario({ id: user.id, email: user.email });
    setPerfil(consultar('profiles', [['id', '==', user.id]])[0] || null);
  }, []);

  // Devuelve { requiereConfirmacion } cuando Supabase exige confirmar el correo
  const registrar = useCallback(async ({ nombre, email, password }) => {
    validar({ nombre, email, password }, true);
    const correo = email.trim().toLowerCase();
    if (haySupabase) {
      const { data, error } = await supabase.auth.signUp({
        email: correo,
        password,
        options: { data: { nombre: nombre.trim() } },
      });
      if (error) throw new Error(error.message);
      return { requiereConfirmacion: !data.session };
    }
    if (leerTabla('_usuarios').some((u) => u.email === correo)) throw new Error('Ese correo ya está registrado.');
    const id = `local-${crypto.randomUUID?.() ?? Date.now()}`;
    const usuarios = leerTabla('_usuarios');
    usuarios.push({ id, email: correo, nombre: nombre.trim(), rol: 'user', password_hash: await hashTexto(password) });
    localStorage.setItem('reportacali-local:_usuarios', JSON.stringify(usuarios));
    const nuevoPerfil = insertar('profiles', { id, email: correo, nombre: nombre.trim(), rol: 'user', avatar_url: null });
    localStorage.setItem(CLAVE_SESION, id);
    setUsuario({ id, email: correo });
    setPerfil(nuevoPerfil);
    return { requiereConfirmacion: false };
  }, []);

  const logout = useCallback(async () => {
    if (haySupabase) await supabase.auth.signOut();
    localStorage.removeItem(CLAVE_SESION);
    setUsuario(null);
    setPerfil(null);
  }, []);

  const actualizarPerfil = useCallback(
    async (cambios) => {
      if (!usuario) return;
      if (haySupabase) {
        const { data, error } = await supabase.from('profiles').update(cambios).eq('id', usuario.id).select().single();
        if (error) throw error;
        setPerfil(data);
      } else {
        setPerfil(actualizar('profiles', usuario.id, cambios));
      }
    },
    [usuario],
  );

  return {
    usuario,
    perfil,
    cargando,
    esAdmin: perfil?.rol === 'admin',
    modo: haySupabase ? 'supabase' : 'local',
    login,
    registrar,
    logout,
    actualizarPerfil,
  };
};

export default useAuth;
