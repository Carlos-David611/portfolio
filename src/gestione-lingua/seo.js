import { LINGUA_BASE, LINGUE, PAGINE, SITO, percorso } from "./config";
import { leggiLingua } from "./server";

// gli indirizzi della stessa pagina nelle altre lingue (hreflang):
// così Google mostra a ognuno la versione nella sua lingua
export function alternative(pagina) {
  const voci = LINGUE.map((l) => [l.codice, SITO + percorso(l.codice, pagina)]);
  return Object.fromEntries([...voci, ["x-default", SITO + percorso(LINGUA_BASE, pagina)]]);
}

const LOCALE = { it: "it_IT", en: "en_US", de: "de_DE", es: "es_ES" };

// i metadati di una pagina: titolo, descrizione, indirizzo ufficiale, lingue e anteprima social.
// In una pagina: export const generateMetadata = () => metadati("progetti");
export async function metadati(pagina) {
  const { lingua, valida, t } = await leggiLingua();
  if (!valida || !PAGINE.includes(pagina)) return {};

  const nome = pagina || "home";
  const titoloPagina = t(`seo.${nome}Titolo`);
  const titolo = pagina ? `${titoloPagina} | Carlos David` : titoloPagina;
  const descrizione = t(`seo.${nome}Descrizione`);
  const indirizzo = SITO + percorso(lingua, pagina);

  return {
    title: titolo,
    description: descrizione,
    alternates: { canonical: indirizzo, languages: alternative(pagina) },
    openGraph: {
      type: "website",
      siteName: "Carlos David · Portfolio",
      title: titolo,
      description: descrizione,
      url: indirizzo,
      locale: LOCALE[lingua],
      alternateLocale: LINGUE.filter((l) => l.codice !== lingua).map((l) => LOCALE[l.codice]),
      images: [{ url: `${SITO}/immagini/anteprima-social.jpg`, width: 1200, height: 630, alt: "Carlos David, UX/UI Designer & Web Designer" }],
    },
    twitter: { card: "summary_large_image" },
  };
}
