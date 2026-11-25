import Link from "next/link";
import { percorso } from "@/gestione-lingua/config";
import { leggiLingua } from "@/gestione-lingua/server";

export default async function NonTrovata() {
  const { lingua, t } = await leggiLingua();

  return (
    <section className="competenze">
      <h1 className="competenze-titolo">{t("errore.titolo")}</h1>
      <p>{t("errore.testo")}</p>
      <p>
        <Link href={percorso(lingua)} style={{ color: "var(--accento)" }}>
          {t("menu.tornaHome")}
        </Link>
      </p>
    </section>
  );
}
