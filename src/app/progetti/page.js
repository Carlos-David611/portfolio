import T from "@/i18n/T";
import { progetti } from "@/data/progetti";
import styles from "./progetti.module.css";

export default function ProgettiPage() {
  return (
    <section>
      <p className={styles.etichetta}><T>I miei lavori</T></p>
      <h1 className={styles.titoloPagina}><T>Progetti</T></h1>

      <div className={styles.griglia}>
        {progetti.map((p, i) => (
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
              {p.categoria && <span className={styles.categoria}><T>{p.categoria}</T></span>}
            </div>

            <h2 className={styles.titolo}><T>{p.titolo}</T></h2>
            <p className={styles.descrizione}><T>{p.descrizione}</T></p>

            {p.obiettivi && (
              <ul className={styles.obiettivi}>
                {p.obiettivi.map((obiettivo) => (
                  <li key={obiettivo}><T>{obiettivo}</T></li>
                ))}
              </ul>
            )}

            <div className={styles.tecnologie}>
              {p.tecnologie.map((t) => (
                <span key={t} className={styles.tag}><T>{t}</T></span>
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
