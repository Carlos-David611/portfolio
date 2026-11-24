import Navbar from "@/components/Navbar";
import Sfondo from "@/components/Sfondo";
import "./globals.css";
import "./vetro-neon.css";
import Footer from "@/components/Footer";
import CursoreOcchi from "@/components/CursoreOcchi";
import VetroNeon from "@/components/VetroNeon";

export const metadata = {
  title: "Carlos David · Portfolio",
  description: "Progetti, esperienze e certificazioni",
  // il sito non ha un'iconcina: "data:," dice al browser che è vuota, così non la cerca
  // (senza questa riga chiede /favicon.ico a ogni pagina e riceve un errore 404)
  icons: { icon: "data:," },
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: lo script qui sotto può aggiungere data-tema prima che React parta
    <html lang="it" suppressHydrationWarning>
      <head>
        {/* rimette il tema salvato prima che la pagina si veda: niente lampo scuro di giorno.
            Con una lingua diversa dall'italiano, nasconde i testi finché non sono tradotti (globals.css) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("tema");if(t)document.documentElement.dataset.tema=t;var l=localStorage.getItem("lingua");if(l==="en"||l==="de"||l==="es"){var h=document.documentElement;h.lang=l;h.dataset.linguaAttesa="";setTimeout(function(){delete h.dataset.linguaAttesa},2500)}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <Sfondo />
        <Navbar />
        <main className="contenuto">{children}</main>
        <Footer />
        {/* la pillola con gli occhi che segue il mouse (solo computer, si aggiunge alla freccia) */}
        <CursoreOcchi />
        {/* accende il neon delle CTA quando il cursore si avvicina (vetro-neon.css) */}
        <VetroNeon />
      </body>
    </html>
  );
}