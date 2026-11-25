// Trasforma i testi di una lingua nella funzione t:
// t("home.saluto") → "Ciao, sono"
// t("galleria.posizione", { n: 1, tot: 5 }): i nomi tra graffe vengono sostituiti
export function creaT(testi) {
  return (chiave, valori) => {
    const [sezione, nome] = chiave.split(".");
    const testo = testi[sezione]?.[nome] ?? chiave;
    return valori ? testo.replace(/\{(\w+)\}/g, (tutto, v) => valori[v] ?? tutto) : testo;
  };
}

// I dati (data/*.js): dove trova { it, en, de, es } tiene solo il testo nella lingua chiesta
export function scegliLingua(dato, lingua) {
  if (Array.isArray(dato)) return dato.map((voce) => scegliLingua(voce, lingua));
  if (dato && typeof dato === "object") {
    if ("it" in dato) return dato[lingua] ?? dato.it;
    return Object.fromEntries(Object.entries(dato).map(([k, v]) => [k, scegliLingua(v, lingua)]));
  }
  return dato;
}
