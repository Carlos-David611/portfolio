"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoPrototipi({ src, poster }) {
  const videoRef = useRef(null);
  // diventa true quando il video si avvicina: solo allora si scaricano video e anteprima
  const [caricato, setCaricato] = useState(false);

  // 1) si scarica in anticipo, quando mancano ancora 800px alla sezione:
  //    così quando ci arrivi è già pronto e parte subito
  useEffect(() => {
    const video = videoRef.current;
    const osservatore = new IntersectionObserver(
      ([elemento]) => {
        if (elemento.isIntersecting) {
          setCaricato(true);
          osservatore.disconnect();
        }
      },
      { rootMargin: "800px 0px" }
    );
    osservatore.observe(video);
    return () => osservatore.disconnect();
  }, []);

  // 2) appena ha la sua sorgente parte e non si ferma più: gira in continuo, anche fuori schermo.
  //    Gira solo dopo che il video ha la sua sorgente: prima, play() fallirebbe
  //    (era il motivo per cui sul telefono non partiva)
  useEffect(() => {
    if (!caricato) return;
    const video = videoRef.current;
    // i telefoni fanno partire da soli solo i video senza audio:
    // muted va messo anche così, React da solo non sempre lo scrive sull'elemento
    video.muted = true;
    video.defaultMuted = true;

    const riparti = () => {
      // con la scheda nascosta il browser lo ferma per risparmiare: riparte quando torni
      if (!document.hidden) video.play().catch(() => {});
    };

    riparti();
    // se il browser lo mette in pausa da solo (es. per risparmiare batteria), riparte
    video.addEventListener("pause", riparti);
    document.addEventListener("visibilitychange", riparti);
    return () => {
      video.removeEventListener("pause", riparti);
      document.removeEventListener("visibilitychange", riparti);
    };
  }, [caricato]);

  return (
    <video
      ref={videoRef}
      className="prototipi-video"
      src={caricato ? src : undefined}
      poster={caricato ? poster : undefined}
      preload={caricato ? "auto" : "none"}
      muted
      loop
      playsInline
      disablePictureInPicture
      aria-label="Video dei prototipi su desktop, tablet e telefono"
    />
  );
}
