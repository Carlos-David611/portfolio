"use client";

import { useEffect, useRef, useState } from "react";
import { useLingua } from "@/gestione-lingua/lingua";
import styles from "./CursoreOcchi.module.css";

// ---------- le regolazioni ----------
const OCCHIO = 0.42; // occhio = 0.42 × altezza
const PUPILLA = 0.42; // pupilla = 0.42 × occhio
const CORSA_PUPILLA = 0.75; // quanto la pupilla può spostarsi verso il bordo dell'occhio (1 = fino al bordo)
const GUADAGNO_SGUARDO = 26; // a quanti px di distanza la pupilla arriva in fondo alla corsa
const SCIA = 0.08; // quanto in fretta la pillola raggiunge il puntatore a ogni fotogramma
const BATTITO_OGNI = 3000; // ogni quanto sbatte le palpebre, in ms
const BATTITO_DURATA = 170; // quanto dura il battito, in ms
const CASUALITA = 0.3; // ±30% sull'intervallo, così non sembra un metronomo
const GUARDA_DOVE_VA = true; // gli occhi guardano anche la direzione del movimento
const INTERATTIVI = "a, button, input";
const RESTA_DOPO_TOCCO = 1200; // col dito: quanti ms resta visibile dopo che lo hai sollevato
const MARGINE = 8; // distanza minima dai bordi dello schermo

// mouse e dito: la vedono tutti, tranne chi ha chiesto al sistema meno movimento
const MENO_MOVIMENTO = "(prefers-reduced-motion: reduce)";

export default function CursoreOcchi() {
  const [attivo, setAttivo] = useState(false);

  useEffect(() => {
    const meno = window.matchMedia(MENO_MOVIMENTO);
    const controlla = () => setAttivo(!meno.matches);
    controlla();
    meno.addEventListener("change", controlla);
    return () => meno.removeEventListener("change", controlla);
  }, []);

  return attivo ? <Pillola /> : null;
}

function Pillola() {
  const { t } = useLingua();
  const pillola = useRef(null);
  const occhi = useRef([]);
  const pupille = useRef([]);

  useEffect(() => {
    const el = pillola.current;

    let h = 36, w = 128, centroOcchiX = 0, corsa = 0;
    function misura() {
      const stile = getComputedStyle(el);
      h = parseFloat(stile.getPropertyValue("--h")) || 36;
      w = el.offsetWidth || h * 3.556;
      const occhio = h * OCCHIO;
      const pupilla = occhio * PUPILLA;
      centroOcchiX = h * 0.33 + occhio + 0.5;
      corsa = ((occhio - pupilla) / 2) * CORSA_PUPILLA;
    }
    misura();

    let px = -100, py = -100, x = -100, y = -100, vx = 0, vy = 0;
    let modo = "mouse";
    let visto = false;
    let sopraInterattivo = false;
    let fotogramma = 0;

    function bersaglio() {
      let mx, my;
      if (modo === "mouse") {
        mx = px + h * 0.5;
        my = py + h * 0.6;
      } else {
        mx = px - w / 2;
        my = py - h * 2.4;
        if (my < MARGINE) my = py + h * 1.4;
      }
      mx = Math.min(Math.max(mx, MARGINE), innerWidth - w - MARGINE);
      my = Math.min(Math.max(my, MARGINE), innerHeight - h - MARGINE);
      return [mx, my];
    }

    function passo() {
      const [mx, my] = bersaglio();
      x += (mx - x) * SCIA;
      y += (my - y) * SCIA;
      vx *= 0.85;
      vy *= 0.85;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;

      let gx = px - (x + centroOcchiX);
      let gy = py - (y + h / 2);
      if (GUARDA_DOVE_VA) {
        gx += vx * 6;
        gy += vy * 6;
      }
      const d = Math.hypot(gx, gy);
      const k = d > 0 ? Math.min(d / GUADAGNO_SGUARDO, 1) / d : 0;
      const ox = (gx * k * corsa).toFixed(2);
      const oy = (gy * k * corsa).toFixed(2);
      // filter: cambiando lingua la pillola si ricrea, e per un istante questi elementi non ci sono
      for (const p of pupille.current.filter(Boolean)) p.style.transform = `translate(${ox}px, ${oy}px)`;

      const fermo = Math.abs(mx - x) < 0.1 && Math.abs(my - y) < 0.1 && Math.abs(vx) + Math.abs(vy) < 0.05;
      fotogramma = fermo ? 0 : requestAnimationFrame(passo);
    }
    const avvia = () => {
      if (!fotogramma) fotogramma = requestAnimationFrame(passo);
    };

    function segui(cx, cy, target, nuovoModo) {
      vx = cx - px;
      vy = cy - py;
      px = cx;
      py = cy;
      if (!visto || nuovoModo !== modo) {
        modo = nuovoModo;
        visto = true;
        [x, y] = bersaglio();
        vx = vy = 0;
      }
      el.dataset.visibile = "";
      const sopra = !!target?.closest?.(INTERATTIVI);
      if (sopra !== sopraInterattivo) {
        sopraInterattivo = sopra;
        if (sopra) el.dataset.interattivo = "";
        else delete el.dataset.interattivo;
      }
      avvia();
    }

    // mouse e penna. Il dito no: lo seguono gli eventi touch, che continuano anche mentre la pagina scorre
    function muovi(e) {
      if (e.pointerType === "touch") return;
      segui(e.clientX, e.clientY, e.target, "mouse");
    }
    function esci(e) {
      if (modo === "mouse" && !e.relatedTarget) {
        delete el.dataset.visibile;
        visto = false;
      }
    }

    let timerNascondi = 0;
    function tocca(e) {
      const t = e.touches[0];
      if (!t) return;
      clearTimeout(timerNascondi);
      segui(t.clientX, t.clientY, e.target, "dito");
    }
    function lascia(e) {
      if (e.touches.length) return;
      clearTimeout(timerNascondi);
      timerNascondi = setTimeout(() => {
        delete el.dataset.visibile;
        delete el.dataset.interattivo;
        sopraInterattivo = false;
        visto = false;
      }, RESTA_DOPO_TOCCO);
    }

    let timerBattito = 0, timerApri = 0;
    function prossimoBattito() {
      const attesa = BATTITO_OGNI * (1 + (Math.random() * 2 - 1) * CASUALITA);
      timerBattito = setTimeout(() => {
        for (const o of occhi.current.filter(Boolean)) o.dataset.chiuso = "";
        timerApri = setTimeout(() => {
          for (const o of occhi.current.filter(Boolean)) delete o.dataset.chiuso;
          prossimoBattito();
        }, BATTITO_DURATA / 2);
      }, attesa);
    }
    prossimoBattito();

    window.addEventListener("pointermove", muovi, { passive: true });
    document.addEventListener("pointerout", esci);
    window.addEventListener("touchstart", tocca, { passive: true });
    window.addEventListener("touchmove", tocca, { passive: true });
    window.addEventListener("touchend", lascia, { passive: true });
    window.addEventListener("touchcancel", lascia, { passive: true });
    window.addEventListener("resize", misura);
    return () => {
      cancelAnimationFrame(fotogramma);
      clearTimeout(timerBattito);
      clearTimeout(timerApri);
      clearTimeout(timerNascondi);
      window.removeEventListener("pointermove", muovi);
      document.removeEventListener("pointerout", esci);
      window.removeEventListener("touchstart", tocca);
      window.removeEventListener("touchmove", tocca);
      window.removeEventListener("touchend", lascia);
      window.removeEventListener("touchcancel", lascia);
      window.removeEventListener("resize", misura);
    };
  }, []);

  return (
    <div
      ref={pillola}
      className={styles.pillola}
      aria-hidden="true"
      style={{
        "--occhio": OCCHIO,
        "--pupilla": PUPILLA,
        "--battito": `${BATTITO_DURATA}ms`,
      }}
    >
      <span className={styles.occhi}>
        {[0, 1].map((i) => (
          <span key={i} ref={(n) => { occhi.current[i] = n; }} className={styles.occhio}>
            <span ref={(n) => { pupille.current[i] = n; }} className={styles.pupilla} />
          </span>
        ))}
      </span>
      <span className={styles.etichetta}>{t("cursore.etichetta")}</span>
    </div>
  );
}
