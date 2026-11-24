"use client";


import { createContext, useContext, useMemo } from "react";
import { creaT } from "./traduci";

const Contesto = createContext(null);

export function ProviderLingua({ lingua, testi, children }) {
  const valore = useMemo(() => ({ lingua, t: creaT(testi) }), [lingua, testi]);
  return <Contesto value={valore}>{children}</Contesto>;
}

export const useLingua = () => useContext(Contesto);
