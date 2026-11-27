"use client";

// Le esperienze si scoprono scorrendo, una alla volta, in ordine di tempo.
// La sezione resta ferma (sticky) mentre scorri: ogni tratto di scroll fa uscire
// un'esperienza ed entrare la successiva, e la linea del tempo al centro si riempie.
// Si vede sempre e solo un'esperienza: quelle dopo non si intravedono.
// Se un'esperienza è più alta dello schermo (testi lunghi, telefoni piccoli o in orizzontale),
// mentre scorri il suo testo sale finché non l'hai letta tutta, e solo dopo arriva la successiva.

import { useEffect, useRef, useState } from "react";
import { useLingua } from "@/gestione-lingua/lingua";
import styles from "@/app/[lingua]/esperienze/esperienze.module.css";

// quanto scroll per passare da un'esperienza alla successiva, in parti dell'altezza dello schermo.
// Più è alto, più bisogna scorrere. Deve essere uguale a quello del CSS (60svh)
const PASSO = 0.6;

function leggiData(testo) {
  const [anno, mese, giorno] = testo.split("-");
  return { anno, mese: Number(mese), data: `${giorno}.${mese}.${anno}` };
}

const dueCifre = (numero) => String(numero).padStart(2, "0");

function Esperienza({ esperienza, posizione, totale }) {
  const { t } = useLingua();
  const inizio = leggiData(esperienza.inizio);
  const fine = leggiData(esperienza.fine);
  const stessoAnno = inizio.anno === fine.anno;

  return (
    <>
      <div className={styles.anni} aria-hidden="true">
        <p className={styles.annoGrande}>{fine.anno}</p>
        <p className={styles.annoPiccolo}>
          <span className={styles.lineetta} />
          {stessoAnno
            ? `${t(`timeline.mese${inizio.mese}`)} — ${t(`timeline.mese${fine.mese}`)}`
            : `${t(`timeline.mese${inizio.mese}`)} ${inizio.anno} — ${t(`timeline.mese${fine.mese}`)}`}
        </p>
        <p className={styles.contatore}>
          {dueCifre(posizione + 1)} <span>/ {dueCifre(totale)}</span>
        </p>
      </div>

      <div className={styles.dettagli}>
        <p className={styles.periodo}>
          <time dateTime={esperienza.inizio}>{inizio.data}</time>
          {" – "}
          <time dateTime={esperienza.fine}>{fine.data}</time>
        </p>
        <h3 className={styles.ruolo}>{esperienza.ruolo}</h3>
        <div className={styles.intestazione}>
          <h2 className={styles.azienda}>{esperienza.azienda}</h2>
          {esperienza.luogo && <p className={styles.luogo}>{esperienza.luogo}</p>}
        </div>
        <p className={styles.descrizione}>{esperienza.descrizione}</p>

        <ul className={styles.tecnologie}>
          {esperienza.tecnologie.map((tecnologia) => (
            <li key={tecnologia}>{tecnologia}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default function TimelineEsperienze({ esperienze }) {
  const { t } = useLingua();
  const [attiva, setAttiva] = useState(0);
  const sezione = useRef(null);
  const palco = useRef(null);
  const schede = useRef([]);
  // dove comincia nello scroll il tratto di ogni esperienza (serve anche al clic sui pallini)
  const tratti = useRef({ inizi: [], cima: 0 });
  const n = esperienze.length;

  useEffect(() => {
    const el = sezione.current;
    let fotogramma = 0;
    // le misure si leggono una volta (e quando cambia la finestra), non a ogni fotogramma:
    // leggere gli stili mentre scorri costringe il browser a ricalcolare e lo scroll perde fluidità
    let cima = 0;
    let altezzaPalco = 0;
    let eccedenze = [];
    let lunghezze = [];
    let inizi = [];
    let corsa = 0;
    let ultimaLarghezza = 0;
    let ultimaAltezza = 0;

    function misura() {
      ultimaLarghezza = window.innerWidth;
      ultimaAltezza = window.innerHeight;
      cima = parseFloat(getComputedStyle(palco.current).top) || 0;
      altezzaPalco = palco.current.clientHeight;
      const passo = window.innerHeight * PASSO;

      // quanto ogni esperienza è più alta dello spazio: quella parte si legge scorrendo
      eccedenze = schede.current.map((s) => Math.max(0, Math.ceil(s.scrollHeight - altezzaPalco)));
      // il tratto di ogni esperienza: il testo che sale, poi il passaggio alla successiva.
      // L'ultima ha mezzo passo: resta ferma un po' prima che la pagina riprenda a scorrere
      lunghezze = eccedenze.map((e, i) => e + (i < n - 1 ? passo : passo * 0.5));
      inizi = [];
      corsa = 0;
      for (const l of lunghezze) {
        inizi.push(corsa);
        corsa += l;
      }
      tratti.current = { inizi, cima };
      // la sezione è alta quanto serve: lo spazio fermo più tutta la corsa
      el.style.height = `${Math.ceil(altezzaPalco + corsa)}px`;
    }

    function aggiorna() {
      fotogramma = 0;
      const r = el.getBoundingClientRect();
      const fatto = Math.min(Math.max(cima - r.top, 0), corsa);

      let nuova = n - 1;
      for (let i = 0; i < n; i++) {
        if (fatto < inizi[i] + lunghezze[i]) {
          nuova = i;
          break;
        }
      }
      const dentro = fatto - inizi[nuova];

      // il testo di ogni esperienza lunga sale insieme allo scroll, 1 pixel per pixel
      schede.current.forEach((s, i) => {
        if (!eccedenze[i]) return;
        const su = i < nuova ? eccedenze[i] : i > nuova ? 0 : Math.min(dentro, eccedenze[i]);
        s.style.setProperty("--scorri", `${-su}px`);
      });

      // la linea si riempie fino al pallino attivo e poi avanza verso il successivo.
      // I pallini stanno a metà di ogni tratto (flex: 1)
      const parte = nuova < n - 1 && lunghezze[nuova] ? dentro / lunghezze[nuova] : 0;
      const riempi = (nuova + 0.5 + parte) / n;
      el.style.setProperty("--avanzamento", Math.min(Math.max(riempi, 0), 1).toFixed(4));
      setAttiva(nuova);
    }

    const pianifica = () => {
      if (!fotogramma) fotogramma = requestAnimationFrame(aggiorna);
    };
    const ridimensiona = () => {
      // sul telefono la barra dell'indirizzo che compare e sparisce cambia di poco l'altezza:
      // lì non si rimisura, altrimenti la pagina cambierebbe lunghezza mentre scorri
      const soloBarra =
        window.innerWidth === ultimaLarghezza && Math.abs(window.innerHeight - ultimaAltezza) < 160;
      if (!soloBarra) misura();
      pianifica();
    };

    misura();
    aggiorna();
    // i caratteri possono arrivare dopo e cambiare l'altezza dei testi: si rimisura
    document.fonts?.ready.then(() => {
      misura();
      pianifica();
    });
    window.addEventListener("scroll", pianifica, { passive: true });
    window.addEventListener("resize", ridimensiona);
    return () => {
      cancelAnimationFrame(fotogramma);
      window.removeEventListener("scroll", pianifica);
      window.removeEventListener("resize", ridimensiona);
      el.style.height = "";
    };
  }, [n]);

  // clic su un pallino: scorre fino all'inizio di quell'esperienza
  function vai(indice) {
    const comportamento = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    const { inizi, cima } = tratti.current;
    const inizioSezione = sezione.current.getBoundingClientRect().top + window.scrollY - cima;
    // +2: appena dentro il suo tratto, così diventa subito quella attiva
    window.scrollTo({ top: inizioSezione + (inizi[indice] ?? 0) + (indice ? 2 : 0), behavior: comportamento });
  }

  return (
    <section
      ref={sezione}
      className={styles.timeline}
      style={{ "--quante": n }}
      aria-label={t("timeline.elenco")}
    >
      <div ref={palco} className={styles.palco}>
        <ol className={styles.linea}>
          {esperienze.map((voce, posizione) => {
            const data = leggiData(voce.inizio);
            const etichetta = `${voce.azienda}, ${t(`timeline.mese${data.mese}`)} ${data.anno}`;
            return (
              <li key={voce.azienda + voce.inizio}>
                <button
                  type="button"
                  className={`${styles.punto} ${posizione === attiva ? styles.attivo : ""} ${posizione < attiva ? styles.passato : ""}`}
                  onClick={() => vai(posizione)}
                  aria-current={posizione === attiva ? "step" : undefined}
                  aria-label={etichetta}
                  title={etichetta}
                >
                  <span className={styles.pallino} />
                </button>
              </li>
            );
          })}
        </ol>

        <div className={styles.schede}>
          {esperienze.map((voce, posizione) => (
            <div
              key={voce.azienda + voce.inizio}
              ref={(nodo) => {
                schede.current[posizione] = nodo;
              }}
              className={styles.scheda}
              data-stato={posizione === attiva ? "attiva" : posizione < attiva ? "prima" : "dopo"}
            >
              <Esperienza esperienza={voce} posizione={posizione} totale={n} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
