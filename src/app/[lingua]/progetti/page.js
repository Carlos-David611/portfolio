import Image from "next/image";
import { leggiLinguaPagina } from "@/gestione-lingua/server";
import { metadati } from "@/gestione-lingua/seo";
import CardInclinata from "@/components/CardInclinata";
import { progetti } from "@/data/progetti";
import styles from "./progetti.module.css";

export const generateMetadata = () => metadati("progetti");

export default async function ProgettiPage() {
  const { t, dati } = await leggiLinguaPagina();

  return (
    <section>
      <p className={styles.etichetta}>{t("progetti.etichetta")}</p>
      <h1 className={styles.titoloPagina}>{t("progetti.titolo")}</h1>

      <div className={styles.griglia}>
        {dati(progetti).map((p, i) => (
          <CardInclinata key={p.slug} className={styles.posto}>
            <article className={styles.card}>
              <span className={styles.fractal} aria-hidden="true">
                <span className={styles.flusso} />
                <span className={styles.strisce}>
                  <span className={`${styles.flusso} ${styles.sfalsato}`} />
                </span>
              </span>

              <div className={styles.cardTesta}>
                <span className={styles.numero}>{String(i + 1).padStart(2, "0")}</span>
                {p.simbolo && (
                  <span className={styles.simbolo}>
                    <Image src={p.simbolo} alt="" width={100} height={100} />
                  </span>
                )}
                {p.categoria && <span className={styles.categoria}>{p.categoria}</span>}
              </div>

              <h2 className={styles.titolo}>{p.titolo}</h2>
              <p className={styles.descrizione}>{p.descrizione}</p>

              {p.obiettivi && (
                <ul className={styles.obiettivi}>
                  {p.obiettivi.map((obiettivo) => (
                    <li key={obiettivo}>{obiettivo}</li>
                  ))}
                </ul>
              )}

              <div className={styles.tecnologie}>
                {p.tecnologie.map((tecnologia) => (
                  <span key={tecnologia} className={styles.tag}>{tecnologia}</span>
                ))}
              </div>

              {p.github && (
                <a
                  className={`${styles.bottone} vetro-neon vetro-neon-notte`}
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub <span className={styles.freccia}>→</span>
                </a>
              )}
            </article>
          </CardInclinata>
        ))}
      </div>
    </section>
  );
}
