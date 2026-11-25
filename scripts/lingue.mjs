// Controlla le traduzioni del sito.
//
//   npm run lingue               controlla tutto
//   npm run lingue -- --conferma le traduzioni segnalate come vecchie vanno bene così
//
// Parte anche da solo prima di ogni build (npm run build): con un errore la build si ferma.
//
// ERRORI: un testo che manca in una lingua, una chiave scritta male nel codice, un {segnaposto} diverso
// AVVISI: l'italiano è cambiato ma la traduzione no, un testo che nessuno usa
//
// Per accorgersi dei cambi tiene un'impronta di ogni testo in src/gestione-lingua/stato.json (si aggiorna da solo).

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const radice = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(radice, "src");
const FILE_STATO = path.join(src, "gestione-lingua", "stato.json");
const inBuild = process.argv.includes("--build");
const conferma = process.argv.includes("--conferma");

const LINGUE = ["it", "en", "de", "es"];
const errori = [];
const avvisi = [];
const testi = {}; // "menu.progetti" → { it, en, de, es }

const importa = (file) =>
  import("data:text/javascript;base64," + Buffer.from(fs.readFileSync(file, "utf8")).toString("base64"));

// ---------- 1. i testi dell'interfaccia ----------
for (const lingua of LINGUE) {
  const file = path.join(src, "gestione-lingua", "testi", `${lingua}.json`);
  try {
    const contenuto = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const [sezione, voci] of Object.entries(contenuto))
      for (const [nome, testo] of Object.entries(voci)) (testi[`${sezione}.${nome}`] ??= {})[lingua] = testo;
  } catch (errore) {
    errori.push(`${lingua}.json non si legge (forse manca una virgola o una virgoletta): ${errore.message}`);
  }
}
const chiaviInterfaccia = Object.keys(testi);

// ---------- 2. i testi nei dati ----------
function cerca(dato, dove) {
  if (Array.isArray(dato)) {
    dato.forEach((voce, i) => cerca(voce, `${dove}[${nomeVoce(voce) ?? i}]`));
  } else if (dato && typeof dato === "object") {
    if (LINGUE.some((l) => l in dato)) testi[dove] = dato;
    else for (const [k, v] of Object.entries(dato)) cerca(v, `${dove}.${k}`);
  }
}
// un nome riconoscibile al posto del numero: spostando le voci l'impronta resta la sua
function nomeVoce(voce) {
  if (!voce || typeof voce !== "object") return null;
  if ("it" in voce) return null;
  const n = voce.slug ?? voce.pdf ?? (voce.azienda && `${voce.azienda} ${voce.inizio}`) ?? voce.nome;
  return typeof n === "string" ? n : (n?.it ?? null);
}
for (const file of fs.readdirSync(path.join(src, "data"))) {
  if (!file.endsWith(".js")) continue;
  try {
    for (const [nome, dato] of Object.entries(await importa(path.join(src, "data", file)))) cerca(dato, `data/${nome}`);
  } catch (errore) {
    errori.push(`data/${file} non si legge: ${errore.message}`);
  }
}

// ---------- 3. mancano lingue? segnaposto uguali? ----------
const segnaposto = (testo) => [...testo.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join();
for (const [chiave, voci] of Object.entries(testi)) {
  for (const lingua of LINGUE) {
    if (typeof voci[lingua] !== "string" || !voci[lingua].trim()) errori.push(`${chiave}: manca in "${lingua}"`);
    else if (typeof voci.it === "string" && segnaposto(voci[lingua]) !== segnaposto(voci.it))
      errori.push(`${chiave}: in "${lingua}" i {segnaposto} sono diversi dall'italiano`);
  }
}

// ---------- 4. le chiavi usate nel codice esistono? ----------
function fileJs(cartella) {
  return fs.readdirSync(cartella, { withFileTypes: true }).flatMap((f) => {
    const p = path.join(cartella, f.name);
    return f.isDirectory() ? fileJs(p) : f.name.endsWith(".js") ? [p] : [];
  });
}
const usate = new Set();
const prefissi = new Set(); // chiavi composte, es. t(`menu.${pagina}`): vale tutta la sezione
for (const file of fileJs(src)) {
  if (file.startsWith(path.join(src, "data"))) continue;
  // i commenti non contano
  const codice = fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "");
  for (const m of codice.matchAll(/\bt\(([^()]*)/g)) {
    for (const k of m[1].matchAll(/"([a-z]\w*\.\w+)"/g)) {
      usate.add(k[1]);
      if (!testi[k[1]]) errori.push(`${path.relative(radice, file)}: usa "${k[1]}", che non esiste nei testi`);
    }
    for (const k of m[1].matchAll(/`([a-z]\w*)\.\w*\$\{/g)) prefissi.add(k[1]);
  }
}
for (const chiave of chiaviInterfaccia)
  if (!usate.has(chiave) && !prefissi.has(chiave.split(".")[0])) avvisi.push(`${chiave}: nessuno lo usa, si può togliere`);

// ---------- 5. l'italiano è cambiato e la traduzione no? ----------
const impronta = (testo) => createHash("sha1").update(String(testo)).digest("hex").slice(0, 8);
let stato = {};
try {
  stato = JSON.parse(fs.readFileSync(FILE_STATO, "utf8"));
} catch {}
const nuovoStato = {};
for (const chiave of Object.keys(testi).sort()) {
  const ora = Object.fromEntries(LINGUE.map((l) => [l, impronta(testi[chiave][l])]));
  const prima = stato[chiave];
  if (!prima || conferma || prima.it === ora.it) {
    nuovoStato[chiave] = ora;
    continue;
  }
  const vecchie = LINGUE.filter((l) => l !== "it" && prima[l] === ora[l]);
  if (vecchie.length) {
    avvisi.push(`${chiave}: l'italiano è cambiato, da aggiornare in: ${vecchie.join(", ")}`);
    // si ricorda l'italiano vecchio finché non sono aggiornate tutte
    nuovoStato[chiave] = prima;
  } else nuovoStato[chiave] = ora;
}
if (!inBuild && !errori.length) fs.writeFileSync(FILE_STATO, JSON.stringify(nuovoStato, null, 1) + "\n");

// ---------- il risultato ----------
for (const a of avvisi) console.warn("  avviso  " + a);
for (const e of errori) console.error("  ERRORE  " + e);
if (errori.length) {
  console.error(`\nTraduzioni: ${errori.length} errori da correggere.`);
  process.exit(1);
}
console.log(`Traduzioni a posto: ${Object.keys(testi).length} testi in ${LINGUE.length} lingue${avvisi.length ? `, ${avvisi.length} avvisi` : ""}.`);
if (avvisi.some((a) => a.includes("da aggiornare")) && !inBuild)
  console.log("Se le traduzioni segnalate vanno già bene: npm run lingue -- --conferma");
