// /robots.txt: i motori di ricerca possono leggere tutto, e qui trovano la sitemap
import { SITO } from "@/i18n/config";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITO}/sitemap.xml`,
  };
}
