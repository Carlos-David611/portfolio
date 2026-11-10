"use client";

import { useEffect, useState } from "react";

export default function BottoneTema() {
  // il tema di partenza è la notte, perché il sito nasce scuro
  const [tema, setTema] = useState("notte");
  // sul telefono il bottone si nasconde scrollando verso il basso (vedi .tema-nascosto nel CSS)
  const [nascosto, setNascosto] = useState(false);

  useEffect(() => {
    // quanti pixel di scroll servono per reagire: così i piccoli tremolii del dito non contano
    const SOGLIA = 8;
    let ultimo = window.scrollY;
    let altezzaPagina = document.documentElement.scrollHeight;

    function controllaScroll() {
      const y = window.scrollY;
      const altezza = document.documentElement.scrollHeight;

      // in cima alla pagina il bottone si vede sempre
      if (y <= 10) {
        setNascosto(false);
        ultimo = y;
      } else if (altezza !== altezzaPagina) {
        // la pagina si è allungata o accorciata (es. cambiando esperienza nella timeline):
        // lo scroll l'ha spostato il browser, non la persona, quindi il bottone non cambia
        ultimo = y;
      } else if (Math.abs(y - ultimo) > SOGLIA) {
        setNascosto(y > ultimo);
        ultimo = y;
      }

      altezzaPagina = altezza;
    }

    window.addEventListener("scroll", controllaScroll, { passive: true });
    return () => window.removeEventListener("scroll", controllaScroll);
  }, []);

  // all'avvio: se c'è un tema salvato nel browser, lo riprende
  // (useEffect gira solo nel browser: sul server localStorage non esiste)
  useEffect(() => {
    let salvato = null;
    try {
      salvato = localStorage.getItem("tema");
    } catch {}

    if (salvato === "giorno") {
      setTema("giorno");
      document.documentElement.dataset.tema = "giorno";
    }
  }, []);

  function cambiaTema() {
    const nuovo = tema === "notte" ? "giorno" : "notte";
    setTema(nuovo);

    // mette l'etichetta su <html>: <html data-tema="giorno">
    const applica = () => {
      document.documentElement.dataset.tema = nuovo;
    };

    // dissolvenza tra i due temi: senza, tutto lo schermo cambia in un colpo e sembra sfarfallare.
    // Chi ha chiesto meno animazioni, o ha un browser senza questa funzione, cambia subito
    const menoMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !menoMovimento) {
      document.startViewTransition(applica);
    } else {
      applica();
    }

    // try/catch: in alcune finestre private il localStorage è bloccato
    try {
      localStorage.setItem("tema", nuovo);
    } catch {}
  }

  const giorno = tema === "giorno";

  return (
    <button
      type="button"
      className={`tema-bottone ${nascosto ? "tema-nascosto" : ""}`}
      onClick={cambiaTema}
      // role="switch" dice agli screen reader che è un interruttore acceso/spento
      role="switch"
      aria-checked={giorno}
      aria-label={giorno ? "Passa al tema notte" : "Passa al tema giorno"}
    >
      <span className="tema-pallino" aria-hidden="true">
        {/* la luna */}
        <svg className="icona-luna" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
        {/* il sole */}
        <svg
          className="icona-sole"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </span>
    </button>
  );
}