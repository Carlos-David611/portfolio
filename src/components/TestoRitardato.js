"use client";

import { useEffect, useRef } from "react";

// quanto aspetta il testo prima di seguire lo scroll, in millisecondi
const RITARDO = 180;
// quanto segue in fretta dopo l'attesa: più è alto (massimo 1), più è rapido
const VELOCITA = 0.12;
// quanti pixel può restare indietro al massimo, anche scrollando molto veloce
const DISTANZA_MASSIMA = 220;

export default function TestoRitardato({ className, children }) {
  const contenitore = useRef(null);
  const testo = useRef(null);

  useEffect(() => {
    // tenuti qui perché, cambiando pagina, i ref diventano null prima che
    // l'animazione venga fermata
    const box = contenitore.current;
    const elemento = testo.current;

    // sul telefono il badge sta sotto il testo; chi riduce i movimenti non vede l'effetto.
    // hover: hover = solo con il mouse: col dito (tablet) il testo resterebbe indietro
    // durante lo scroll veloce e finirebbe sopra le sezioni sotto
    const attivo = window.matchMedia(
      "(min-width: 769px) and (hover: hover) and (prefers-reduced-motion: no-preference)"
    );

    let posizione = window.scrollY;
    let inizioPagina = 0;
    let storia = [];
    let fotogramma = null;

    function ripristina() {
      elemento.style.cssText = "";
      box.style.height = "";
    }

    function disegna() {
      elemento.style.transform = `translate3d(0, ${inizioPagina - posizione}px, 0)`;
    }

    // Il testo è "fixed": non scorre con la pagina e si muove solo con disegna().
    // Così non deve inseguire lo scroll, che con il touchpad lo farebbe andare a scatti.
    // Il contenitore resta al suo posto e tiene occupato lo spazio del testo.
    function misura() {
      if (!attivo.matches) {
        ripristina();
        return;
      }
      const rettangolo = box.getBoundingClientRect();
      inizioPagina = rettangolo.top + window.scrollY;

      elemento.style.position = "fixed";
      elemento.style.top = "0";
      elemento.style.left = `${rettangolo.left}px`;
      elemento.style.width = `${rettangolo.width}px`;
      elemento.style.willChange = "transform";
      box.style.height = `${elemento.offsetHeight}px`;
      disegna();
    }

    function muovi(adesso) {
      const y = window.scrollY;
      storia.push({ tempo: adesso, y });
      while (storia.length > 1 && storia[1].tempo <= adesso - RITARDO) storia.shift();

      // il punto che il testo deve raggiungere è dove era la pagina poco fa
      const obiettivo = storia[0].tempo <= adesso - RITARDO ? storia[0].y : posizione;
      posizione += (obiettivo - posizione) * VELOCITA;

      const scarto = Math.max(-DISTANZA_MASSIMA, Math.min(DISTANZA_MASSIMA, y - posizione));
      posizione = y - scarto;

      if (Math.abs(scarto) < 0.5 && obiettivo === y) {
        posizione = y;
        storia = [];
        fotogramma = null;
        disegna();
        return;
      }
      disegna();
      fotogramma = requestAnimationFrame(muovi);
    }

    function alloScroll() {
      if (!attivo.matches) {
        posizione = window.scrollY;
        return;
      }
      if (fotogramma === null) fotogramma = requestAnimationFrame(muovi);
    }

    misura();

    const osservatore = new ResizeObserver(misura);
    osservatore.observe(box.parentElement);
    osservatore.observe(elemento);

    window.addEventListener("scroll", alloScroll, { passive: true });
    window.addEventListener("resize", misura);
    attivo.addEventListener("change", misura);

    return () => {
      window.removeEventListener("scroll", alloScroll);
      window.removeEventListener("resize", misura);
      attivo.removeEventListener("change", misura);
      osservatore.disconnect();
      if (fotogramma !== null) cancelAnimationFrame(fotogramma);
      ripristina();
    };
  }, []);

  return (
    <div ref={contenitore}>
      <div ref={testo} className={className}>
        {children}
      </div>
    </div>
  );
}
