// Nessun "use client": il footer ha solo link e hover in CSS.
// Non ricorda niente e non reagisce con JavaScript, quindi resta server (leggero).

import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { contatti } from "@/data/contatti";
import styles from "./Footer.module.css";

const ICONE = {
  email: HiOutlineMail,
  linkedin: FaLinkedin,
  github: FaGithub,
};

const PAGINE = [
  { href: "/", nome: "Home" },
  { href: "/progetti", nome: "Progetti" },
  { href: "/esperienze", nome: "Esperienze" },
  { href: "/certificazioni", nome: "Certificazioni" },
  { href: "/contatti", nome: "Contatti" },
];

export default function Footer() {
  const email = contatti.find((contatto) => contatto.tipo === "email");

  return (
    <footer className={styles.footer}>
      {/* la firma gigante: decorativa, quindi nascosta agli screen reader */}
      <div className={styles.firmaBox} aria-hidden="true">
        <span className={styles.firma}>Carlos David</span>
      </div>

      <div className={styles.griglia}>
        {/* colonna 1: il marchio */}
        <div>
          <Link href="/" className={styles.nome}>
            Carlos David
          </Link>
          <p className={styles.ruolo}>UX/UI Designer & Web Designer</p>
          <p className={styles.disponibile}>Disponibile per nuovi progetti</p>
        </div>

        {/* colonna 2: le pagine */}
        <nav aria-label="Pagine del sito">
          <p className={styles.titoletto}>Pagine</p>
          <ul className={styles.elenco}>
            {PAGINE.map((pagina) => (
              <li key={pagina.href}>
                <Link href={pagina.href} className={styles.link}>
                  {pagina.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* colonna 3: i contatti, dallo stesso file della pagina Contatti */}
        <div>
          <p className={styles.titoletto}>Contatti</p>
          <ul className={styles.social}>
            {contatti.map((contatto) => {
              const Icona = ICONE[contatto.tipo];
              const esterno = contatto.tipo !== "email";

              return (
                <li key={contatto.tipo}>
                  <a
                    className={styles.socialLink}
                    href={contatto.link}
                    target={esterno ? "_blank" : undefined}
                    rel={esterno ? "noopener noreferrer" : undefined}
                    aria-label={contatto.etichetta}
                  >
                    <Icona aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
          {email && (
            <a href={email.link} className={styles.email}>
              {email.valore}
            </a>
          )}
        </div>
      </div>

      {/* la barra in fondo */}
      <div className={styles.fondo}>
        {/* href="#" riporta in cima alla pagina, senza JavaScript */}
        <a href="#" className={styles.suSu}>
          Torna su ↑
        </a>
      </div>
    </footer>
  );
}