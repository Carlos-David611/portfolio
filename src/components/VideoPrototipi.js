"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoPrototipi({ src, poster }) {
  const videoRef = useRef(null);
  const [caricato, setCaricato] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    const osservatore = new IntersectionObserver(
      ([elemento]) => {
        if (elemento.isIntersecting) {
          setCaricato(true);
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px" }
    );

    osservatore.observe(video);
    return () => osservatore.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className="prototipi-video"
      src={caricato ? src : undefined}
      // anche l'anteprima si scarica solo quando il video si avvicina allo schermo
      poster={caricato ? poster : undefined}
      muted
      loop
      playsInline
    />
  );
}