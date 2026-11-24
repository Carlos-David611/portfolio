"use client";

// Il visore dei certificati: una finestra sopra la pagina con il PDF disegnato da pdf.js.
// Lo usa la galleria delle certificazioni. Il lettore e i documenti si preparano in anticipo
// (preparaPdf), così all'apertura il PDF è già pronto o quasi.

import { useEffect, useId, useRef, useState } from "react";
import { useLingua } from "@/i18n/lingua";
import styles from "./VisorePdf.module.css";

// ---------- PDF pronti in anticipo ----------
let lettore = null;
export function caricaLettore() {
  if (!lettore) {
    lettore = import("pdfjs-dist/legacy/build/pdf.mjs").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      return pdfjs;
    });
    // se fallisce (es. rete assente), la prossima volta si riprova
    lettore.catch(() => (lettore = null));
  }
  return lettore;
}

const documenti = new Map();
export function preparaPdf(url) {
  if (!documenti.has(url)) {
    const promessa = caricaLettore().then((pdfjs) => pdfjs.getDocument({ url }).promise);
    promessa.catch(() => documenti.delete(url));
    documenti.set(url, promessa);
  }
  return documenti.get(url);
}

// ---------- il foglio con le pagine del PDF ----------
function FoglioPdf({ pdf, titolo }) {
  const { t } = useLingua();
  const contenitore = useRef(null);
  const [stato, setStato] = useState("carica"); // "carica" | "pronto" | "errore"

  useEffect(() => {
    const dove = contenitore.current;
    let annullato = false;

    async function disegna() {
      try {
        const documento = await preparaPdf(pdf);
        for (let numero = 1; numero <= documento.numPages; numero++) {
          const pagina = await documento.getPage(numero);
          if (annullato) return;
          // la grandezza che fa stare la pagina intera nel foglio
          const originale = pagina.getViewport({ scale: 1 });
          const adatta = Math.min(dove.clientWidth / originale.width, dove.clientHeight / originale.height);
          // più punti sugli schermi nitidi (max 2 per non pesare)
          const nitidezza = Math.min(window.devicePixelRatio || 1, 2);
          const vista = pagina.getViewport({ scale: adatta * nitidezza });

          const tela = document.createElement("canvas");
          tela.width = Math.floor(vista.width);
          tela.height = Math.floor(vista.height);
          tela.style.width = `${Math.floor(originale.width * adatta)}px`;
          tela.className = styles.pdf;
          tela.setAttribute("role", "img");
          tela.setAttribute("aria-label", t("visore.pagina", { titolo, n: numero, tot: documento.numPages }));

          await pagina.render({ canvas: tela, viewport: vista }).promise;
          if (annullato) return;
          dove.append(tela);
        }
        setStato("pronto");
      } catch (errore) {
        if (annullato) return;
        console.error("Certificato non disegnato:", errore);
        setStato("errore");
      }
    }

    disegna();
    // il documento resta in memoria (sono pochi e piccoli): riaprendolo è subito pronto
    return () => {
      annullato = true;
      dove.replaceChildren();
    };
  }, [pdf, titolo, t]);

  return (
    <>
      <div ref={contenitore} className={styles.pagine} />
      {stato === "carica" && (
        <p className={styles.avviso} role="status">
          {t("visore.caricamento")}
        </p>
      )}
      {stato === "errore" && (
        <div className={styles.avviso} role="alert">
          <p>{t("visore.errore")}</p>
          <a className={`${styles.apriFile} vetro-neon`} href={pdf} target="_blank" rel="noopener">
            {t("visore.apriPdf")}
          </a>
        </div>
      )}
    </>
  );
}

// ---------- la finestra ----------
// cert: il certificato da mostrare (null = chiuso). alChiudere: lo chiama quando la finestra si chiude
export default function VisorePdf({ cert, alChiudere }) {
  const { t } = useLingua();
  const visore = useRef(null);
  const idTitolo = useId();
  const [chiusura, setChiusura] = useState(false);

  // si apre quando arriva un certificato
  useEffect(() => {
    if (cert && !visore.current.open) {
      setChiusura(false);
      visore.current.showModal();
    }
  }, [cert]);

  function chiudi() {
    const menoMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (menoMovimento) {
      visore.current.close();
      alChiudere();
      return;
    }
    // breve dissolvenza in uscita, poi si chiude davvero
    setChiusura(true);
    setTimeout(() => {
      visore.current?.close();
      setChiusura(false);
      alChiudere();
    }, 220);
  }

  return (
    <dialog
      ref={visore}
      className={`${styles.visore} ${chiusura ? styles.inChiusura : ""}`}
      aria-labelledby={idTitolo}
      onCancel={(evento) => {
        evento.preventDefault();
        chiudi();
      }}
    >
      {/* il fondo scuro: toccandolo il visore si chiude */}
      <div className={styles.fondo} onClick={chiudi} />

      {cert && (
        <div className={styles.pannello}>
          <header className={styles.pannelloTesta}>
            <div className={styles.pannelloTitoli}>
              <p className={styles.pannelloEnte}>{cert.ente}</p>
              <h2 id={idTitolo} className={styles.pannelloNome}>
                {cert.nome}
              </h2>
            </div>
            <button type="button" className={styles.chiudi} onClick={chiudi} aria-label={t("visore.chiudi")}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div className={styles.foglio}>
            {/* key: cambiando certificato il foglio riparte da zero */}
            <FoglioPdf key={cert.pdf} pdf={cert.pdf} titolo={t("visore.titolo", { nome: cert.nome })} />
          </div>
        </div>
      )}
    </dialog>
  );
}
