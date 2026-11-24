import { leggiLinguaPagina } from "@/i18n/server";
import { metadati } from "@/i18n/seo";
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
          <article key={p.slug} className={styles.card}>
            {/* il vetro "fractal": una fascia di colore che scorre dietro coste verticali.
                La seconda copia, sfasata, si vede solo da una costa sì e una no: è lei che
                fa sembrare la luce spezzata a gradini */}
            <span className={styles.fractal} aria-hidden="true">
              <span className={styles.flusso} />
              <span className={styles.strisce}>
                <span className={`${styles.flusso} ${styles.sfalsato}`} />
              </span>
            </span>

            <div className={styles.cardTesta}>
              <span className={styles.numero}>{String(i + 1).padStart(2, "0")}</span>
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
        ))}
      </div>
    </section>
  );
}
