"use client";

import { useLingua } from "./lingua";

// <T>Testo in italiano</T>: lo mostra nella lingua scelta. Si usa anche nelle pagine server
export default function T({ children }) {
  const { t } = useLingua();
  return t(children);
}

// il nome di una competenza, con la copia nell'attributo che serve all'effetto al passaggio del mouse
export function TestoScorri({ children }) {
  const { t } = useLingua();
  const testo = t(children);
  return (
    <span className="scorri">
      <span className="scorri-interno" data-testo={testo}>
        {testo}
      </span>
    </span>
  );
}
