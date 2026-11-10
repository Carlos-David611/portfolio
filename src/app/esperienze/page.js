import TimelineEsperienze from "@/components/TimelineEsperienze";
import { esperienze } from "@/data/esperienze";

export const metadata = {
  title: "Esperienze | Carlos David",
};

export default function Esperienze() {
  return (
    <>
      <header className="esperienze-intestazione">
        <p className="competenze-etichetta">Il mio percorso</p>
        <h1 className="pagina-titolo">Esperienze</h1>
        <p className="esperienze-sottotitolo">
          Ruoli, aziende e capitoli, in ordine di tempo.
        </p>
      </header>

      {/* i dati passano al componente come prop */}
      <TimelineEsperienze esperienze={esperienze} />
    </>
  );
}