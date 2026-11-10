"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/esperienze/esperienze.module.css";

// i mesi li scriviamo noi: così il risultato è identico
// sul server e nel browser, qualunque sia la lingua del computer
const MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

// da "2025-04-01" ricava i pezzi che ci servono
function leggiData(testo) {
  const [anno, mese, giorno] = testo.split("-");
  return {
    anno,                          // "2025"
    mese: MESI[Number(mese) - 1],  // "apr"  (-1 perché gli array partono da 0)
    data: `${giorno}.${mese}.${anno}`, // "01.04.2025"
  };
}

// il contenuto di una singola esperienza
function Dettagli({ esperienza }) {
  const inizio = leggiData(esperienza.inizio);
  const fine = leggiData(esperienza.fine);

  return (
    <>
      <div className={styles.intestazione}>
        <div>
          <h2 className={styles.azienda}>{esperienza.azienda}</h2>
          {/* && = mostra la riga solo se luogo non è vuoto */}
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
  // si parte dall'ultima esperienza, la più recente
  const [attiva, setAttiva] = useState(esperienze.length - 1);
  const linea = useRef(null);
  const primaVolta = useRef(true);

  // sul telefono la linea del tempo scorre di lato: la data selezionata va portata in vista,
  // al centro, altrimenti all'apertura quella più recente resterebbe tagliata sul bordo.
  // Si muove solo la linea (scrollTo sul suo contenitore), non la pagina
  useEffect(() => {
    const el = linea.current;
    if (!el || el.scrollWidth <= el.clientWidth) return; // tutta in vista: non serve
    const voce = el.children[attiva];
    const centro = voce.offsetLeft - (el.clientWidth - voce.offsetWidth) / 2;
    const fermo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // la prima volta senza animazione: la pagina si apre già con la data giusta in vista
    el.scrollTo({ left: centro, behavior: primaVolta.current || fermo ? "auto" : "smooth" });
    primaVolta.current = false;
  }, [attiva]);

  const esperienza = esperienze[attiva];
  const inizio = leggiData(esperienza.inizio);
  const fine = leggiData(esperienza.fine);

  // se inizia e finisce nello stesso anno, sopra mostriamo i mesi
  // altrimenti l'anno di inizio (come nell'esempio: 2023 sopra, 2024 sotto)
  const stessoAnno = inizio.anno === fine.anno;

  const primaEsperienza = attiva === 0;
  const ultimaEsperienza = attiva === esperienze.length - 1;

  return (
    <section className={styles.timeline} aria-label="Le mie esperienze">
      <div className={styles.corpo}>
        {/* le frecce: disabled = non cliccabili quando non c'è altro */}
        <div className={styles.frecce}>
          <button
            type="button"
            className={styles.freccia}
            onClick={() => setAttiva(attiva - 1)}
            disabled={primaEsperienza}
            aria-label="Esperienza precedente"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 15l6-6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.freccia}
            onClick={() => setAttiva(attiva + 1)}
            disabled={ultimaEsperienza}
            aria-label="Esperienza successiva"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* gli anni grandi: aria-hidden perché le date le legge già "periodo" */}
        <div className={styles.anni} aria-hidden="true">
          <p className={styles.annoPiccolo}>
            <span className={styles.lineetta} />
            {stessoAnno ? `${inizio.mese} — ${fine.mese}` : inizio.anno}
          </p>
          <p className={styles.annoGrande}>{fine.anno}</p>
        </div>

        <div className={styles.dettagliPila}>
          {/* aria-live: chi usa uno screen reader sente il nuovo contenuto quando cambia */}
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

      {/* la linea del tempo: un pallino cliccabile per ogni esperienza */}
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
                // aria-current: dice agli screen reader quale è quella selezionata
                aria-current={selezionata ? "step" : undefined}
                aria-label={`${voce.azienda}, ${data.mese} ${data.anno}`}
              >
                <span className={styles.pallino} />
                <span className={styles.etichetta}>
                  {data.mese} {data.anno}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}