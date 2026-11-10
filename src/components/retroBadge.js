import { useSyncExternalStore } from "react";

// il punto d'incontro tra Badge e ChatBot, che stanno in parti diverse del sito.
// Il badge annuncia il suo retro solo quando React l'ha preso in carico: se la chat ci entrasse
// prima, l'HTML non corrisponderebbe più a quello del server e la pagina andrebbe in errore
let retro = null;
const ascoltatori = new Set();

export function annunciaRetro(elemento) {
  retro = elemento;
  ascoltatori.forEach((avvisa) => avvisa());
}

function ascolta(avvisa) {
  ascoltatori.add(avvisa);
  return () => ascoltatori.delete(avvisa);
}

// il retro del badge, o null nelle pagine senza badge
export function useRetroBadge() {
  return useSyncExternalStore(ascolta, () => retro, () => null);
}
