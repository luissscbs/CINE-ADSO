import { useEffect } from "react";
import DulceriaSection from "../components/DulceriaSection.jsx";

export default function Dulceria() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, []);

  return (
    <div style={{ paddingTop: "var(--space-xl)" }}>
      <DulceriaSection />
    </div>
  );
}
