
import { notFound } from "next/navigation";
import { lingua as linguaDellaPagina } from "next/root-params";
import { LINGUA_BASE, linguaValida } from "./config";
import { creaT, scegliLingua } from "./traduci";
import it from "./testi/it.json";
import en from "./testi/en.json";
import de from "./testi/de.json";
import es from "./testi/es.json";

const TESTI = { it, en, de, es };

export async function leggiLingua() {
  const richiesta = await linguaDellaPagina();
  const lingua = linguaValida(richiesta) ? richiesta : LINGUA_BASE;
  return {
    lingua,
    valida: lingua === richiesta,
    testi: TESTI[lingua],
    t: creaT(TESTI[lingua]),
    dati: (dato) => scegliLingua(dato, lingua),
  };
}


export async function leggiLinguaPagina() {
  const tutto = await leggiLingua();
  if (!tutto.valida) notFound();
  return tutto;
}
