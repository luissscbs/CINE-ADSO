import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

function obtenerTemaInicial() {
  if (typeof window === "undefined") return "dark";
  const guardado = window.localStorage.getItem("cine-adso-theme");
  if (guardado === "light" || guardado === "dark") return guardado;
  return "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(obtenerTemaInicial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
    window.localStorage.setItem("cine-adso-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const contexto = useContext(ThemeContext);
  if (!contexto) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return contexto;
}
