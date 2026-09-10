import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { CatalogoProvider } from "./context/CatalogoContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CarritoProvider } from "./context/CarritoContext.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import SeatSelection from "./pages/SeatSelection.jsx";
import Auth from "./pages/Auth.jsx";
import Carrito from "./pages/Carrito.jsx";
import Dulceria from "./pages/Dulceria.jsx";

function Rutas() {
  const { pathname } = useLocation();

  // Cada ruta arranca arriba: instantáneo + repetido tras pintar,
  // para que ni el navegador ni las imágenes que cargan después
  // muevan la posición.
  useEffect(() => {
    const subir = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    subir();
    const raf = window.requestAnimationFrame(() => {
      subir();
      window.requestAnimationFrame(subir);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <main key={pathname} className="transicionPagina" style={{ flex: 1 }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pelicula/:id" element={<MovieDetail />} />
        <Route path="/asientos/:id" element={<SeatSelection />} />
        <Route path="/ingresar" element={<Auth />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/dulceria" element={<Dulceria />} />
      </Routes>
    </main>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CarritoProvider>
          <CatalogoProvider>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <Header />
              <Rutas />
              <Footer />
            </div>
          </CatalogoProvider>
        </CarritoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
