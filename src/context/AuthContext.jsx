import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);
const CLAVE_TOKEN = "cine-adso-token";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    const token = window.localStorage.getItem(CLAVE_TOKEN);
    if (!token) {
      setCargando(false);
      return;
    }
    api
      .getPerfil()
      .then((perfil) => {
        if (!cancelado) setUsuario(perfil);
      })
      .catch(() => {
        window.localStorage.removeItem(CLAVE_TOKEN);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      cargando,
      autenticado: Boolean(usuario),
      async ingresar(email, password) {
        const { token, usuario: perfil } = await api.login({ email, password });
        window.localStorage.setItem(CLAVE_TOKEN, token);
        setUsuario(perfil);
        return perfil;
      },
      async registrarse(datos) {
        const { token, usuario: perfil } = await api.registro(datos);
        window.localStorage.setItem(CLAVE_TOKEN, token);
        setUsuario(perfil);
        return perfil;
      },
      salir() {
        window.localStorage.removeItem(CLAVE_TOKEN);
        setUsuario(null);
      },
    }),
    [usuario, cargando]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return contexto;
}
