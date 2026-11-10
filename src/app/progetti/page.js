import { progetti } from "@/data/progetti";
import styles from "./progetti.module.css";

export default function ProgettiPage() {
  return (
    <section>
      <p className={styles.etichetta}>I miei lavori</p>
      <h1 className={styles.titoloPagina}>Progetti</h1>

      <div className={styles.griglia}>
        {progetti.map((p, i) => (
          <article key={p.slug} className={styles.card}>
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
              {p.tecnologie.map((t) => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>

            {p.github && (
              <a
                className={styles.bottone}
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
