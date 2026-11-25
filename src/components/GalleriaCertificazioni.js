"use client";

// Galleria 3D delle certificazioni (Three.js).
// Le card scorrono in verticale, separate in profondità: quella scelta si mette di fronte,
// le vicine si allontanano sopra e sotto con angoli diversi. Scorrendo i fogli si flettono
// un poco, da fermi tornano piatti e leggibili.
// Rotella e trascinamento in verticale spostano la galleria; dopo 160ms di pausa si aggancia
// alla card più vicina. Clic o Invio sulla card di fronte aprono il certificato (VisorePdf).

import { useEffect, useRef, useState } from "react";
import VisorePdf, { caricaLettore, preparaPdf } from "./VisorePdf";
import { useLingua } from "@/gestione-lingua/lingua";
import styles from "@/app/[lingua]/certificazioni/GalleriaCertificazioni.module.css";

// ---------- le misure della specifica ----------
const LARGHEZZA = 4.492; // la larghezza di una card (unità della scena)
const SMORZA = 0.047; // quanto in fretta la galleria raggiunge l'obiettivo (a 60 fotogrammi al secondo)
const AGGANCIO_MS = 160; // dopo quanto tempo senza input si aggancia alla card più vicina
const DT_MAX = 0.05; // un fotogramma lento non fa saltare l'animazione
const CULL = 3.2; // le card più lontane di così non si disegnano
// quanta scena si vede in altezza: più è basso, più le card sono grandi
const ALTEZZA_VISTA = 5.9;
// la card di fronte, vista dalla telecamera, è larga circa 4.9: la vista deve essere larga
// almeno così (più un margine), altrimenti sugli schermi stretti la card verrebbe tagliata
const LARGHEZZA_MIN_VISTA = 5.25;
// quanto le card vicine si allontanano da quella scelta. Nella specifica è 7, pensato per card
// più piccole: con le card grandi, 7 le porterebbe fuori dallo schermo. Più è basso, più sono vicine
const SPINTA = 6.5;
// di quanto la card scelta sta sopra il centro della galleria (unità della scena).
// Negativo = un poco sotto il centro: così sopra c'è posto per la card precedente intera
const ALZA_CARD = -0.75;
// lo scorrimento automatico: ogni quanto passa alla card successiva, e quanto aspetta dopo che l'hai usata
const AUTO_OGNI_MS = 3500;
const AUTO_PAUSA_MS = 4000;
// il centro della card scelta, visto dalla telecamera (calcolato con la sua posa finale):
// la vista si centra lì, così la card di fronte sta al centro della galleria in ogni formato
const CENTRO_CARD = { x: -0.17, y: 0.49 };

const smoothstep = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

// l'immagine ottimizzata da Next.js (più leggera dell'originale)
const urlImmagine = (src) => `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`;

export default function GalleriaCertificazioni({ certificazioni }) {
  const { t } = useLingua();
  const palco = useRef(null);
  const tela = useRef(null);
  const [aperta, setAperta] = useState(null);
  const [senzaWebgl, setSenzaWebgl] = useState(false);
  const [attuale, setAttuale] = useState(0);
  // sempre la funzione aggiornata, anche dentro il ciclo di Three.js
  const apri = useRef(null);
  apri.current = (indice) => {
    const cert = certificazioni[indice];
    preparaPdf(cert.pdf);
    setAperta(cert);
  };

  // il lettore dei PDF è pesante: si carica appena tocchi la galleria (o ci passi il mouse),
  // e comunque dopo qualche secondo. Così non rallenta la comparsa della pagina,
  // ma all'apertura del certificato è già pronto
  useEffect(() => {
    const elPalco = palco.current;
    const carica = () => caricaLettore().catch(() => {});
    const eventi = ["pointerenter", "pointerdown", "focusin"];
    eventi.forEach((nome) => elPalco.addEventListener(nome, carica, { once: true, passive: true }));
    const id = setTimeout(carica, 6000);
    return () => {
      clearTimeout(id);
      eventi.forEach((nome) => elPalco.removeEventListener(nome, carica));
    };
  }, []);

  useEffect(() => {
    let annullato = false;
    let pulizia = () => {};

    // Three.js si scarica solo qui: non pesa sulle altre pagine
    import("./three-galleria")
      .then((THREE) => {
        if (annullato) return;
        try {
          pulizia = avvia(THREE);
        } catch (errore) {
          console.error("Galleria 3D non disponibile:", errore);
          setSenzaWebgl(true);
        }
      })
      .catch(() => !annullato && setSenzaWebgl(true));

    function avvia(THREE) {
      const elPalco = palco.current;
      const elTela = tela.current;
      const N = certificazioni.length;
      const menoMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
      const anteprimaGalleria = new URLSearchParams(window.location.search).has("gallery");

      // ---------- renderer, scena, telecamera ----------
      const renderer = new THREE.WebGLRenderer({ canvas: elTela, alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, anteprimaGalleria ? 0.75 : 1.5));

      const scena = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
      camera.position.set(20, 12.1, 16.6);
      camera.lookAt(-7, -2.1, 1.3);

      const binario = new THREE.Group();
      binario.position.set(4.3, 2.1, 5.1);
      binario.rotation.set(-0.0215, 2.2884, 0.2884, "XYZ");
      scena.add(binario);

      const uniformi = { uVelocita: { value: 0 } };
      const caricatore = new THREE.TextureLoader();
      const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      const carte = [];

      certificazioni.forEach((cert, indice) => {
        caricatore.load(urlImmagine(cert.anteprima), (texture) => {
          if (annullato) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = maxAniso;
          // l'orientamento del binario mostra il retro del piano: si gira la U una volta,
          // così le scritte si leggono dritte
          texture.wrapS = THREE.RepeatWrapping;
          texture.repeat.x = -1;
          texture.offset.x = 1;
          const proporzione = texture.image.width / texture.image.height || 1.4;
          const geometria = new THREE.PlaneGeometry(LARGHEZZA, LARGHEZZA / proporzione, 12, 32);
          const materiale = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
          materiale.onBeforeCompile = (shader) => {
            shader.uniforms.uVelocita = uniformi.uVelocita;
            shader.vertexShader = "uniform float uVelocita;\n" + shader.vertexShader.replace(
              "#include <begin_vertex>",
              "#include <begin_vertex>\n  transformed.z += -sin(uv.y * 2.0) * 0.4 * clamp(uVelocita * 2.0, -2.0, 2.0) * 2.25;"
            );
          };
          const mesh = new THREE.Mesh(geometria, materiale);
          mesh.matrixAutoUpdate = false;
          mesh.userData.indice = indice;
          binario.add(mesh);
          carte.push({ mesh, geometria, materiale, texture });
          sporco = true;
          avviaCiclo();
        });
      });

      // ---------- stato del movimento ----------
      let fase = 0;
      let obiettivo = 0;
      let fasePrecedente = 0;
      let ultimoInput = 0;
      let timerAggancio = 0;
      let sporco = true;
      let scelta = 0;
      let fotogramma = 0;
      let tempoPrecedente = 0;
      let visibile = true;
      let sopraIlMouse = false;
      let puntatore = null;

      const relativo = (indice) => {
        const r = fase - indice;
        return ((((r + N / 2) % N) + N) % N) - N / 2;
      };
      const indiceScelto = () => (((Math.round(fase) % N) + N) % N);

      function aggancia() {
        clearTimeout(timerAggancio);
        timerAggancio = setTimeout(() => {
          obiettivo = Math.round(obiettivo);
          avviaCiclo();
        }, AGGANCIO_MS);
      }

      function spingi(delta) {
        obiettivo += delta;
        ultimoInput = performance.now();
        aggancia();
        avviaCiclo();
      }

      // ---------- la posa di ogni card ----------
      const mTrasla = new THREE.Matrix4();
      const mPerno = new THREE.Matrix4();
      const mPernoInv = new THREE.Matrix4().makeTranslation(-LARGHEZZA / 2, 0, 0);
      const mRx = new THREE.Matrix4();
      const mRy = new THREE.Matrix4();
      const mRz = new THREE.Matrix4();
      const mGiro = new THREE.Matrix4().makeRotationY(Math.PI / 2);
      mPerno.makeTranslation(LARGHEZZA / 2, 0, 0);

      function posa(carta) {
        const rel = relativo(carta.mesh.userData.indice);
        const d = Math.abs(rel);
        carta.mesh.visible = d <= CULL;
        if (!carta.mesh.visible) return;
        const spinta = rel + Math.sign(rel) * SPINTA * smoothstep(0.1, 0.9, d);
        const peso = smoothstep(0, 1, 1 - smoothstep(0, 0.8, d));
        mRx.makeRotationX(-0.06681 * peso);
        mRy.makeRotationY(0.36331 * peso);
        mRz.makeRotationZ(-0.51318 * peso);
        // posizione sul binario, poi il giro attorno al perno (Rx·Ry·Rz), poi il piano girato di 90°
        carta.mesh.matrix
          .copy(mTrasla.makeTranslation(spinta, 0, -LARGHEZZA / 2 - 1))
          .multiply(mPerno)
          .multiply(mRx)
          .multiply(mRy)
          .multiply(mRz)
          .multiply(mPernoInv)
          .multiply(mGiro);
        carta.mesh.matrixWorldNeedsUpdate = true;
      }

      // ---------- grandezza della vista ----------
      function ridimensiona() {
        const l = elPalco.clientWidth;
        const a = elPalco.clientHeight;
        if (!l || !a) return;
        renderer.setSize(l, a, false);
        // sugli schermi grandi la galleria sale accanto al titolo (padding in alto, vedi il CSS):
        // quella striscia si aggiunge sopra, card e misure si calcolano sulla parte sotto
        const sopra = parseFloat(getComputedStyle(elPalco).paddingTop) || 0;
        const utile = a - sopra;
        const altezza = Math.max(ALTEZZA_VISTA, LARGHEZZA_MIN_VISTA / (l / utile));
        const unitaPerPx = altezza / utile;
        const mezzaL = (l / 2) * unitaPerPx;
        const centroY = CENTRO_CARD.y - ALZA_CARD;
        camera.left = CENTRO_CARD.x - mezzaL;
        camera.right = CENTRO_CARD.x + mezzaL;
        camera.top = centroY + altezza / 2 + sopra * unitaPerPx;
        camera.bottom = centroY - altezza / 2;
        camera.updateProjectionMatrix();
        sporco = true;
        avviaCiclo();
      }
      const osservaGrandezza = new ResizeObserver(ridimensiona);
      osservaGrandezza.observe(elPalco);
      ridimensiona();

      // ---------- un solo ciclo di animazione ----------

      function ciclo(ora) {
        fotogramma = 0;
        if (!visibile || document.hidden) return;
        const dt = Math.min((ora - (tempoPrecedente || ora)) / 1000, DT_MAX) || 1 / 60;
        tempoPrecedente = ora;

        const k = 1 - Math.pow(1 - SMORZA, dt * 60);
        fase += (obiettivo - fase) * k;
        if (Math.abs(obiettivo - fase) < 1e-4) fase = obiettivo;

        const velocita = menoMovimento.matches ? 0 : (fase - fasePrecedente) / dt / 6;
        const ferma = fase === obiettivo;
        uniformi.uVelocita.value = ferma ? 0 : velocita;
        const cambiata = fase !== fasePrecedente;
        fasePrecedente = fase;

        if (cambiata || sporco) {
          for (const carta of carte) posa(carta);
          renderer.render(scena, camera);
          sporco = false;
        }

        const s = indiceScelto();
        if (s !== scelta) {
          scelta = s;
          setAttuale(s);
        }

        if (!ferma || sporco) fotogramma = requestAnimationFrame(ciclo);
        else tempoPrecedente = 0;
      }

      function avviaCiclo() {
        if (!fotogramma && visibile && !document.hidden) fotogramma = requestAnimationFrame(ciclo);
      }

      const osservaVista = new IntersectionObserver(([voce]) => {
        visibile = voce.isIntersecting;
        if (visibile) {
          sporco = true;
          avviaCiclo();
        }
      });
      osservaVista.observe(elPalco);
      const cambioScheda = () => {
        if (!document.hidden) {
          sporco = true;
          avviaCiclo();
        }
      };
      document.addEventListener("visibilitychange", cambioScheda);

      // ---------- scorrimento automatico ----------
      // ogni 3,5 secondi la card successiva. Si mette in pausa mentre la usi, col mouse sopra,
      // con un certificato aperto, fuori dallo schermo; mai per chi riduce i movimenti
      const timerAuto = setInterval(() => {
        const inPausa =
          menoMovimento.matches ||
          !visibile ||
          document.hidden ||
          sopraIlMouse ||
          puntatore !== null ||
          document.querySelector("dialog[open]") ||
          performance.now() - ultimoInput < AUTO_PAUSA_MS;
        if (inPausa) return;
        obiettivo = Math.round(obiettivo) + 1;
        avviaCiclo();
      }, AUTO_OGNI_MS);
      const entra = (evento) => {
        if (evento.pointerType === "mouse") sopraIlMouse = true;
      };
      const esce = () => {
        sopraIlMouse = false;
      };

      // ---------- input ----------
      // rotella e trackpad: continui, con gli scatti limitati
      function rotella(evento) {
        evento.preventDefault();
        const unita = evento.deltaMode === 1 ? 16 : evento.deltaMode === 2 ? 400 : 1;
        const delta = Math.max(-120, Math.min(120, evento.deltaY * unita));
        // uno scatto della rotella del mouse (~100px) = circa una card; il trackpad scorre continuo
        spingi(delta * 0.0085);
      }

      let ultimoY = 0;
      let spostato = 0;
      const raggio = new THREE.Raycaster();
      const punto = new THREE.Vector2();

      function cartaSotto(evento) {
        const r = elTela.getBoundingClientRect();
        punto.set(((evento.clientX - r.left) / r.width) * 2 - 1, -((evento.clientY - r.top) / r.height) * 2 + 1);
        raggio.setFromCamera(punto, camera);
        const colpo = raggio.intersectObjects(carte.map((c) => c.mesh).filter((m) => m.visible), false)[0];
        return colpo ? colpo.object.userData.indice : null;
      }

      function giu(evento) {
        if (evento.button > 0) return;
        puntatore = evento.pointerId;
        ultimoY = evento.clientY;
        spostato = 0;
        elTela.setPointerCapture(evento.pointerId);
        clearTimeout(timerAggancio);
        preparaPdf(certificazioni[indiceScelto()].pdf);
      }

      function muovi(evento) {
        if (evento.pointerId === puntatore) {
          const dy = evento.clientY - ultimoY;
          ultimoY = evento.clientY;
          spostato += Math.abs(dy);
          // una card ogni ~22% dell'altezza della galleria; verso l'alto = card successiva
          spingi(-dy / (elPalco.clientHeight * 0.22));
          return;
        }
        if (evento.pointerType === "mouse") {
          const sotto = cartaSotto(evento);
          const apribile = sotto !== null && sotto === indiceScelto() && fase === obiettivo;
          elTela.style.cursor = apribile ? "pointer" : "grab";
          if (apribile) preparaPdf(certificazioni[sotto].pdf);
        }
      }

      function su(evento) {
        if (evento.pointerId !== puntatore) return;
        puntatore = null;
        if (elTela.hasPointerCapture(evento.pointerId)) elTela.releasePointerCapture(evento.pointerId);
        if (spostato < 6) {
          const sotto = cartaSotto(evento);
          if (sotto !== null && sotto === indiceScelto()) apri.current(sotto);
        }
        aggancia();
      }

      function annulla(evento) {
        if (evento.pointerId !== puntatore) return;
        puntatore = null;
        aggancia();
      }

      function tasto(evento) {
        const verso = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[evento.key];
        if (verso) {
          evento.preventDefault();
          obiettivo = Math.round(obiettivo) + verso;
          ultimoInput = performance.now();
          clearTimeout(timerAggancio);
          avviaCiclo();
        } else if (evento.key === "Home") {
          evento.preventDefault();
          obiettivo = Math.round(obiettivo / N) * N;
          ultimoInput = performance.now();
          avviaCiclo();
        } else if (evento.key === "Enter" || evento.key === " ") {
          evento.preventDefault();
          apri.current(indiceScelto());
        }
      }

      const alFocus = () => preparaPdf(certificazioni[indiceScelto()].pdf);

      elPalco.addEventListener("wheel", rotella, { passive: false });
      elPalco.addEventListener("pointerenter", entra);
      elPalco.addEventListener("pointerleave", esce);
      elTela.addEventListener("pointerdown", giu);
      elTela.addEventListener("pointermove", muovi);
      elTela.addEventListener("pointerup", su);
      elTela.addEventListener("pointercancel", annulla);
      elTela.addEventListener("lostpointercapture", annulla);
      elPalco.addEventListener("keydown", tasto);
      elPalco.addEventListener("focus", alFocus);

      // ---------- pulizia ----------
      return () => {
        cancelAnimationFrame(fotogramma);
        clearTimeout(timerAggancio);
        clearInterval(timerAuto);
        elPalco.removeEventListener("pointerenter", entra);
        elPalco.removeEventListener("pointerleave", esce);
        osservaGrandezza.disconnect();
        osservaVista.disconnect();
        document.removeEventListener("visibilitychange", cambioScheda);
        elPalco.removeEventListener("wheel", rotella);
        elTela.removeEventListener("pointerdown", giu);
        elTela.removeEventListener("pointermove", muovi);
        elTela.removeEventListener("pointerup", su);
        elTela.removeEventListener("pointercancel", annulla);
        elTela.removeEventListener("lostpointercapture", annulla);
        elPalco.removeEventListener("keydown", tasto);
        elPalco.removeEventListener("focus", alFocus);
        for (const c of carte) {
          c.geometria.dispose();
          c.materiale.dispose();
          c.texture.dispose();
        }
        renderer.dispose();
      };
    }

    return () => {
      annullato = true;
      pulizia();
    };
  }, [certificazioni]);

  const cert = certificazioni[attuale];

  return (
    <>
      {senzaWebgl ? (
        <ul className={styles.elenco}>
          {certificazioni.map((c, i) => (
            <li key={c.pdf}>
              <button type="button" className={styles.voce} onClick={() => apri.current(i)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={urlImmagine(c.anteprima)} alt={`${c.nome}, ${c.ente}`} loading="lazy" />
                <span className={styles.srOnly}>{t("galleria.apri")}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <section
          ref={palco}
          className={styles.palco}
          tabIndex={0}
          aria-roledescription={t("galleria.ruolo")}
          aria-label={t("galleria.istruzioni")}
        >
          <canvas ref={tela} className={styles.tela} aria-hidden="true" />
          <p className={styles.srOnly} aria-live="polite">
            {t("galleria.posizione", {
              n: attuale + 1,
              tot: certificazioni.length,
              nome: cert.nome,
              ente: cert.ente,
            })}
          </p>
          <p className={styles.suggerimento} aria-hidden="true">
            {t("galleria.suggerimento")}
          </p>
        </section>
      )}

      <ul className={styles.srOnly}>
        {certificazioni.map((c) => (
          <li key={c.pdf}>
            {c.nome}, {c.ente}: {c.descrizione}
          </li>
        ))}
      </ul>

      <VisorePdf cert={aperta} alChiudere={() => setAperta(null)} />
    </>
  );
}
