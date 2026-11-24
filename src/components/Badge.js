"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Sfondo from "@/components/Sfondo";
import styles from "./Badge.module.css";

export default function Badge({
  nome = "Carlos",
  cognome = "David",
  ruolo = "UX/UI Designer & Web Designer",
  luogo = "Italia",
  intestazione = "Portfolio 2026",
  colore = "#e5321c",
  foto = "/immagini/foto.jpg",
  descrizioneFoto = "",
  aspettaScroll = false,
}) {
  const [visibile, setVisibile] = useState(!aspettaScroll);

  useEffect(() => {
    if (!aspettaScroll) return;

    // modalità "aspetta lo scroll"
    function controllaScroll() {
      if (window.scrollY > 30) {
        setVisibile(true);
        window.removeEventListener("scroll", controllaScroll);
      }
    }

    controllaScroll();
    window.addEventListener("scroll", controllaScroll);
    return () => window.removeEventListener("scroll", controllaScroll);
  }, [aspettaScroll]);

  // diventa true quando il badge ha finito di oscillare: da lì si muove piano in continuo
  const [respira, setRespira] = useState(false);

  // lo sfondo animato dentro la card arriva solo quando il browser ha finito il lavoro importante:
  // così non rallenta la prima comparsa della pagina
  const [sfondoPronto, setSfondoPronto] = useState(false);
  useEffect(() => {
    const pronto = () => setSfondoPronto(true);
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(pronto, { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(pronto, 400);
    return () => clearTimeout(id);
  }, []);

  const iniziali = nome[0] + cognome[0];

  return (
    
    <div
      className={`${styles.lanyard} ${visibile ? styles.visibile : ""}`}
      style={{ "--colore-badge": colore }}
    >
      <div
        className={`${styles.pendolo} ${respira ? styles.respira : ""}`}
        // le animazioni degli elementi dentro arrivano fin qui: conta solo quella del pendolo
        onAnimationEnd={(e) => e.target === e.currentTarget && setRespira(true)}
      >
        <div className={styles.laccio}>
          <span>Portfolio</span>
        </div>
        <div className={styles.fibbia} />
        <div className={styles.laccioCorto} />
        <div className={styles.moschettone} />

        <div className={styles.giro}>
        <div className={styles.card}>
          <div className={styles.alto}>
            {/* lo sfondo animato della home anche dentro la card */}
            <div className={styles.fondoCard} aria-hidden="true">
              {sfondoPronto && <Sfondo />}
            </div>
            <div className={styles.testata}>
              <span className={styles.logo}>{iniziali}</span>
              <span className={styles.evento}>{intestazione}</span>
            </div>

            <div className={styles.foto}>
              <Image src={foto} alt={descrizioneFoto} fill sizes="260px" preload />
            </div>

            <p className={styles.nome}>
              {nome}
              <br />
              {cognome}
            </p>
          </div>

          <div className={styles.basso}>
            <p className={styles.ruolo}>{ruolo}</p>
            <p className={styles.luogo}>{luogo}</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}