"use client";

import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import styles from "@/app/certificazioni/CaroselloCertificazioni.module.css";

// da "Betacom Academy" ricava "BA"
function iniziali(testo) {
  return testo
    .split(" ")
    .slice(0, 2)
    .map((parola) => parola[0])
    .join("")
    .toUpperCase();
}

function FoglioPdf({ pdf, titolo }) {
  const contenitore = useRef(null);
  const [stato, setStato] = useState("carica"); // "carica" | "pronto" | "errore"

  useEffect(() => {
    const dove = contenitore.current;
    let annullato = false;
    let caricamento = null;

    async function disegna() {
      try {
      
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        
        caricamento = pdfjs.getDocument({ url: pdf });
        const documento = await caricamento.promise;

        for (let numero = 1; numero <= documento.numPages; numero++) {
          const pagina = await documento.getPage(numero);
          if (annullato) return;

          // la grandezza che fa stare la pagina intera nel foglio
          const originale = pagina.getViewport({ scale: 1 });
          const adatta = Math.min(dove.clientWidth / originale.width, dove.clientHeight / originale.height);
          // più punti sugli schermi nitidi, altrimenti il testo sarebbe sgranato (max 2 per non pesare)
          const nitidezza = Math.min(window.devicePixelRatio || 1, 2);
          const vista = pagina.getViewport({ scale: adatta * nitidezza });

          const tela = document.createElement("canvas");
          tela.width = Math.floor(vista.width);
          tela.height = Math.floor(vista.height);
          tela.style.width = `${Math.floor(originale.width * adatta)}px`;
          tela.className = styles.pdf;
          tela.setAttribute("role", "img");
          tela.setAttribute("aria-label", `${titolo}, pagina ${numero} di ${documento.numPages}`);

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

    return () => {
      annullato = true;
      caricamento?.destroy();
      dove.replaceChildren();
    };
  }, [pdf, titolo]);

  return (
    <>
      <div ref={contenitore} className={styles.pagine} />

      {stato === "carica" && (
        <p className={styles.avviso} role="status">
          Caricamento del certificato…
        </p>
      )}

      {stato === "errore" && (
        <div className={styles.avviso} role="alert">
          <p>Non riesco a mostrare il certificato qui.</p>
          <a className={styles.apriFile} href={pdf} target="_blank" rel="noopener">
            Apri il PDF
          </a>
        </div>
      )}
    </>
  );
}

// quanto dura il volo della card, in millisecondi
const DURATA_APERTURA = 850;
const DURATA_CHIUSURA = 500;

// la posa del pannello in un punto del volo: spostato di (x, y), grande l × a, girato di gradi
function posa(x, y, l, a, girY, girX = 0) {
  return {
    width: `${l}px`,
    height: `${a}px`,
    transform: `translate(${x}px, ${y}px) perspective(1000px) rotateY(${girY}deg) rotateX(${girX}deg)`,
  };
}

// il volo: parte esattamente sopra la card (da), si stacca salendo e girandosi verso chi guarda,
// e arriva grande al centro (a). È la forma del pannello che cambia, non una foto ingrandita:
// così i testi restano nitidi per tutto il volo
function chiaviVolo(da, a) {
  const x = da.left + da.width / 2 - (a.left + a.width / 2);
  const y = da.top + da.height / 2 - (a.top + a.height / 2);
  return [
    { offset: 0, ...posa(x, y, da.width, da.height, -14) },
    { offset: 0.3, ...posa(x * 0.75, y * 0.75 - 40, da.width * 1.18, da.height * 1.18, 10, 8) },
    { offset: 1, ...posa(0, 0, a.width, a.height, 0) },
  ];
}

const movimentiRidotti = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function CaroselloCertificazioni({ certificazioni }) {
  // l'angolo tra una card e l'altra: con 6 certificazioni, 360 / 6 = 60°
  const passo = 360 / certificazioni.length;

  // la certificazione aperta nel visore (null = nessuna), con il colore della sua card
  const [aperta, setAperta] = useState(null);
  // diventa true a volo finito: il PDF si carica solo allora, così il volo resta fluido
  const [arrivata, setArrivata] = useState(false);
  const visore = useRef(null);
  const pannello = useRef(null);
  const fondo = useRef(null);
  const copertina = useRef(null);
  const cardCliccata = useRef(null);
  const apertaColMouse = useRef(false);
  const inVolo = useRef(false);
  const idTitolo = useId();
  const scena = useRef(null);
  const ruota = useRef(null);

  
  useEffect(() => {
    const elScena = scena.current;
    const elRuota = ruota.current;
    const giro = () => elRuota.getAnimations()[0]; 
    const DURATA = 40000; 
    const tappa = DURATA / certificazioni.length; 
    const MS_PER_PX = (DURATA / 360) * 0.45; 

    let partenzaX = 0;
    let ultimoX = 0;
    let ultimoTempo = 0;
    let velocita = 0; 
    let puntatore = null;
    let trascinato = false;
    let annullaClic = false;
    let ripartenza = 0;
    let aggancio = 0;

    // il punto del giro resta sempre positivo, così l'animazione non si confonde
    const normale = (t) => (((t % DURATA) + DURATA) % DURATA) + DURATA;

    function ferma() {
      clearTimeout(ripartenza);
      cancelAnimationFrame(aggancio);
      elRuota.dataset.fermo = "";
    }

    function riparti(tipo) {
      clearTimeout(ripartenza);
      const attesa = tipo === "mouse" ? 5000 : 2000;
      ripartenza = setTimeout(() => delete elRuota.dataset.fermo, attesa);
    }

    function aggancia() {
      const animazione = giro();
      const da = animazione.currentTime;
      const a = Math.round((da + velocita * 180) / tappa) * tappa;
      const inizio = performance.now();
      cancelAnimationFrame(aggancio);
      (function passo(ora) {
        const t = Math.min((ora - inizio) / 380, 1);
        const morbido = 1 - (1 - t) ** 3;
        animazione.currentTime = normale(da + (a - da) * morbido);
        if (t < 1) aggancio = requestAnimationFrame(passo);
      })(inizio);
    }

    function giu(evento) {
     
      if (evento.target.closest("dialog") || evento.button > 0 || !giro()) return;
      puntatore = evento.pointerId;
      partenzaX = ultimoX = evento.clientX;
      ultimoTempo = evento.timeStamp;
      velocita = 0;
      trascinato = false;
      annullaClic = false;
      if (evento.pointerType !== "mouse") ferma();
    }

    function muovi(evento) {
      if (evento.pointerId !== puntatore) return;

      if (!trascinato) {
        if (Math.abs(evento.clientX - partenzaX) < 8) return;
        trascinato = true;
        ferma();
        elScena.setPointerCapture(evento.pointerId);
        elScena.dataset.trascino = "";
      }
      const dx = evento.clientX - ultimoX;
      const dt = evento.timeStamp - ultimoTempo || 16;
      const animazione = giro();
      animazione.currentTime = normale(animazione.currentTime - dx * MS_PER_PX);
      velocita = (-dx * MS_PER_PX) / dt;
      ultimoX = evento.clientX;
      ultimoTempo = evento.timeStamp;
    }

    function su(evento) {
      if (evento.pointerId !== puntatore) return;
      puntatore = null;
      delete elScena.dataset.trascino;
      if (trascinato) {
        annullaClic = true;
        if (evento.pointerType !== "mouse" && elRuota.contains(document.activeElement)) {
          document.activeElement.blur();
        }
        aggancia();
        riparti(evento.pointerType);
      } else if (evento.pointerType !== "mouse") {
        riparti(evento.pointerType);
      }
    }

    function clic(evento) {
      if (!annullaClic) return;
      annullaClic = false;
      evento.stopPropagation();
      evento.preventDefault();
    }

    elScena.addEventListener("pointerdown", giu);
    elScena.addEventListener("pointermove", muovi);
    elScena.addEventListener("pointerup", su);
    elScena.addEventListener("pointercancel", su);
    // capture: il clic va fermato prima che arrivi alla card
    elScena.addEventListener("click", clic, true);
    return () => {
      clearTimeout(ripartenza);
      cancelAnimationFrame(aggancio);
      elScena.removeEventListener("pointerdown", giu);
      elScena.removeEventListener("pointermove", muovi);
      elScena.removeEventListener("pointerup", su);
      elScena.removeEventListener("pointercancel", su);
      elScena.removeEventListener("click", clic, true);
    };
  }, [certificazioni.length]);

  function apri(evento, cert, colore) {
    if (inVolo.current) return;
    const card = evento.currentTarget;
    cardCliccata.current = card;
    apertaColMouse.current = evento.detail > 0;
    const da = card.getBoundingClientRect();

    flushSync(() => {
      setAperta({ ...cert, colore });
      setArrivata(false);
    });
    visore.current.showModal();

    if (movimentiRidotti()) {
      setArrivata(true);
      return;
    }

    inVolo.current = true;
    const a = pannello.current.getBoundingClientRect();
    const opzioni = { duration: DURATA_APERTURA, easing: "cubic-bezier(0.3, 0.7, 0.3, 1)" };
    fondo.current.animate([{ opacity: 0 }, { opacity: 1 }], { ...opzioni, duration: DURATA_APERTURA * 0.6 });

    copertina.current.animate([{ opacity: 1 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }], opzioni);
    const volo = pannello.current.animate(chiaviVolo(da, a), opzioni);
    volo.onfinish = () => {
      inVolo.current = false;
      setArrivata(true);
    };
  }

  function chiudi() {
    if (!aperta || inVolo.current) return;

    function fine() {
      
      fondo.current.getAnimations().forEach((animazione) => animazione.cancel());
      flushSync(() => setAperta(null));
      visore.current.close();
      inVolo.current = false;
      if (apertaColMouse.current) cardCliccata.current?.blur();
    }

    if (movimentiRidotti()) {
      fine();
      return;
    }

    inVolo.current = true;
    const da = cardCliccata.current.getBoundingClientRect();
    const a = pannello.current.getBoundingClientRect();
    const opzioni = { duration: DURATA_CHIUSURA, easing: "cubic-bezier(0.5, 0, 0.7, 0.4)", fill: "forwards" };
    fondo.current.animate([{ opacity: 1 }, { opacity: 0 }], opzioni);
    copertina.current.animate([{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 1 }], opzioni);
    const ritorno = pannello.current.animate([...chiaviVolo(da, a)].reverse().map((chiave) => ({ ...chiave, offset: 1 - chiave.offset })), opzioni);
    ritorno.onfinish = fine;
  }

  return (
    <div ref={scena} className={styles.scena}>
      <div className={styles.ventaglio}>
        <ul ref={ruota} className={styles.ruota}>
          {certificazioni.map((cert, posizione) => {
            const anno = cert.data.slice(0, 4);
            const colore = posizione % 4;
            const volata = aperta?.pdf === cert.pdf;

            return (
              <li
                key={cert.pdf}
                className={`${styles.raggio} ${volata ? styles.volata : ""}`}
                style={{ "--angolo": `${posizione * passo}deg` }}
                data-colore={colore}
              >
                <button
                  type="button"
                  className={styles.card}
                  aria-label={`${cert.nome}, ${cert.ente}, ${anno}: apri il certificato`}
                  aria-haspopup="dialog"
                  onClick={(evento) => apri(evento, cert, colore)}
                >
                  <span className={styles.fronte}>
                    <Image className={styles.anteprima} src={cert.anteprima} alt="" fill sizes="280px" loading="eager" />
                    <span className={styles.anno}>{anno}</span>
                    <span className={styles.testi}>
                      <span className={styles.ente}>{cert.ente}</span>
                      <span className={styles.nome}>{cert.nome}</span>
                    </span>
                  </span>

                  
                  <span className={styles.retro} aria-hidden="true">
                    <Image className={styles.anteprima} src={cert.anteprima} alt="" fill sizes="280px" loading="eager" />
                    <span className={styles.retroIniziali}>{iniziali(cert.ente)}</span>
                    <span className={styles.retroAnno}>{anno}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* il visore del PDF. onCancel: Esc passa da chiudi(), che fa anche il volo di ritorno */}
      <dialog
        ref={visore}
        className={styles.visore}
        aria-labelledby={idTitolo}
        onCancel={(evento) => {
          evento.preventDefault();
          chiudi();
        }}
      >
        {/* il fondo scuro: toccandolo il visore si chiude */}
        <div ref={fondo} className={styles.fondo} onClick={chiudi} />

        {aperta && (
          <div ref={pannello} className={styles.pannello}>
            <header className={styles.pannelloTesta}>
              <div className={styles.pannelloTitoli}>
                <p className={styles.pannelloEnte}>{aperta.ente}</p>
                <h2 id={idTitolo} className={styles.pannelloNome}>
                  {aperta.nome}
                </h2>
              </div>
              <button type="button" className={styles.chiudi} onClick={chiudi} aria-label="Chiudi il certificato">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            {/* il foglio diventa bianco e carica il PDF solo all'arrivo */}
            <div className={`${styles.foglio} ${arrivata ? styles.foglioPronto : ""}`}>
              {/* key: cambiando certificato il foglio riparte da zero */}
              {arrivata && <FoglioPdf key={aperta.pdf} pdf={aperta.pdf} titolo={`Certificato: ${aperta.nome}`} />}
            </div>

            {/* la faccia della card: si vede durante il volo, poi sfuma e lascia il certificato */}
            <span ref={copertina} className={`${styles.fronte} ${styles.copertina}`} data-colore={aperta.colore} aria-hidden="true">
              <Image className={styles.anteprima} src={aperta.anteprima} alt="" fill sizes="600px" />
              <span className={styles.anno}>{aperta.data.slice(0, 4)}</span>
              <span className={styles.testi}>
                <span className={styles.ente}>{aperta.ente}</span>
                <span className={styles.nome}>{aperta.nome}</span>
              </span>
            </span>
          </div>
        )}
      </dialog>
    </div>
  );
}
