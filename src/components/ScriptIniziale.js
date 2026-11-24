"use client";

// Uno script che parte prima che la pagina si veda. Serve solo al primo caricamento:
// il server lo manda come script vero. Quando il layout si ricrea nel browser (cambiando lingua)
// è solo testo, così React non avvisa che lì non verrebbe eseguito.
export default function ScriptIniziale({ codice }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      // il tipo è diverso tra server e browser di proposito
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: codice }}
    />
  );
}
