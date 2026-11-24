// Le impostazioni delle lingue e del sito: si usano sia sul server sia nel browser.

// la prima è quella principale: il suo indirizzo non ha prefisso (/progetti), le altre sì (/en/progetti)
export const LINGUE = [
  { codice: "it", nome: "Italiano" },
  { codice: "en", nome: "English" },
  { codice: "de", nome: "Deutsch" },
  { codice: "es", nome: "Español" },
];

export const LINGUA_BASE = LINGUE[0].codice;

// le pagine del sito: "" è la home. Il nome è anche la chiave dei testi (menu.progetti, seo.progettiTitolo...)
export const PAGINE = ["", "progetti", "esperienze", "certificazioni", "contatti"];

// l'indirizzo pubblico del sito. Se un giorno compri un dominio, cambialo solo qui
export const SITO = "https://carlos-david-portfolio.vercel.app";

export const linguaValida = (codice) => LINGUE.some((l) => l.codice === codice);

// percorso("en", "progetti") → "/en/progetti"; percorso("it", "") → "/"
export function percorso(lingua, pagina = "") {
  const pezzi = [lingua === LINGUA_BASE ? "" : lingua, pagina].filter(Boolean);
  return "/" + pezzi.join("/");
}
