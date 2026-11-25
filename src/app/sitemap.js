import { LINGUE, PAGINE, SITO, percorso } from "@/gestione-lingua/config";

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
