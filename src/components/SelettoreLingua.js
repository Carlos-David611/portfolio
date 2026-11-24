"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LINGUE, cambiaLingua, useLingua } from "@/i18n/lingua";
import Bandiera from "./Bandiera";
import styles from "./SelettoreLingua.module.css";

// il titolo della scheda del browser, pagina per pagina
const TITOLI = {
  "/progetti": "Progetti",
  "/esperienze": "Esperienze",
  "/certificazioni": "Certificazioni",
  "/contatti": "Contatti",
};

export default function SelettoreLingua() {
  const { lingua, t } = useLingua();
  const [aperto, setAperto] = useState(false);
  const radice = useRef(null);
  const bottone = useRef(null);
  const pathname = usePathname();

  // i testi erano nascosti in attesa della lingua salvata (script in layout.js): ora si mostrano
  useLayoutEffect(() => {
    let salvata = null;
    try {
      salvata = localStorage.getItem("lingua");
    } catch {}
    // al primo disegno lingua è ancora "it": si aspetta quella salvata
    if (salvata && salvata !== lingua && LINGUE.some((l) => l.codice === salvata)) return;
    document.documentElement.lang = lingua;
    delete document.documentElement.dataset.linguaAttesa;
  }, [lingua]);

  // il titolo della scheda: Next lo riscrive in italiano a ogni pagina, qui si rimette quello tradotto
  useEffect(() => {
    const titolo = TITOLI[pathname];
    if (!titolo) return;
    const voluto = `${t(titolo)} | Carlos David`;
    const applica = () => {
      if (document.title !== voluto) document.title = voluto;
    };
    applica();
    const osservatore = new MutationObserver(applica);
    osservatore.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => osservatore.disconnect();
  }, [pathname, t]);

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
        aria-label={`${t("Cambia lingua")}: ${LINGUE.find((l) => l.codice === lingua).nome}`}
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

      <ul id="elenco-lingue" className={`${styles.elenco} ${aperto ? styles.aperto : ""}`}>
        {LINGUE.map((l) => (
          <li key={l.codice}>
            <button
              type="button"
              lang={l.codice}
              className={styles.voce}
              aria-current={l.codice === lingua || undefined}
              onClick={() => {
                cambiaLingua(l.codice);
                setAperto(false);
                bottone.current.focus();
              }}
            >
              <Bandiera codice={l.codice} className={styles.bandiera} />
              {l.nome}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
