import Navbar from "@/components/Navbar";
import Sfondo from "@/components/Sfondo";
import "../globals.css";
import "../vetro-neon.css";
import Footer from "@/components/Footer";
import CursoreOcchi from "@/components/CursoreOcchi";
import VetroNeon from "@/components/VetroNeon";
import { LINGUA_BASE, LINGUE, SITO } from "@/i18n/config";
import { ProviderLingua } from "@/i18n/lingua";
import { leggiLingua } from "@/i18n/server";
import { contatti } from "@/data/contatti";

export const metadata = {
  metadataBase: new URL(SITO),
  // il sito non ha un'iconcina: "data:," dice al browser che è vuota, così non la cerca
  // (senza questa riga chiede /favicon.ico a ogni pagina e riceve un errore 404)
  icons: { icon: "data:," },
};

// le lingue preparate in anticipo: ogni pagina è già pronta in tutte
export const generateStaticParams = () => LINGUE.map((l) => ({ lingua: l.codice }));

// le sezioni dei testi che servono ai componenti interattivi: le altre restano sul server
const SEZIONI_BROWSER = ["menu", "tema", "lingua", "timeline", "galleria", "visore"];

// chi sei, in un formato che Google capisce (dati strutturati schema.org)
const persona = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Carlos David Esposito",
  alternateName: "Carlos David",
  jobTitle: "UX/UI Designer & Web Designer",
  url: SITO,
  image: `${SITO}/immagini/foto.jpg`,
  sameAs: contatti.filter((c) => c.tipo !== "email").map((c) => c.link),
};

// rimette il tema salvato prima che la pagina si veda: niente lampo scuro di giorno
const SCRIPT_TEMA = `try{var t=localStorage.getItem("tema");if(t)document.documentElement.dataset.tema=t}catch(e){}`;

// solo sulle pagine italiane: se l'ultima volta hai scelto un'altra lingua, porta lì.
// Google non ha scelte salvate, quindi vede sempre l'italiano
const altreLingue = LINGUE.filter((l) => l.codice !== LINGUA_BASE).map((l) => l.codice);
const SCRIPT_LINGUA = `try{var l=localStorage.getItem("lingua");if(${JSON.stringify(altreLingue)}.indexOf(l)>-1){document.documentElement.style.visibility="hidden";location.replace("/"+l+location.pathname.replace(/\\/$/,"")+location.search+location.hash)}}catch(e){}`;

export default async function RootLayout({ children }) {
  const { lingua, valida, testi } = await leggiLingua();
  const testiBrowser = Object.fromEntries(SEZIONI_BROWSER.map((s) => [s, testi[s]]));

  return (
    // suppressHydrationWarning: lo script qui sotto può aggiungere data-tema prima che React parta
    <html lang={lingua} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
        {valida && lingua === LINGUA_BASE && <script dangerouslySetInnerHTML={{ __html: SCRIPT_LINGUA }} />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(persona) }} />
      </head>
      <body>
        <ProviderLingua lingua={lingua} testi={testiBrowser}>
          <Sfondo />
          <Navbar />
          <main className="contenuto">{children}</main>
          <Footer />
          {/* la pillola con gli occhi che segue il mouse (solo computer, si aggiunge alla freccia) */}
          <CursoreOcchi />
          {/* accende il neon delle CTA quando il cursore si avvicina (vetro-neon.css) */}
          <VetroNeon />
        </ProviderLingua>
      </body>
    </html>
  );
}
