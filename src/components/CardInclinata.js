"use client";

import { useEffect, useRef } from "react";

// di quanti gradi si inclina al massimo la card verso il cursore
const GRADI = 6;

// Il posto della card: resta fermo e legge il cursore, la card dentro si inclina (variabili --rx, --ry).
// Il cursore si legge qui e non sulla card, altrimenti inclinandosi gli sfuggirebbe e tremerebbe
export default function CardInclinata({ className, children }) {
  const posto = useRef(null);

  useEffect(() => {
    const el = posto.current;
    const attivo = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let fotogramma = 0;
    let x = 0.5;
    let y = 0.5;

    function disegna() {
      fotogramma = 0;
      el.style.setProperty("--rx", `${((0.5 - y) * 2 * GRADI).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((x - 0.5) * 2 * GRADI).toFixed(2)}deg`);
      el.style.setProperty("--luce-x", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--luce-y", `${(y * 100).toFixed(1)}%`);
    }

    function muovi(e) {
      if (!attivo.matches || e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
      y = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
      if (!fotogramma) fotogramma = requestAnimationFrame(disegna);
    }

    function esci() {
      cancelAnimationFrame(fotogramma);
      fotogramma = 0;
      // senza le variabili la card torna alla posa di riposo (nel CSS)
      ["--rx", "--ry", "--luce-x", "--luce-y"].forEach((v) => el.style.removeProperty(v));
    }

    el.addEventListener("pointermove", muovi, { passive: true });
    el.addEventListener("pointerleave", esci);
    return () => {
      cancelAnimationFrame(fotogramma);
      el.removeEventListener("pointermove", muovi);
      el.removeEventListener("pointerleave", esci);
    };
  }, []);

  return (
    <div ref={posto} className={className}>
      {children}
    </div>
  );
}
