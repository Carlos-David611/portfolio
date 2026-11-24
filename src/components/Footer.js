
import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { PAGINE, percorso } from "@/i18n/config";
import { leggiLingua } from "@/i18n/server";
import { contatti } from "@/data/contatti";
import styles from "./Footer.module.css";

const ICONE = {
  email: HiOutlineMail,
  linkedin: FaLinkedin,
  github: FaGithub,
};

export default async function Footer() {
  const { lingua, t } = await leggiLingua();
  const email = contatti.find((contatto) => contatto.tipo === "email");

  return (
    <footer className={styles.footer}>
      
      <div className={styles.firmaBox} aria-hidden="true">
        <span className={styles.firma}>Carlos David</span>
      </div>

      <div className={styles.griglia}>
       
        <div>
          <Link href={percorso(lingua)} className={styles.nome}>
            Carlos David
          </Link>
          <p className={styles.ruolo}>{t("chiSono.ruolo")}</p>
          <p className={styles.disponibile}>{t("footer.disponibile")}</p>
        </div>

        
        <nav aria-label={t("footer.pagineSito")}>
          <p className={styles.titoletto}>{t("footer.pagine")}</p>
          <ul className={styles.elenco}>
            {PAGINE.map((pagina) => (
              <li key={pagina}>
                <Link href={percorso(lingua, pagina)} prefetch className={styles.link}>
                  {t(`menu.${pagina || "home"}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        
        <div>
          <p className={styles.titoletto}>{t("footer.contatti")}</p>
          <ul className={styles.social}>
            {contatti.map((contatto) => {
              const Icona = ICONE[contatto.tipo];
              const esterno = contatto.tipo !== "email";

              return (
                <li key={contatto.tipo}>
                  <a
                    className={`${styles.socialLink} vetro-neon`}
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

      <div className={styles.fondo}>
       
        <a href="#" className={`${styles.suSu} vetro-neon vetro-neon-latente vetro-neon-piena`}>
          {t("footer.tornaSu")}
        </a>
      </div>
    </footer>
  );
}