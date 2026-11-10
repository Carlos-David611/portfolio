import CaroselloCertificazioni from "@/components/CaroselloCertificazioni";
import { certificazioni } from "@/data/certificazioni";

export const metadata = {
  title: "Certificazioni | Carlos David",
};

export default function Certificazioni() {
  // dalla più recente alla più vecchia
  const ordinate = [...certificazioni].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <>
      {/* la stessa intestazione di Esperienze: etichetta, titolo grande, sottotitolo */}
      <header className="esperienze-intestazione">
        <p className="competenze-etichetta">I miei attestati</p>
        <h1 className="pagina-titolo">Certificazioni</h1>
        <p className="esperienze-sottotitolo">
          Corsi e attestati. Gira le card e apri quella che vuoi.
        </p>
      </header>

      <CaroselloCertificazioni certificazioni={ordinate} />
    </>
  );
}