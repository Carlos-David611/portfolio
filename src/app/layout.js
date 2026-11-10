import Navbar from "@/components/Navbar";
import Sfondo from "@/components/Sfondo";
import ChatBot from "@/components/ChatBot";
import "./globals.css";
import Footer from "@/components/Footer";

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
        {/* rimette il tema salvato prima che la pagina si veda: niente lampo scuro di giorno */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("tema");if(t)document.documentElement.dataset.tema=t}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <Sfondo />
        <Navbar />
        <main className="contenuto">{children}</main>
        <Footer />
        <ChatBot />
      </body>
    </html>
  );
}