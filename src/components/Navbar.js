"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SelettoreLingua from "@/components/SelettoreLingua";
import { PAGINE, percorso } from "@/gestione-lingua/config";
import { useLingua } from "@/gestione-lingua/lingua";
import BottoneTema from "@/components/BottoneTema";
import Sfondo from "@/components/Sfondo";
import styles from "./Navbar.module.css";

const MENU_BURGER = "(max-width: 768px)";
const DURATA_LETTERA = 180;
const RITARDO_LETTERA = 5;

const preparaGalleria = () => import("./three-galleria").catch(() => {});

export default function Navbar() {
  const { lingua, t } = useLingua();
  const links = PAGINE.map((pagina) => ({
    href: percorso(lingua, pagina),
    label: t(`menu.${pagina || "home"}`),
  }));

  const [aperto, setAperto] = useState(false);
  const [sfondoPronto, setSfondoPronto] = useState(false);
  const [burger, setBurger] = useState(false);
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
    if (!aperto) preparaGalleria();
    setAperto(!aperto);
  }

 
  useEffect(() => {
    if (!aperto) return;

    function toccoFuori(evento) {
      if (!navbar.current.contains(evento.target)) setAperto(false);
    }

    function tastoPremuto(evento) {
      if (evento.key === "Escape") setAperto(false);
    }
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

  function vai(evento, href, label) {
    const menuBurger = window.matchMedia(MENU_BURGER).matches;
    const menoMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!menuBurger || menoMovimento || evento.metaKey || evento.ctrlKey || evento.shiftKey) {
      setAperto(false);
      return;
    }
    evento.preventDefault();
    if (girando) return;
    setGirando(href);
    router.push(href);
    setTimeout(() => {
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
        
        inert={burger && !aperto}
      >
        
        {sfondoPronto && (
          <div className={styles.fondoMenu} aria-hidden="true">
            <Sfondo />
          </div>
        )}

        {links.map((link, indice) => (
          <Link
            key={link.href}
            href={link.href}
         
            prefetch
            onPointerEnter={link.href.endsWith("/certificazioni") ? preparaGalleria : undefined}
            onFocus={link.href.endsWith("/certificazioni") ? preparaGalleria : undefined}
          
            className="vetro-neon vetro-neon-latente"
            style={{ "--posizione": indice }}
            data-gira={girando === link.href || undefined}
            onClick={(evento) => vai(evento, link.href, link.label)}
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
