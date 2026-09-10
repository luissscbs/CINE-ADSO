import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// El navegador no debe restaurar la posición de scroll entre rutas:
// cada página nueva arranca arriba.
try {
  window.history.scrollRestoration = "manual";
} catch {
  // navegadores viejos: se ignora
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
