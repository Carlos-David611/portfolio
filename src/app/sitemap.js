// /sitemap.xml: l'elenco di tutte le pagine in tutte le lingue, per i motori di ricerca
import { LINGUE, PAGINE, SITO, percorso } from "@/i18n/config";

export default function sitemap() {
  return PAGINE.flatMap((pagina) =>
    LINGUE.map((l) => ({
      url: SITO + percorso(l.codice, pagina),
      alternates: {
        languages: Object.fromEntries(LINGUE.map((a) => [a.codice, SITO + percorso(a.codice, pagina)])),
      },
    }))
  );
}
