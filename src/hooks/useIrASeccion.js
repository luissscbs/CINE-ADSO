import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Navega a una pestaña del home (cartelera | proximamente) y hace scroll
// hasta ella aunque el contenido cargue después (la cartelera es asíncrona).
export function useIrASeccion() {
  const navigate = useNavigate();

  return useCallback(
    (seccion) => {
      navigate(`/?tab=${seccion}`);

      let intentos = 0;
      const temporizador = window.setInterval(() => {
        const el = document.getElementById("cartelera");
        if (el) {
          window.clearInterval(temporizador);
          window.requestAnimationFrame(() =>
            el.scrollIntoView({ behavior: "smooth", block: "start" })
          );
        } else if (++intentos > 25) {
          window.clearInterval(temporizador);
        }
      }, 100);
    },
    [navigate]
  );
}
