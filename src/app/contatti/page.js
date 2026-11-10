import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { contatti } from "@/data/contatti";
import styles from "./contatti.module.css";

export const metadata = {
  title: "Contatti | Carlos David",
};

// a ogni "tipo" dei dati corrisponde un'icona
const ICONE = {
  email: HiOutlineMail,
  linkedin: FaLinkedin,
  github: FaGithub,
};

export default function Contatti() {
  return (
    // le classi del box della home: stesso vetro, stessa inclinazione
    <section className="competenze">
      {/* il titolo grande, come quello del box Competenze in home */}
      <h1 className="competenze-titolo">Contatti</h1>

      <ul className={styles.lista}>
        {contatti.map((contatto) => {
          // il nome comincia con la maiuscola: per React è un componente
          const Icona = ICONE[contatto.tipo];
          // la mail apre il programma di posta, gli altri un nuovo sito
          const esterno = contatto.tipo !== "email";

          return (
            <li key={contatto.tipo}>
              <a
                className={styles.contatto}
                href={contatto.link}
                // i siti esterni si aprono in una nuova scheda
                target={esterno ? "_blank" : undefined}
                // noopener noreferrer: la nuova scheda non può controllare il tuo sito
                rel={esterno ? "noopener noreferrer" : undefined}
              >
                <span className={styles.icona} aria-hidden="true">
                  <Icona />
                </span>

                <span className={styles.testi}>
                  <span className={styles.etichetta}>{contatto.etichetta}</span>
                  <span className={styles.valore}>{contatto.valore}</span>
                </span>

                <span className={styles.freccia} aria-hidden="true">↗</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}