"use client";

import { useEffect, useRef, useState } from "react";
import { useLingua } from "@/gestione-lingua/lingua";
import styles from "@/app/[lingua]/esperienze/esperienze.module.css";

function leggiData(testo) {
  const [anno, mese, giorno] = testo.split("-");
  return {
    anno,
    mese: Number(mese),
    data: `${giorno}.${mese}.${anno}`,
  };
}

function Dettagli({ esperienza }) {
  const inizio = leggiData(esperienza.inizio);
  const fine = leggiData(esperienza.fine);

  return (
    <>
      <div className={styles.intestazione}>
        <div>
          <h2 className={styles.azienda}>{esperienza.azienda}</h2>
          {esperienza.luogo && <p className={styles.luogo}>{esperienza.luogo}</p>}
        </div>
        <p className={styles.periodo}>
          <time dateTime={esperienza.inizio}>{inizio.data}</time>
          {" – "}
          <time dateTime={esperienza.fine}>{fine.data}</time>
        </p>
      </div>

      <h3 className={styles.ruolo}>{esperienza.ruolo}</h3>
      <p className={styles.descrizione}>{esperienza.descrizione}</p>

      <ul className={styles.tecnologie}>
        {esperienza.tecnologie.map((tecnologia) => (
          <li key={tecnologia}>{tecnologia}</li>
        ))}
      </ul>
    </>
  );
}

export default function TimelineEsperienze({ esperienze }) {
  const { t } = useLingua();
  const [attiva, setAttiva] = useState(esperienze.length - 1);
  const linea = useRef(null);
  const primaVolta = useRef(true);

  // sul telefono la linea del tempo scorre di lato: la data selezionata va portata in vista,
  // al centro, altrimenti all'apertura quella più recente resterebbe tagliata sul bordo.
  // Si muove solo la linea (scrollTo sul suo contenitore), non la pagina
  useEffect(() => {
    const el = linea.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const voce = el.children[attiva];
    const centro = voce.offsetLeft - (el.clientWidth - voce.offsetWidth) / 2;
    const fermo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: centro, behavior: primaVolta.current || fermo ? "auto" : "smooth" });
    primaVolta.current = false;
  }, [attiva]);

  const esperienza = esperienze[attiva];
  const inizio = leggiData(esperienza.inizio);
  const fine = leggiData(esperienza.fine);

  const stessoAnno = inizio.anno === fine.anno;

  const primaEsperienza = attiva === 0;
  const ultimaEsperienza = attiva === esperienze.length - 1;

  return (
    <section className={styles.timeline} aria-label={t("timeline.elenco")}>
      <div className={styles.corpo}>
        <div className={styles.frecce}>
          <button
            type="button"
            className={`${styles.freccia} vetro-neon`}
            onClick={() => setAttiva(attiva - 1)}
            disabled={primaEsperienza}
            aria-label={t("timeline.precedente")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 15l6-6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.freccia} vetro-neon`}
            onClick={() => setAttiva(attiva + 1)}
            disabled={ultimaEsperienza}
            aria-label={t("timeline.successiva")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        <div className={styles.anni} aria-hidden="true">
          <p className={styles.annoPiccolo}>
            <span className={styles.lineetta} />
            {stessoAnno ? `${t(`timeline.mese${inizio.mese}`)} — ${t(`timeline.mese${fine.mese}`)}` : inizio.anno}
          </p>
          <p className={styles.annoGrande}>{fine.anno}</p>
        </div>

        <div className={styles.dettagliPila}>
          <div aria-live="polite">
            <Dettagli esperienza={esperienza} />
          </div>

          {/* copie invisibili di tutte le esperienze, una sopra l'altra:
              la zona prende l'altezza della più lunga, così cambiando esperienza
              le frecce e la linea del tempo non si spostano */}
          {esperienze.map((voce) => (
            <div key={voce.azienda + voce.inizio} className={styles.fantasma} aria-hidden="true">
              <Dettagli esperienza={voce} />
            </div>
          ))}
        </div>
      </div>

      <ol ref={linea} className={styles.linea}>
        {esperienze.map((voce, posizione) => {
          const data = leggiData(voce.inizio);
          const selezionata = posizione === attiva;

          return (
            <li key={voce.azienda + voce.inizio}>
              <button
                type="button"
                className={`${styles.punto} ${selezionata ? styles.attivo : ""}`}
                onClick={() => setAttiva(posizione)}
                aria-current={selezionata ? "step" : undefined}
                aria-label={`${voce.azienda}, ${t(`timeline.mese${data.mese}`)} ${data.anno}`}
              >
                <span className={styles.pallino} />
                <span className={styles.etichetta}>
                  {t(`timeline.mese${data.mese}`)} {data.anno}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}