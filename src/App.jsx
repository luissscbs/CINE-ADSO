import { Route, Routes } from "react-router-dom";
import { CatalogoProvider } from "./context/CatalogoContext.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import SeatSelection from "./pages/SeatSelection.jsx";

export default function App() {
  return (
    <CatalogoProvider>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pelicula/:id" element={<MovieDetail />} />
            <Route path="/asientos/:id" element={<SeatSelection />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CatalogoProvider>
  );
}
