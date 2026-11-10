"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { annunciaRetro } from "@/components/retroBadge";
import styles from "./Badge.module.css";

export default function Badge({
  nome = "Carlos",
  cognome = "David",
  ruolo = "UX/UI Designer & Web Designer",
  luogo = "Italia",
  intestazione = "Portfolio 2026",
  colore = "#e5321c",
  foto = "/immagini/foto.jpg",
  aspettaScroll = false,
}) {
  // modalità normale: scende subito, senza aspettare che parta il JavaScript
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

  // avvisa la chat che il retro è pronto, e che non c'è più quando si cambia pagina
  const retro = useRef(null);
  useEffect(() => {
    annunciaRetro(retro.current);
    return () => annunciaRetro(null);
  }, []);

  const iniziali = nome[0] + cognome[0];

  return (
    // data-badge="...": servono alla chat (ChatBot.js e ChatBot.module.css) per agganciare il badge.
    // Le classi di un .module.css cambiano nome, questi attributi no
    <div
      className={`${styles.lanyard} ${visibile ? styles.visibile : ""}`}
      style={{ "--colore-badge": colore }}
      data-badge="lanyard"
    >
      <div className={styles.pendolo} data-badge="pendolo">
        <div className={styles.laccio}>
          <span>Portfolio</span>
        </div>
        <div className={styles.fibbia} />
        <div className={styles.laccioCorto} />
        <div className={styles.moschettone} />

        {/* è questo che si gira: davanti la card, dietro la chat (ce la mette ChatBot) */}
        <div className={styles.giro} data-badge="giro">
        <div className={styles.card} data-badge="card">
          <div className={styles.alto}>
            <div className={styles.testata}>
              <span className={styles.logo}>{iniziali}</span>
              <span className={styles.evento}>{intestazione}</span>
            </div>

            <div className={styles.foto}>
              <Image src={foto} alt={`Foto di ${nome} ${cognome}`} fill sizes="260px" preload />
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

        <div ref={retro} className={styles.retro} data-badge="retro" />
        </div>
      </div>
    </div>
  );
}