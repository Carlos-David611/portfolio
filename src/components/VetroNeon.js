"use client";



import { useEffect } from "react";

// da quanti px di distanza il neon comincia ad accendersi
const RAGGIO = 140;

export default function VetroNeon() {
  useEffect(() => {
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)");
    // lista "viva": include anche le CTA che compaiono dopo
    const cta = document.getElementsByClassName("vetro-neon");
    let px = -1e4, py = -1e4, fotogramma = 0;

    function aggiorna() {
      fotogramma = 0;
      for (const el of cta) {
        const r = el.getBoundingClientRect();
        // fuori dallo schermo o nascosta: spenta
        if (r.width === 0 || r.bottom < -RAGGIO || r.top > innerHeight + RAGGIO) {
          if ("neon" in el.dataset) {
            el.style.setProperty("--vicino", "0");
            delete el.dataset.neon;
          }
          continue;
        }
        // distanza dal bordo del pulsante (0 se il cursore è sopra)
        const dx = Math.max(r.left - px, 0, px - r.right);
        const dy = Math.max(r.top - py, 0, py - r.bottom);
        const d = Math.hypot(dx, dy);
        const lineare = Math.max(0, 1 - d / RAGGIO);
        // curva: cresce piano da lontano e in fretta vicino
        const vicino = lineare * lineare;
        if (vicino === 0 && !("neon" in el.dataset)) continue;

        // dove sta il cursore sul pulsante, anche un po' fuori dai bordi
        const mx = Math.min(Math.max(((px - r.left) / r.width) * 100, -20), 120);
        const my = Math.min(Math.max(((py - r.top) / r.height) * 100, -20), 120);
        el.style.setProperty("--vicino", vicino.toFixed(3));
        el.style.setProperty("--mx", `${mx.toFixed(1)}%`);
        el.style.setProperty("--my", `${my.toFixed(1)}%`);
        if (vicino > 0) el.dataset.neon = "";
        else delete el.dataset.neon;
      }
    }
    const pianifica = () => {
      if (!fotogramma) fotogramma = requestAnimationFrame(aggiorna);
    };

    function muovi(e) {
      if (e.pointerType === "touch") return;
      px = e.clientX;
      py = e.clientY;
      pianifica();
    }
    // il mouse esce dalla finestra: si spegne tutto
    function esci(e) {
      if (!e.relatedTarget) {
        px = py = -1e4;
        pianifica();
      }
    }

    function collega() {
      scollega();
      if (!mouse.matches) return;
      window.addEventListener("pointermove", muovi, { passive: true });
      // scorrendo la pagina i pulsanti si spostano sotto il cursore fermo
      window.addEventListener("scroll", pianifica, { passive: true });
      document.addEventListener("pointerout", esci);
    }
    function scollega() {
      cancelAnimationFrame(fotogramma);
      fotogramma = 0;
      window.removeEventListener("pointermove", muovi);
      window.removeEventListener("scroll", pianifica);
      document.removeEventListener("pointerout", esci);
    }

    // ---------- telefono e tablet: il tocco solleva la CTA, poi apre la pagina ----------
    const dito = window.matchMedia("(hover: none)");
    const menoMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    // quanto resta sollevata prima di aprire la pagina: abbastanza per vederla, non per aspettare
    const SOLLEVA = 180;
    let timerSolleva = 0;

    function tocco(e) {
      if (!dito.matches || e.defaultPrevented || e.button !== 0) return;
      // la CTA toccata: il pulsante stesso, o quella dentro il link toccato (es. il cerchio dei contatti)
      const link = e.target.closest("a[href]");
      const el =
        e.target.closest(".vetro-neon:not(.vetro-neon-latente)") ??
        link?.querySelector(".vetro-neon:not(.vetro-neon-latente)");
      if (!el) return;

      el.dataset.sollevata = "";
      clearTimeout(timerSolleva);
      timerSolleva = setTimeout(() => delete el.dataset.sollevata, SOLLEVA + 300);

      // i pulsanti (es. le frecce delle Esperienze) fanno subito la loro azione: si sollevano e basta.
      // I link aspettano un attimo, così il sollevamento si vede prima di cambiare pagina
      // I link in una nuova scheda no: Safari su iPhone blocca le schede aperte dopo un'attesa,
      // lì la CTA si solleva mentre premi (:active) e la scheda si apre subito
      if (!link || menoMovimento.matches || link.target === "_blank") return;
      if ("rimandato" in link.dataset) {
        // è il clic rilanciato qui sotto: questa volta passa
        delete link.dataset.rimandato;
        return;
      }
      e.preventDefault();
      setTimeout(() => {
        link.dataset.rimandato = "";
        link.click();
      }, SOLLEVA);
    }
    // capture: arriva prima di qualunque altro gestore del clic
    document.addEventListener("click", tocco, true);

    collega();
    mouse.addEventListener("change", collega);
    return () => {
      mouse.removeEventListener("change", collega);
      document.removeEventListener("click", tocco, true);
      clearTimeout(timerSolleva);
      scollega();
    };
  }, []);

  return null;
}
