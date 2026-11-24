import T, { TestoScorri } from "@/i18n/T";
import Badge from "@/components/Badge";
import { competenze, strumenti } from "@/data/competenze";
import VideoPrototipi from "@/components/VideoPrototipi";
import TestoRitardato from "@/components/TestoRitardato";

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <TestoRitardato className="home-testo">
          <p className="hero-saluto"><T>Ciao, sono</T></p>
          <h1 className="hero-nome">Carlos David</h1>
          <p className="hero-ruolo">UX/UI Designer & Web Designer</p>
          <h3 className="hero-descrizione">
            <T>
              Progetto e sviluppo interfacce web curate, semplici da usare e belle da vedere.
              Mi piace trasformare idee in prodotti digitali concreti, partendo dal design.
            </T>
          </h3>
        </TestoRitardato>

        <div className="home-badge">
          <Badge
            nome="Carlos"
            cognome="David"
            ruolo="UX/UI Designer & Web Designer"
            luogo="Italia"
            intestazione="Portfolio"
            colore="#e5331cdd"
            foto="/immagini/foto.jpg"
          />
        </div>
      </section>

      <section className="competenze">
        <p className="competenze-etichetta"><T>Cosa so fare</T></p>
        <h2 className="competenze-titolo"><T>Competenze</T></h2>

        <div className="competenze-griglia">
          {competenze.map((c, i) => (
            <div key={c.nome} className="competenza">
              <span className="competenza-numero">
                {String(i + 1).padStart(2, "0")}
              </span>

              <h3 className="competenza-nome">
                <TestoScorri>{c.nome}</TestoScorri>
              </h3>

              <p className="competenza-descrizione"><T>{c.descrizione}</T></p>
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
            <p className="competenze-etichetta"><T>Dal design allo schermo</T></p>
            <h2 className="competenze-titolo"><T>Prototipi</T></h2>
          </div>
          <p className="prototipi-testo">
            <T>Interfacce progettate per ogni dispositivo: desktop, tablet e mobile.</T>
          </p>
        </div>

        <div className="prototipi-cornice">
          <VideoPrototipi
            src="/video/prototipi.mp4"
            poster="/video/prototipi-anteprima.webp"
          />
        </div>
      </section>
    </>
  );
}
