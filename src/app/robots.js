import { SITO } from "@/gestione-lingua/config";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITO}/sitemap.xml`,
  };
}
