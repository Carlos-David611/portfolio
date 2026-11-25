"use client";

  
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
