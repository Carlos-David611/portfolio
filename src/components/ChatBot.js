"use client";
// client: deve ricordare i messaggi (useState) e reagire a clic e invio

import { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import Sfondo from "@/components/Sfondo";
import { useRetroBadge } from "@/components/retroBadge";
import styles from "@/app/api/chat/ChatBot.module.css";

const SALUTO =
  "Ciao! 👋 Sono l'assistente di Carlos. Chiedimi dei suoi progetti, delle esperienze o delle certificazioni.";

const DOMANDE = [
  "Quali progetti ha realizzato?",
  "Che esperienze ha?",
  "Quali certificazioni ha?",
  "Come posso contattarlo?",
];

// il cursore nel campo, ma non sui telefoni: si aprirebbe la tastiera e coprirebbe i suggerimenti.
// preventScroll: lo scorrimento lo decide la chat, altrimenti il browser salterebbe di colpo
function cursoreNelCampo(campo) {
  if (window.matchMedia("(hover: none)").matches) return;
  campo?.focus({ preventScroll: true });
}

// a chat aperta il 3D è spento (vedi fermo): il badge deve riprendere il mezzo giro di colpo,
// senza animazione, altrimenti non avrebbe da dove rigirarsi. offsetWidth fa applicare
// subito il cambio al browser, prima di far ripartire l'animazione
function rimettiIn3D(retro, setFermo) {
  const giro = retro?.parentElement;
  if (!giro) return;
  giro.style.transition = "none";
  flushSync(() => setFermo(false));
  void giro.offsetWidth;
  giro.style.transition = "";
}

export default function ChatBot() {
  const [aperto, setAperto] = useState(false);
  const [messaggi, setMessaggi] = useState([]); // { role: "user" | "assistant" | "errore", content }
  const [testo, setTesto] = useState("");        // quello che si sta scrivendo
  const [inAttesa, setInAttesa] = useState(false);
  // il badge si è girato. Non coincide con aperto: sul telefono prima la pagina arriva al badge
  const [girato, setGirato] = useState(false);
  // il giro è finito e il 3D è spento. Ruotata in 3D la chat è disegnata come un'immagine
  // deformata e sul telefono il testo si vede sfocato: da ferma torna un elemento normale
  const [fermo, setFermo] = useState(false);

  // il retro del badge, dove va la chat. Solo la home ha il badge: altrove è null e la chat
  // resta il pannello flottante. I messaggi stanno qui, quindi non si perdono cambiando pagina
  const retro = useRetroBadge();

  const listaRef = useRef(null);
  const campoRef = useRef(null);
  const bottoneRef = useRef(null);
  const pannelloRef = useRef(null);

  // a ogni nuovo messaggio, la lista scorre fino in fondo
  useEffect(() => {
    const lista = listaRef.current;
    if (lista) lista.scrollTop = lista.scrollHeight;
  }, [messaggi, inAttesa]);

  // il cursore va nel campo solo quando la chat si vede: un campo nascosto non prende il focus
  const visibile = aperto && (girato || !retro);
  useEffect(() => {
    if (visibile) cursoreNelCampo(campoRef.current);
  }, [visibile]);

  // quando la chat si apre, il badge si porta tutto in vista
  useEffect(() => {
    if (!aperto) {
      setGirato(false);
      return;
    }
    if (!retro) return;

    const sotto = window.innerHeight - 16;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    const giro = retro.parentElement;
    const altezza = retro.offsetHeight;

    // computer: la pagina va in cima e il badge sale di quanto serve per entrare nello schermo.
    // giaSu: se si riapre mentre sta ancora scendendo, la misura non deve contare la sua salita
    if (window.innerWidth > 768) {
      const sopra = 100; // lo spazio per la navbar
      const pendolo = retro.closest('[data-badge="pendolo"]');
      const giaSu = new DOMMatrix(getComputedStyle(pendolo).transform).m42;
      const inCima = giro.getBoundingClientRect().top - giaSu + window.scrollY;
      const salita = Math.max(0, Math.min(inCima + altezza - sotto, inCima - sopra));
      pendolo.style.setProperty("--salita", `${salita}px`);
      window.scrollTo({ top: 0, behavior });
      setGirato(true);
      return;
    }

    // telefono: il badge sta sotto il testo, è la pagina che deve arrivare fino a lui.
    // Il giro parte solo all'arrivo: girando durante lo scorrimento non si vedrebbe
    const { top } = giro.getBoundingClientRect();
    const sopra = 80; // lo spazio per i pulsanti in alto
    const fondo = top + altezza;
    let spostamento = 0;
    if (top < sopra) spostamento = top - sopra;
    else if (fondo > sotto) spostamento = Math.min(fondo - sotto, top - sopra);

    if (Math.abs(spostamento) < 4 || behavior === "auto") {
      window.scrollBy({ top: spostamento, behavior: "auto" });
      setGirato(true);
      return;
    }

    window.scrollBy({ top: spostamento, behavior });
    const arrivato = () => setGirato(true);
    window.addEventListener("scrollend", arrivato, { once: true });
    // non tutti i browser conoscono scrollend: dopo questo tempo il giro parte comunque
    const riserva = setTimeout(arrivato, 800);
    return () => {
      window.removeEventListener("scrollend", arrivato);
      clearTimeout(riserva);
    };
  }, [aperto, retro]);

  // 950: appena dopo la fine del giro, che dura 0.9s (.giro in Badge.module.css)
  useEffect(() => {
    if (!girato) return;
    const fermi = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const attesa = setTimeout(() => setFermo(true), fermi ? 0 : 950);
    return () => clearTimeout(attesa);
  }, [girato]);

  // la tastiera di telefoni e tablet copre il fondo dello schermo, proprio dove sta la chat.
  // visualViewport dice quanta parte dello schermo resta visibile: da lì il CSS sposta la chat
  // sopra la tastiera (--tastiera) e la accorcia quanto serve (--alto-visibile)
  useEffect(() => {
    const schermo = window.visualViewport;
    const pannello = pannelloRef.current;
    if (!aperto || !schermo || !pannello) return;

    function adatta() {
      // quanto fondo dello schermo è coperto: tastiera aperta = più di zero
      const coperto = Math.max(0, window.innerHeight - schermo.height - schermo.offsetTop);
      pannello.style.setProperty("--tastiera", `${Math.round(coperto)}px`);
      pannello.style.setProperty("--alto-visibile", `${Math.round(schermo.height)}px`);
      pannello.toggleAttribute("data-tastiera", coperto > 80);

    }

    adatta();
    schermo.addEventListener("resize", adatta);
    schermo.addEventListener("scroll", adatta);
    return () => {
      schermo.removeEventListener("resize", adatta);
      schermo.removeEventListener("scroll", adatta);
      pannello.style.removeProperty("--tastiera");
      pannello.style.removeProperty("--alto-visibile");
      pannello.removeAttribute("data-tastiera");
    };
  }, [aperto, retro]);

  // in home, mentre scrivi: la chat del badge deve stare tutta nella parte di schermo visibile
  // sopra la tastiera. I browser gestiscono la tastiera in due modi (rimpiccioliscono solo la
  // parte visibile, oppure tutta la pagina): qui si guarda solo lo spazio che resta davvero.
  // Se serve la chat si accorcia; poi sul tablet il badge sale, sul telefono scorre la pagina.
  // Quando il cursore esce dal campo, tutto torna com'era
  useEffect(() => {
    const campo = campoRef.current;
    if (!aperto || !retro || !campo) return;
    const schermo = window.visualViewport;
    const pendolo = retro.closest('[data-badge="pendolo"]');
    const salitaIniziale = pendolo.style.getPropertyValue("--salita");
    let fotogramma = 0;

    function sistema() {
      if (document.activeElement !== campo) return;
      const computer = window.innerWidth > 768;
      const sopraVisibile = schermo ? schermo.offsetTop : 0;
      const altoVisibile = schermo ? schermo.height : window.innerHeight;
      const margineSopra = computer ? 100 : 80; // lo spazio per la navbar
      const fondo = sopraVisibile + altoVisibile - 12;

      // la chat si accorcia se non ci sta
      retro.style.height = "";
      const naturale = retro.offsetHeight;
      const alto = Math.min(naturale, altoVisibile - margineSopra - 12);
      if (alto < naturale) retro.style.height = `${alto}px`;

      // dove dovrebbe stare: col fondo appena sopra la tastiera
      const r = retro.getBoundingClientRect();
      const cimaGiusta = Math.max(fondo - alto, sopraVisibile + margineSopra);
      if (computer) {
        // il badge sale (o scende) fino a lì. m42: quanto è già salito in questo momento
        const giaSu = new DOMMatrix(getComputedStyle(pendolo).transform).m42;
        const salita = Math.max(0, r.top - giaSu - cimaGiusta);
        pendolo.style.setProperty("--salita", `${salita}px`);
      } else if (r.bottom > fondo || r.top < sopraVisibile + margineSopra) {
        window.scrollBy({ top: r.top - cimaGiusta });
      }
    }

    // la tastiera si apre con un'animazione: si ricontrolla a ogni cambio di misura
    function presto() {
      cancelAnimationFrame(fotogramma);
      fotogramma = requestAnimationFrame(sistema);
    }

    function esce() {
      retro.style.height = "";
      if (salitaIniziale) pendolo.style.setProperty("--salita", salitaIniziale);
    }

    campo.addEventListener("focus", presto);
    campo.addEventListener("blur", esce);
    schermo?.addEventListener("resize", presto);
    schermo?.addEventListener("scroll", presto);
    window.addEventListener("resize", presto);
    return () => {
      cancelAnimationFrame(fotogramma);
      campo.removeEventListener("focus", presto);
      campo.removeEventListener("blur", esce);
      schermo?.removeEventListener("resize", presto);
      schermo?.removeEventListener("scroll", presto);
      window.removeEventListener("resize", presto);
      retro.style.height = "";
    };
  }, [aperto, retro]);

  // sopra la chat si scorrono solo i messaggi, mai la pagina che sta dietro.
  // Lo facciamo a mano: sul retro del badge, girato in 3D, il dito del browser muoverebbe la
  // pagina invece della lista. passive: false, altrimenti il browser ignora preventDefault
  useEffect(() => {
    const pannello = pannelloRef.current;
    const lista = listaRef.current;
    let ultimoY = 0;
    let ultimoTempo = 0;
    let velocita = 0; // pixel al millisecondo
    let inerzia = 0;

    // i suggerimenti, quando stanno in una riga che si scorre di lato (schermi bassi):
    // lì il dito e la rotellina orizzontale scorrono la riga, non i messaggi
    const inRiga = (evento) => {
      const riga = evento.target.closest?.(`.${styles.suggerimenti}`);
      return riga && riga.scrollWidth > riga.clientWidth;
    };

    function rotellina(evento) {
      if (inRiga(evento) && Math.abs(evento.deltaX) > Math.abs(evento.deltaY)) return;
      evento.preventDefault();
      // deltaMode 1: alcuni mouse contano le righe e non i pixel
      lista.scrollTop += evento.deltaMode === 1 ? evento.deltaY * 16 : evento.deltaY;
    }

    function ditoGiu(evento) {
      cancelAnimationFrame(inerzia);
      ultimoY = evento.touches[0].clientY;
      ultimoTempo = evento.timeStamp;
      velocita = 0;
    }

    function ditoSiMuove(evento) {
      if (inRiga(evento)) return;
      if (evento.cancelable) evento.preventDefault();
      const y = evento.touches[0].clientY;
      const tempo = evento.timeStamp - ultimoTempo;
      lista.scrollTop += ultimoY - y;
      if (tempo > 0) velocita = (ultimoY - y) / tempo;
      ultimoY = y;
      ultimoTempo = evento.timeStamp;
    }

    // lasciato il dito, la lista continua un po' da sola e rallenta, come sui telefoni.
    // 0.95: quanto dura la scivolata, più è vicino a 1 più va lontano
    function scivola() {
      lista.scrollTop += velocita * 16;
      velocita *= 0.95;
      if (Math.abs(velocita) > 0.02) inerzia = requestAnimationFrame(scivola);
    }

    function ditoSu() {
      // se il dito si è fermato prima di staccarsi, niente scivolata
      if (performance.now() - ultimoTempo < 100) inerzia = requestAnimationFrame(scivola);
    }

    pannello.addEventListener("wheel", rotellina, { passive: false });
    pannello.addEventListener("touchstart", ditoGiu, { passive: true });
    pannello.addEventListener("touchmove", ditoSiMuove, { passive: false });
    pannello.addEventListener("touchend", ditoSu, { passive: true });
    return () => {
      cancelAnimationFrame(inerzia);
      pannello.removeEventListener("wheel", rotellina);
      pannello.removeEventListener("touchstart", ditoGiu);
      pannello.removeEventListener("touchmove", ditoSiMuove);
      pannello.removeEventListener("touchend", ditoSu);
    };
  }, [retro]);

  // se il badge esce dallo schermo si rigira: il pulsante rotondo torna disponibile.
  // visto: all'apertura può essere ancora fuori, mentre la pagina ci sta arrivando
  useEffect(() => {
    if (!aperto || !retro) return;
    let visto = false;
    const osservatore = new IntersectionObserver(([voce]) => {
      if (voce.isIntersecting) visto = true;
      else if (visto) {
        campoRef.current?.blur();
        rimettiIn3D(retro, setFermo);
        setAperto(false);
      }
    });
    osservatore.observe(retro);
    return () => osservatore.disconnect();
  }, [aperto, retro]);

  function chiudi() {
    // via il cursore dal campo subito: la tastiera dei telefoni e dei tablet si chiude
    // nello stesso istante in cui parte il giro del badge, non dopo
    campoRef.current?.blur();
    rimettiIn3D(retro, setFermo);
    setAperto(false);
    // sul badge il pulsante era nascosto: il focus torna lì appena ricompare
    requestAnimationFrame(() => bottoneRef.current?.focus({ preventScroll: true }));
  }

  async function invia(contenuto) {
    const domanda = contenuto.trim();
    if (!domanda || inAttesa) return;

    // la nuova conversazione = i messaggi di prima + la domanda
    const conversazione = [...messaggi, { role: "user", content: domanda }];
    setMessaggi(conversazione);
    setTesto("");
    setInAttesa(true);

    try {
      const risposta = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // i messaggi "errore" li scarta già il server: non arrivano al modello
        body: JSON.stringify({ messaggi: conversazione }),
      });
      const dati = await risposta.json();

      setMessaggi([
        ...conversazione,
        dati.risposta
          ? { role: "assistant", content: dati.risposta }
          : { role: "errore", content: dati.errore || "Qualcosa è andato storto." },
      ]);
    } catch {
      setMessaggi([
        ...conversazione,
        { role: "errore", content: "Connessione non riuscita. Controlla internet e riprova." },
      ]);
    } finally {
      // finally: si esegue sempre, sia se è andata bene sia se c'è stato un errore
      setInAttesa(false);
      cursoreNelCampo(campoRef.current);
    }
  }

  function quandoInvii(evento) {
    // senza questa riga il modulo ricaricherebbe la pagina
    evento.preventDefault();
    invia(testo);
  }

  function classeBolla(role) {
    if (role === "user") return styles.utente;
    if (role === "errore") return styles.errore;
    return styles.bot;
  }

  const pannello = (
      <div
        ref={pannelloRef}
        id="chatbot-pannello"
        className={`${styles.pannello} ${visibile ? styles.pannelloAperto : ""} ${retro ? styles.pannelloBadge : ""} ${retro && fermo ? styles.pannelloFermo : ""}`}
        role="dialog"
        aria-label="Chat con l'assistente di Carlos"
        // Esc chiude la chat
        onKeyDown={(evento) => evento.key === "Escape" && chiudi()}
      >
        {/* lo stesso sfondo della home: una copia grande come lo schermo, ritagliata dal pannello */}
        <div className={styles.fondoHome}>
          <Sfondo />
        </div>

        <div className={styles.testa}>
          <span className={styles.avatar} aria-hidden="true">CD</span>
          <div>
            <p className={styles.titolo}>Assistente di Carlos</p>
            <p className={styles.stato}>Online</p>
          </div>

          {/* la X per chiudere, su tutte le pagine: a chat aperta il pulsante rotondo è nascosto */}
          {(
            <button
              type="button"
              className={styles.chiudi}
              onClick={chiudi}
              aria-label="Chiudi la chat"
              tabIndex={aperto ? 0 : -1}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>

        {/* aria-live: chi usa uno screen reader sente arrivare le risposte */}
        <ul className={styles.messaggi} ref={listaRef} aria-live="polite">
          <li className={`${styles.bolla} ${styles.bot}`}>{SALUTO}</li>

          {messaggi.map((messaggio, posizione) => (
            // qui la posizione va bene come key: i messaggi si aggiungono solo in fondo
            <li key={posizione} className={`${styles.bolla} ${classeBolla(messaggio.role)}`}>
              {messaggio.content}
            </li>
          ))}

          {inAttesa && (
            <li className={`${styles.bolla} ${styles.bot} ${styles.scrive}`} aria-label="L'assistente sta scrivendo">
              <span /><span /><span />
            </li>
          )}
        </ul>

        {/* le domande suggerite: solo all'inizio, prima del primo messaggio */}
        {messaggi.length === 0 && (
          <div className={styles.suggerimenti}>
            {DOMANDE.map((domanda) => (
              <button
                key={domanda}
                type="button"
                className={styles.suggerimento}
                onClick={() => invia(domanda)}
              >
                {domanda}
              </button>
            ))}
          </div>
        )}

        <form className={styles.modulo} onSubmit={quandoInvii}>
          <input
            ref={campoRef}
            className={styles.campo}
            type="text"
            value={testo}
            onChange={(evento) => setTesto(evento.target.value)}
            placeholder="Scrivi una domanda…"
            // lo stesso limite del server: 500 caratteri
            maxLength={500}
            aria-label="La tua domanda"
            // se la chat è chiusa, il campo non si raggiunge con Tab
            tabIndex={aperto ? 0 : -1}
          />
          <button
            type="submit"
            className={styles.invia}
            disabled={inAttesa || !testo.trim()}
            aria-label="Invia"
            tabIndex={aperto ? 0 : -1}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </div>
  );

  return (
    <>
      <button
        ref={bottoneRef}
        type="button"
        className={`${styles.bottone} ${aperto ? styles.bottoneAperto : ""} ${aperto ? styles.bottoneNascosto : ""}`}
        onClick={() => setAperto(!aperto)}
        aria-expanded={aperto}
        aria-controls="chatbot-pannello"
        aria-label={aperto ? "Chiudi la chat" : "Apri la chat con l'assistente"}
      >
        <svg className={styles.iconaChat} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
        </svg>
        <svg className={styles.iconaChiudi} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {/* sul badge la chat va nel suo retro, altrimenti resta qui */}
      {retro ? createPortal(pannello, retro) : pannello}
    </>
  );
}