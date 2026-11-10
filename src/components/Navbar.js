"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BottoneTema from "@/components/BottoneTema";
import styles from "./Navbar.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/progetti", label: "Progetti" },
  { href: "/esperienze", label: "Esperienze" },
  { href: "/certificazioni", label: "Certificazioni" },
  { href: "/contatti", label: "Contatti" },
];

export default function Navbar() {
  // il menu burger si vede solo sul telefono: su computer questo stato non cambia nulla
  const [aperto, setAperto] = useState(false);
  const navbar = useRef(null);

  // a menu aperto: si chiude toccando fuori dalla navbar o premendo Esc
  useEffect(() => {
    if (!aperto) return;

    function toccoFuori(evento) {
      if (!navbar.current.contains(evento.target)) setAperto(false);
    }

    function tastoPremuto(evento) {
      if (evento.key === "Escape") setAperto(false);
    }

    document.addEventListener("pointerdown", toccoFuori);
    document.addEventListener("keydown", tastoPremuto);
    return () => {
      document.removeEventListener("pointerdown", toccoFuori);
      document.removeEventListener("keydown", tastoPremuto);
    };
  }, [aperto]);

  return (
    <header className={styles.navbar} ref={navbar}>
      <Link
        href="/"
        className={styles.logo}
        title="Torna alla home"
        onClick={() => setAperto(false)}
      >
        
      </Link>

      <div className={styles.azioni}>
        <BottoneTema />
        <button
          type="button"
          className={styles.burger}
          aria-label={aperto ? "Chiudi il menu" : "Apri il menu"}
          aria-expanded={aperto}
          aria-controls="navbar-menu"
          onClick={() => setAperto(!aperto)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* data-menu-aperto: lo guarda la chat, che sul telefono si fa da parte quando il menu è aperto */}
      <nav
        id="navbar-menu"
        className={`${styles.links} ${aperto ? styles.aperto : ""}`}
        data-menu-aperto={aperto || undefined}
      >
        {links.map((link, indice) => (
          <Link
            key={link.href}
            href={link.href}
            style={{ "--posizione": indice }}
            onClick={() => setAperto(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
