"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoPrototipi({ src, poster, descrizione }) {
  const videoRef = useRef(null);
  const [caricato, setCaricato] = useState(false);

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

  useEffect(() => {
    if (!caricato) return;
    const video = videoRef.current;
    // i telefoni fanno partire da soli solo i video senza audio:
    // muted va messo anche così, React da solo non sempre lo scrive sull'elemento
    video.muted = true;
    video.defaultMuted = true;

    // gira sempre quando si vede; lontano dallo schermo si ferma, perché decodificarlo
    // rallenta lo scorrimento di tutta la pagina. Riparte 300px prima di comparire
    let vicino = true;
    const riparti = () => {
      if (vicino && !document.hidden) video.play().catch(() => {});
    };
    const osservatore = new IntersectionObserver(
      ([elemento]) => {
        vicino = elemento.isIntersecting;
        if (vicino) riparti();
        else video.pause();
      },
      { rootMargin: "300px 0px" }
    );
    osservatore.observe(video);

    riparti();
    video.addEventListener("pause", riparti);
    document.addEventListener("visibilitychange", riparti);
    return () => {
      osservatore.disconnect();
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
      aria-label={descrizione}
    />
  );
}
