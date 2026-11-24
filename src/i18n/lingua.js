"use client";

// La lingua del sito: italiano, inglese, tedesco o spagnolo.
// I testi nel codice restano in italiano: t("testo") cerca la traduzione nei file di traduzioni/.
// Se la traduzione manca, mostra l'italiano.

import { useCallback, useSyncExternalStore } from "react";

export const LINGUE = [
  { codice: "it", nome: "Italiano" },
  { codice: "en", nome: "English" },
  { codice: "de", nome: "Deutsch" },
  { codice: "es", nome: "Español" },
];

// ogni lingua si scarica solo quando serve: chi legge in italiano non scarica niente
const scarica = {
  en: () => import("./traduzioni/en"),
  de: () => import("./traduzioni/de"),
  es: () => import("./traduzioni/es"),
};
const dizionari = { it: {} };

const ascoltatori = new Set();
let corrente = "it";
let richiesta = null; // l'ultima lingua chiesta: se ne scegli due di fila vale la seconda

const leggi = () => corrente;

function ascolta(avvisa) {
  ascoltatori.add(avvisa);
  return () => ascoltatori.delete(avvisa);
}

export async function cambiaLingua(codice) {
  richiesta = codice;
  if (!dizionari[codice]) {
    try {
      dizionari[codice] = (await scarica[codice]()).default;
    } catch {
      // rete assente: resta la lingua di prima, e i testi non restano nascosti
      delete document.documentElement.dataset.linguaAttesa;
      return;
    }
  }
  if (richiesta !== codice) return;
  corrente = codice;
  try {
    localStorage.setItem("lingua", codice);
  } catch {}
  ascoltatori.forEach((avvisa) => avvisa());
}

// all'apertura del sito: la lingua scelta l'ultima volta
if (typeof window !== "undefined") {
  try {
    const salvata = localStorage.getItem("lingua");
    if (scarica[salvata]) cambiaLingua(salvata);
  } catch {}
}

// t("Certificato {n} di {tot}", { n: 1, tot: 5 }): i nomi tra graffe vengono sostituiti
function traduci(lingua, testo, valori) {
  const chiave = testo.replace(/\s+/g, " ").trim();
  const risultato = dizionari[lingua]?.[chiave] || chiave;
  return valori ? risultato.replace(/\{(\w+)\}/g, (tutto, nome) => valori[nome] ?? tutto) : risultato;
}

export function useLingua() {
  // sul server e al primo disegno è sempre italiano, così l'HTML coincide
  const lingua = useSyncExternalStore(ascolta, leggi, () => "it");
  const t = useCallback((testo, valori) => traduci(lingua, testo, valori), [lingua]);
  return { lingua, t };
}
