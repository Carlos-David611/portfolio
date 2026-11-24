import { leggiLinguaPagina } from "@/i18n/server";
import { metadati } from "@/i18n/seo";
import Badge from "@/components/Badge";
import { competenze, strumenti } from "@/data/competenze";
import VideoPrototipi from "@/components/VideoPrototipi";
import TestoRitardato from "@/components/TestoRitardato";

export const generateMetadata = () => metadati("");

export default async function Home() {
  const { t, dati } = await leggiLinguaPagina();

  return (
    <>
      <section className="home-hero">
        <TestoRitardato className="home-testo">
          <p className="hero-saluto">{t("home.saluto")}</p>
          <h1 className="hero-nome">Carlos David</h1>
          <p className="hero-ruolo">UX/UI Designer & Web Designer</p>
          <h3 className="hero-descrizione">
            {t("home.descrizione")}
          </h3>
        </TestoRitardato>

        <div className="home-badge">
          <Badge
            nome="Carlos"
            cognome="David"
            ruolo="UX/UI Designer & Web Designer"
            luogo={t("home.luogo")}
            intestazione="Portfolio"
            colore="#e5331cdd"
            foto="/immagini/foto.jpg"
            descrizioneFoto={t("home.foto", { nome: "Carlos David" })}
          />
        </div>
      </section>

      <section className="competenze">
        <p className="competenze-etichetta">{t("home.competenzeEtichetta")}</p>
        <h2 className="competenze-titolo">{t("home.competenzeTitolo")}</h2>

        <div className="competenze-griglia">
          {dati(competenze).map((c, i) => (
            <div key={c.nome} className="competenza">
              <span className="competenza-numero">
                {String(i + 1).padStart(2, "0")}
              </span>

              <h3 className="competenza-nome">
                <span className="scorri">
                  <span className="scorri-interno" data-testo={c.nome}>
                    {c.nome}
                  </span>
                </span>
              </h3>

              <p className="competenza-descrizione">{c.descrizione}</p>
              <span className="competenza-freccia">→</span>
            </div>
          ))}
        </div>

        <div className="strumenti">
          {strumenti.map((s) => (
            <span key={s} className="strumento">{s}</span>
          ))}
        </div>
      </section>


      <section className="competenze">
        <div className="prototipi-intestazione">
          <div>
            <p className="competenze-etichetta">{t("home.prototipiEtichetta")}</p>
            <h2 className="competenze-titolo">{t("home.prototipiTitolo")}</h2>
          </div>
          <p className="prototipi-testo">
            {t("home.prototipiTesto")}
          </p>
        </div>

        <div className="prototipi-cornice">
          <VideoPrototipi
            src="/video/prototipi.mp4"
            poster="/video/prototipi-anteprima.webp"
            descrizione={t("home.video")}
          />
        </div>
      </section>
    </>
  );
}
