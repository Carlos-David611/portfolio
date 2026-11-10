

import { progetti } from "@/data/progetti";
import { esperienze } from "@/data/esperienze";
import { certificazioni } from "@/data/certificazioni";
import { competenze, strumenti } from "@/data/competenze";
import { contatti } from "@/data/contatti";


const MODELLO = "@cf/meta/llama-3.1-8b-instruct";

// i limiti: proteggono il tuo account da chi volesse abusarne
const MAX_MESSAGGI = 10;     // quanti messaggi della conversazione mandiamo al modello
const MAX_CARATTERI = 500;   // quanto può essere lunga una domanda
const MAX_RISPOSTA = 500;    // quanto può essere lunga una risposta (in token, circa parole)

// la "personalità" del bot e tutto quello che sa di te
const ISTRUZIONI = `Sei l'assistente virtuale del portfolio di Carlos David, UX/UI Designer e Web Designer.
Rispondi alle domande dei visitatori su Carlos: i suoi progetti, le esperienze, le certificazioni, le competenze e come contattarlo.

Regole:
- Rispondi nella lingua del visitatore (di solito italiano).
- Sii cordiale, professionale e breve: al massimo 3-4 frasi.
- Usa SOLO le informazioni nei dati qui sotto. Se una cosa non c'è, dillo con sincerità e suggerisci di contattare Carlos direttamente. Non inventare mai.
- Se il visitatore vuole contattare Carlos, lavorare con lui o chiede i suoi recapiti, scrivi per intero l'indirizzo email e il link di LinkedIn presi dai dati "contatti" (e GitHub se parla di codice). Non dire solo dove trovarli: scrivili. Poi ricorda che sono anche nella pagina Contatti del sito.
- Se ti chiedono argomenti che non riguardano Carlos o il suo lavoro, riporta gentilmente la conversazione sul portfolio.
- Parla di Carlos in terza persona.
- Scrivi solo testo semplice: niente apici inversi, asterischi o altra formattazione, perché la chat li mostrerebbe così come sono. Indirizzi email e link vanno scritti senza niente intorno.

DATI SU CARLOS:
${JSON.stringify({ progetti, esperienze,competenze, contatti })}`;

export async function POST(request) {
  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ errore: "Richiesta non valida." }, { status: 400 });
  }

  //  puliamo i messaggi: teniamo solo quelli dell'utente e del bot.
  
  const messaggi = (Array.isArray(corpo?.messaggi) ? corpo.messaggi : [])
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim() !== ""
    )
    .slice(-MAX_MESSAGGI)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CARATTERI) }));

  // l'ultimo messaggio deve essere una domanda dell'utente
  if (messaggi.length === 0 || messaggi.at(-1).role !== "user") {
    return Response.json({ errore: "Manca la domanda." }, { status: 400 });
  }

  // 3. giriamo la domanda a Cloudflare, con le istruzioni davanti
  const indirizzo = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${MODELLO}`;

  try {
    const risposta = await fetch(indirizzo, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "system", content: ISTRUZIONI }, ...messaggi],
        max_tokens: MAX_RISPOSTA,
      }),
    });

    const dati = await risposta.json();

    if (!risposta.ok || !dati.success) {
      console.error("Errore da Cloudflare:", dati.errors);
      return Response.json(
        { errore: "L'assistente non è disponibile al momento. Riprova tra poco." },
        { status: 502 }
      );
    }

    // 4. restituiamo il testo della risposta al browser
    const testo = dati.result?.response ?? "";
    return Response.json({ risposta: testo.trim() });
  } catch (errore) {
    console.error("Errore di connessione:", errore);
    return Response.json(
      { errore: "Non riesco a raggiungere l'assistente. Riprova tra poco." },
      { status: 502 }
    );
  }
}