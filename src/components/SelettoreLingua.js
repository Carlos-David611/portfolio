"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { LINGUE, PAGINE, percorso } from "@/i18n/config";
import { useLingua } from "@/i18n/lingua";
import Bandiera from "./Bandiera";
import styles from "./SelettoreLingua.module.css";

export default function SelettoreLingua() {
  const { lingua, t } = useLingua();
  const [aperto, setAperto] = useState(false);
  const radice = useRef(null);
  const bottone = useRef(null);
  // la pagina in cui siamo ("progetti"...): le lingue portano alla stessa pagina tradotta
  const [segmento = ""] = useSelectedLayoutSegments();
  const pagina = PAGINE.includes(segmento) ? segmento : "";

  // si chiude toccando fuori o con Esc
  useEffect(() => {
    if (!aperto) return;
    const fuori = (e) => {
      if (!radice.current.contains(e.target)) setAperto(false);
    };
    const esc = (e) => {
      if (e.key !== "Escape") return;
      setAperto(false);
      bottone.current.focus();
    };
    document.addEventListener("pointerdown", fuori);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fuori);
      document.removeEventListener("keydown", esc);
    };
  }, [aperto]);

  // la scelta si ricorda: tornando sull'indirizzo italiano si apre questa lingua (script in layout.js)
  function ricorda(codice) {
    try {
      localStorage.setItem("lingua", codice);
    } catch {}
    setAperto(false);
  }

  return (
    <div
      ref={radice}
      className={styles.selettore}
      onBlur={(e) => {
        // uscendo con Tab dall'ultima lingua il menu si chiude
        if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) setAperto(false);
      }}
    >
      <button
        ref={bottone}
        type="button"
        className={styles.bottone}
        aria-label={`${t("lingua.cambia")}: ${LINGUE.find((l) => l.codice === lingua).nome}`}
        aria-expanded={aperto}
        aria-controls="elenco-lingue"
        onClick={() => setAperto(!aperto)}
      >
        {/* key: cambiando lingua la bandiera nuova entra con la sua animazione */}
        <Bandiera key={lingua} codice={lingua} className={`${styles.bandiera} ${styles.scelta}`} />
        <svg className={styles.freccia} viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </button>

      {/* sono link veri: anche Google li segue e trova le altre lingue */}
      <ul id="elenco-lingue" className={`${styles.elenco} ${aperto ? styles.aperto : ""}`}>
        {LINGUE.map((l) => (
          <li key={l.codice}>
            <Link
              href={percorso(l.codice, pagina)}
              hrefLang={l.codice}
              lang={l.codice}
              // si scarica solo se la scegli; e la pagina resta al punto in cui eri
              prefetch={false}
              scroll={false}
              className={styles.voce}
              aria-current={l.codice === lingua || undefined}
              onClick={() => ricorda(l.codice)}
            >
              <Bandiera codice={l.codice} className={styles.bandiera} />
              {l.nome}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
