import { leggiLinguaPagina } from "@/i18n/server";
import { metadati } from "@/i18n/seo";
import TimelineEsperienze from "@/components/TimelineEsperienze";
import { esperienze } from "@/data/esperienze";

export const generateMetadata = () => metadati("esperienze");

export default async function Esperienze() {
  const { t, dati } = await leggiLinguaPagina();

  return (
    <>
      <header className="esperienze-intestazione">
        <p className="competenze-etichetta">{t("esperienze.etichetta")}</p>
        <h1 className="pagina-titolo">{t("esperienze.titolo")}</h1>
        <p className="esperienze-sottotitolo">
          {t("esperienze.sottotitolo")}
        </p>
      </header>

      {/* i dati passano al componente come prop */}
      <TimelineEsperienze esperienze={dati(esperienze)} />
    </>
  );
}