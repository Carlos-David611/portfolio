import GalleriaCertificazioni from "@/components/GalleriaCertificazioni";
import { certificazioni } from "@/data/certificazioni";
// la stessa intestazione della pagina Progetti: etichetta e titolo con gli stessi stili
import intestazione from "../progetti/progetti.module.css";

export const metadata = {
  title: "Certificazioni | Carlos David",
};

export default function Certificazioni() {
  // dalla più recente alla più vecchia
  const ordinate = [...certificazioni].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <>
      {/* come in Progetti: etichetta e titolo grande, allineati alla colonna della pagina.
          Sopra la galleria (che sugli schermi grandi gli sale accanto) e largo solo quanto il testo:
          il mouse sul titolo non muove le card, accanto sì */}
      <header style={{ position: "relative", zIndex: 2, width: "fit-content" }}>
        <p className={intestazione.etichetta}>I miei attestati</p>
        <h1 className={intestazione.titoloPagina}>Certificazioni</h1>
      </header>

      <GalleriaCertificazioni certificazioni={ordinate} />
    </>
  );
}