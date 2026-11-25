import { leggiLinguaPagina } from "@/gestione-lingua/server";
import { metadati } from "@/gestione-lingua/seo";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { contatti } from "@/data/contatti";
import styles from "./contatti.module.css";

export const generateMetadata = () => metadati("contatti");

// a ogni "tipo" dei dati corrisponde un'icona
const ICONE = {
  email: HiOutlineMail,
  linkedin: FaLinkedin,
  github: FaGithub,
};

export default async function Contatti() {
  const { t } = await leggiLinguaPagina();

  return (
    <section className="competenze">
      <h1 className="competenze-titolo">{t("contatti.titolo")}</h1>

      <ul className={styles.lista}>
        {contatti.map((contatto) => {
          const Icona = ICONE[contatto.tipo];
          const esterno = contatto.tipo !== "email";

          return (
            <li key={contatto.tipo}>
              <a
                className={styles.contatto}
                href={contatto.link}
                target={esterno ? "_blank" : undefined}
                rel={esterno ? "noopener noreferrer" : undefined}
              >
                <span className={`${styles.icona} vetro-neon`} aria-hidden="true">
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