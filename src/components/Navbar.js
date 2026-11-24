"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SelettoreLingua from "@/components/SelettoreLingua";
import { PAGINE, percorso } from "@/i18n/config";
import { useLingua } from "@/i18n/lingua";
import BottoneTema from "@/components/BottoneTema";
import Sfondo from "@/components/Sfondo";
import styles from "./Navbar.module.css";

// quando il menu è quello del telefono e del tablet (burger): la stessa misura del CSS
const MENU_BURGER = "(max-width: 768px)";
// il giro delle lettere della voce toccata (come nel CSS): quanto dura il giro di una lettera,
// e quanto aspetta ogni lettera dopo la precedente. La pagina si apre quando finisce l'ultima
const DURATA_LETTERA = 450;
const RITARDO_LETTERA = 30;

export default function Navbar() {
  const { lingua, t } = useLingua();
  // le voci del menu, con gli indirizzi nella lingua della pagina (es. /en/progetti)
  const links = PAGINE.map((pagina) => ({
    href: percorso(lingua, pagina),
    label: t(`menu.${pagina || "home"}`),
  }));
  // il menu burger si vede solo su telefono e tablet: su computer questo stato non cambia nulla
  const [aperto, setAperto] = useState(false);
  // lo sfondo animato dentro il menu si prepara quando la pagina ha finito di caricarsi:
  // non pesa all'avvio, e non rallenta la prima apertura del menu
  const [sfondoPronto, setSfondoPronto] = useState(false);
  // true dove c'è il menu burger (telefono e tablet): lì il menu chiuso non si deve poter usare
  const [burger, setBurger] = useState(false);
  // il link che sta girando su se stesso, prima di aprire la sua pagina
  const [girando, setGirando] = useState(null);
  const navbar = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const media = window.matchMedia(MENU_BURGER);
    const aggiorna = () => setBurger(media.matches);
    aggiorna();
    media.addEventListener("change", aggiorna);
    return () => media.removeEventListener("change", aggiorna);
  }, []);

  useEffect(() => {
    // solo dove c'è il menu burger
    if (!window.matchMedia(MENU_BURGER).matches) return;
    const pronto = () => setSfondoPronto(true);
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(pronto, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(pronto, 800);
    return () => clearTimeout(id);
  }, []);

  function apriChiudi() {
    setSfondoPronto(true);
    setAperto(!aperto);
  }

  // a menu aperto: si chiude toccando fuori dalla navbar o premendo Esc,
  // e la pagina sotto non scorre (come nel menu del sito Apple)
  useEffect(() => {
    if (!aperto) return;

    function toccoFuori(evento) {
      if (!navbar.current.contains(evento.target)) setAperto(false);
    }

    function tastoPremuto(evento) {
      if (evento.key === "Escape") setAperto(false);
    }

    // il blocco arriva a pannello già sceso: farlo subito costringe il browser a ricalcolare
    // tutta la pagina proprio mentre il menu si apre, e l'animazione scatterebbe
    const radice = document.documentElement;
    const menuBurger = window.matchMedia(MENU_BURGER).matches;
    const blocca = setTimeout(() => {
      if (menuBurger) radice.style.overflow = "hidden";
    }, 560);

    document.addEventListener("pointerdown", toccoFuori);
    document.addEventListener("keydown", tastoPremuto);
    return () => {
      clearTimeout(blocca);
      radice.style.overflow = "";
      document.removeEventListener("pointerdown", toccoFuori);
      document.removeEventListener("keydown", tastoPremuto);
    };
  }, [aperto]);

  // toccando un link del menu burger: le sue lettere girano, poi si apre la pagina e il menu si chiude
  function vai(evento, href, label) {
    const menuBurger = window.matchMedia(MENU_BURGER).matches;
    const menoMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // su computer, per chi riduce i movimenti, o aprendo in un'altra scheda: subito, senza giro
    if (!menuBurger || menoMovimento || evento.metaKey || evento.ctrlKey || evento.shiftKey) {
      setAperto(false);
      return;
    }
    evento.preventDefault();
    if (girando) return;
    setGirando(href);
    setTimeout(() => {
      router.push(href);
      setAperto(false);
      setGirando(null);
    }, DURATA_LETTERA + (label.length - 1) * RITARDO_LETTERA);
  }

  return (
    <header className={styles.navbar} ref={navbar}>
      <Link
        href={percorso(lingua)}
        className={styles.logo}
        title={t("menu.tornaHome")}
        onClick={() => setAperto(false)}
      >

      </Link>

      <div className={styles.azioni}>
        <BottoneTema />
        <SelettoreLingua />
        <button
          type="button"
          className={styles.burger}
          aria-label={t(aperto ? "menu.chiudi" : "menu.apri")}
          aria-expanded={aperto}
          aria-controls="navbar-menu"
          onClick={apriChiudi}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav
        id="navbar-menu"
        className={`${styles.links} ${aperto ? styles.aperto : ""}`}
        // menu burger chiuso: invisibile ma già pronto, e inert lo rende non cliccabile e non
        // raggiungibile con la tastiera o dallo screen reader
        inert={burger && !aperto}
      >
        {/* lo sfondo animato della home anche dentro il menu (solo telefono e tablet, vedi il CSS) */}
        {sfondoPronto && (
          <div className={styles.fondoMenu} aria-hidden="true">
            <Sfondo />
          </div>
        )}

        {links.map((link, indice) => (
          <Link
            key={link.href}
            href={link.href}
            // vetro-neon-latente: il vetro col neon delle CTA, che compare solo avvicinando il cursore
            className="vetro-neon vetro-neon-latente"
            style={{ "--posizione": indice }}
            data-gira={girando === link.href || undefined}
            onClick={(evento) => vai(evento, link.href, link.label)}
            // le lettere sono separate per farle girare: chi usa lo screen reader sente la parola intera
            aria-label={link.label}
          >
            {[...link.label].map((lettera, i) => (
              <span key={i} className={styles.lettera} style={{ "--i": i }} aria-hidden="true">
                {lettera}
              </span>
            ))}
          </Link>
        ))}
      </nav>
    </header>
  );
}
