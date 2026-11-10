import Badge from "@/components/Badge";
import { competenze, strumenti } from "@/data/competenze";
import VideoPrototipi from "@/components/VideoPrototipi";
import TestoRitardato from "@/components/TestoRitardato";

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <TestoRitardato className="home-testo">
          <p className="hero-saluto">Ciao, sono</p>
          <h1 className="hero-nome">Carlos David</h1>
          <p className="hero-ruolo">UX/UI Designer & Web Designer</p>
          <p>
            Progetto e sviluppo interfacce web curate, semplici da usare e belle da vedere.
            Mi piace trasformare idee in prodotti digitali concreti, partendo dal design.
          </p>
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
        <p className="competenze-etichetta">Cosa so fare</p>
        <h2 className="competenze-titolo">Competenze</h2>

        <div className="competenze-griglia">
          {competenze.map((c, i) => (
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
            <p className="competenze-etichetta">Dal design allo schermo</p>
            <h2 className="competenze-titolo">Prototipi</h2>
          </div>
          <p className="prototipi-testo">
            Interfacce progettate per ogni dispositivo: desktop, tablet e mobile.
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
