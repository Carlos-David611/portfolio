import T from "@/i18n/T";
import TimelineEsperienze from "@/components/TimelineEsperienze";
import { esperienze } from "@/data/esperienze";

export const metadata = {
  title: "Esperienze | Carlos David",
};

export default function Esperienze() {
  return (
    <>
      <header className="esperienze-intestazione">
        <p className="competenze-etichetta"><T>Il mio percorso</T></p>
        <h1 className="pagina-titolo"><T>Esperienze</T></h1>
        <p className="esperienze-sottotitolo">
          <T>Ruoli, aziende e capitoli, in ordine di tempo.</T>
        </p>
      </header>

      {/* i dati passano al componente come prop */}
      <TimelineEsperienze esperienze={esperienze} />
    </>
  );
}