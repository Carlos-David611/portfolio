import { leggiLinguaPagina } from "@/i18n/server";
import { metadati } from "@/i18n/seo";
import GalleriaCertificazioni from "@/components/GalleriaCertificazioni";
import { certificazioni } from "@/data/certificazioni";
import intestazione from "../progetti/progetti.module.css";

export const generateMetadata = () => metadati("certificazioni");

export default async function Certificazioni() {
  const { t, dati } = await leggiLinguaPagina();
  // dalla più recente alla più vecchia
  const ordinate = [...dati(certificazioni)].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <>
      
      <header style={{ position: "relative", zIndex: 2, width: "fit-content" }}>
        <p className={intestazione.etichetta}>{t("certificazioni.etichetta")}</p>
        <h1 className={intestazione.titoloPagina}>{t("certificazioni.titolo")}</h1>
      </header>

      <GalleriaCertificazioni certificazioni={ordinate} />
    </>
  );
}