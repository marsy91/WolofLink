// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Writes the printable pocket phrasebook (Survival Wolof + pronunciation +
 * etiquette) in every interface language: docs/print/pocket-phrasebook-<lang>.html.
 * Open one in a browser and print it, or "Save as PDF" (A4, two columns).
 *
 *   npx tsx scripts/print/pocket-phrasebook.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { course } from "../../src/content/course";
import { SURVIVAL_GROUPS, SURVIVAL_TITLE } from "../../src/content/survival";
import { UI_LANGS, type Translations, type UiLang } from "../../src/content/types";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const tr = (t: Translations, lang: UiLang) => t[lang] ?? t.en;

const T: Record<string, Translations> = {
  subtitle: {
    en: "The 100 words and phrases to know first",
    fr: "Les 100 mots et phrases à connaître en premier",
    es: "Las 100 palabras y frases que hay que saber primero",
    de: "Die 100 Wörter und Sätze, die man zuerst braucht",
    it: "Le 100 parole e frasi da sapere per prime",
  },
  sounds: { en: "How to read Wolof", fr: "Comment lire le wolof", es: "Cómo leer el wolof", de: "Wolof lesen", it: "Come leggere il wolof" },
  etiquette: {
    en: "Etiquette in brief",
    fr: "Le savoir-vivre en bref",
    es: "Buenos modales en breve",
    de: "Umgangsformen in Kürze",
    it: "Le buone maniere in breve",
  },
  footer: {
    en: "WolofLink · Hear every phrase, practise and learn more in the app. Spelling: standard Senegalese (CLAD) orthography.",
    fr: "WolofLink · Écoutez chaque phrase, entraînez-vous et apprenez-en plus dans l'application. Orthographe : standard sénégalais (CLAD).",
    es: "WolofLink · Escucha cada frase, practica y aprende más en la app. Ortografía: estándar senegalés (CLAD).",
    de: "WolofLink · Jeden Satz anhören, üben und mehr lernen in der App. Schreibweise: senegalesischer Standard (CLAD).",
    it: "WolofLink · Ascolta ogni frase, esercitati e impara di più nell'app. Ortografia: standard senegalese (CLAD).",
  },
};

/** Letters that surprise newcomers. */
const SOUNDS: [string, Translations][] = [
  ["c", { en: "ch as in church", fr: "tch comme dans tchèque", es: "ch como en chico", de: "tsch wie in Tschüss", it: "c come in ciao" }],
  ["j", { en: "j as in jam", fr: "dj comme dans djembé", es: "y como en yo, más fuerte (dj)", de: "dsch wie in Dschungel", it: "g come in gelato" }],
  ["x", { en: "throaty h, as in Scottish loch", fr: "comme la jota espagnole, du fond de la gorge", es: "j como en jamón", de: "ch wie in Bach", it: "suono di gola, come la jota spagnola" }],
  ["ñ", { en: "ny as in canyon", fr: "gn comme dans montagne", es: "ñ como en niño", de: "nj wie in Champagner", it: "gn come in gnocchi" }],
  ["ŋ", { en: "ng as in sing", fr: "ng comme dans parking", es: "ng como en inglés sing", de: "ng wie in singen", it: "ng come nell'inglese sing" }],
  ["ë", { en: "u as in but", fr: "e comme dans le", es: "vocal neutra, como la e átona", de: "e wie in bitte", it: "vocale neutra, come la e muta" }],
  ["aa, ee…", { en: "doubled vowels are long", fr: "voyelle doublée = voyelle longue", es: "vocal doble = vocal larga", de: "Doppelvokal = langer Vokal", it: "vocale doppia = vocale lunga" }],
  ["u", { en: "oo as in food", fr: "ou comme dans fou", es: "u como en uno", de: "u wie in gut", it: "u come in uno" }],
];

const ETIQUETTE = ["etiquette-1", "etiquette-2", "etiquette-3"];

function page(lang: UiLang): string {
  const groups = SURVIVAL_GROUPS.map((g) => {
    const rows = g.ids
      .map((id) => course.entries[id])
      .filter((e) => !!e)
      .map((e) => `<tr><td class="wo" lang="wo">${esc(e!.wo)}</td><td>${esc(tr(e!.tr, lang))}</td></tr>`)
      .join("");
    return `<section><h2>${esc(tr(g.title, lang))}</h2><table>${rows}</table></section>`;
  }).join("");
  const sounds = SOUNDS.map(([l, d]) => `<tr><td class="wo">${esc(l)}</td><td>${esc(tr(d, lang))}</td></tr>`).join("");
  const tips = ETIQUETTE.map((id) => {
    const found = course.units.flatMap((u) => u.lessons).find((l) => l.id === id);
    return found?.tip ? `<li><b>${esc(tr(found.title, lang))}.</b> ${esc(tr(found.tip, lang))}</li>` : "";
  }).join("");
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>WolofLink — ${esc(tr(SURVIVAL_TITLE, lang))}</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font: 10pt/1.35 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1b1f3b; margin: 0; }
  header { border-bottom: 3px solid #c8553d; margin-bottom: 8px; padding-bottom: 4px; }
  h1 { font-size: 20pt; margin: 0; } header p { margin: 2px 0 0; color: #555; }
  main { columns: 2; column-gap: 9mm; }
  section { break-inside: avoid; margin-bottom: 7px; }
  h2 { font-size: 11pt; margin: 6px 0 3px; color: #c8553d; text-transform: uppercase; letter-spacing: .04em; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 1.6px 4px 1.6px 0; vertical-align: top; border-bottom: 1px solid #eee3d3; }
  td.wo { font-weight: 700; width: 48%; }
  ul { padding-left: 14px; margin: 2px 0; } li { margin-bottom: 4px; }
  footer { margin-top: 8px; font-size: 8pt; color: #777; border-top: 1px solid #ddd; padding-top: 4px; }
</style></head><body>
<header><h1>${esc(tr(SURVIVAL_TITLE, lang))}</h1><p>${esc(tr(T.subtitle!, lang))}</p></header>
<main>${groups}
<section><h2>${esc(tr(T.sounds!, lang))}</h2><table>${sounds}</table></section>
<section><h2>${esc(tr(T.etiquette!, lang))}</h2><ul>${tips}</ul></section>
</main>
<footer>${esc(tr(T.footer!, lang))}</footer>
</body></html>
`;
}

mkdirSync("docs/print", { recursive: true });
for (const lang of UI_LANGS) {
  writeFileSync(`docs/print/pocket-phrasebook-${lang}.html`, page(lang));
}
console.log(`Wrote docs/print/pocket-phrasebook-{${UI_LANGS.join(",")}}.html`);
