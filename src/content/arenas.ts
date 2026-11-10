// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Arenas: a journey through Senegal unlocked with duel trophies (one per entry answered
 * right, so the last arena means nearly every word), from Dakar to
 * Casamance. Each place has its own colours, a short fact and a few course words
 * (existing entries with audio, so nothing new needs reviewing). Pure, tested.
 */
import { course } from "./course";
import { tx } from "./units/helpers";
import type { Translations } from "./types";

export interface Arena {
  id: string;
  emoji: string;
  name: string;
  /** Trophies needed to reach it (from share × TROPHY_MAX). */
  trophies: number;
  /** Trophies needed to reach it, as a share of all course entries (one trophy per entry). */
  share: number;
  /** Two colours for the card gradient. */
  colors: [string, string];
  fact: Translations;
  words: string[];
}

const ARENA_LIST: Omit<Arena, "trophies">[] = [
  {
    id: "dakar",
    emoji: "🌊",
    name: "Dakar",
    share: 0,
    colors: ["#1d2550", "#0f6e72"],
    fact: tx([
      "The capital sits on the Cap-Vert peninsula, the westernmost point of mainland Africa.",
      "La capitale est sur la presqu'île du Cap-Vert, le point le plus à l'ouest de l'Afrique continentale.",
      "La capital está en la península de Cabo Verde, el punto más occidental de África continental.",
      "Die Hauptstadt liegt auf der Halbinsel Cap-Vert, dem westlichsten Punkt des afrikanischen Festlands.",
      "La capitale si trova sulla penisola di Capo Verde, il punto più occidentale dell'Africa continentale.",
    ]),
    words: ["l.geej", "a.jant"],
  },
  {
    id: "thies",
    emoji: "🚂",
    name: "Thiès",
    share: 0.07,
    colors: ["#7a3b69", "#b9481f"],
    fact: tx([
      "A railway town, also known for its tapestry workshops.",
      "Une ville du chemin de fer, connue aussi pour ses manufactures de tapisseries.",
      "Una ciudad ferroviaria, conocida también por sus talleres de tapices.",
      "Eine Eisenbahnstadt, bekannt auch für ihre Wandteppich-Werkstätten.",
      "Una città ferroviaria, nota anche per i suoi laboratori di arazzi.",
    ]),
    words: ["s.saxaar", "v.ligeey"],
  },
  {
    id: "touba",
    emoji: "🕌",
    name: "Touba",
    share: 0.15,
    colors: ["#0a4c4f", "#2c3672"],
    fact: tx([
      "The holy city of the Mouride brotherhood, founded by Cheikh Ahmadou Bamba, with its great mosque.",
      "La ville sainte de la confrérie mouride, fondée par Cheikh Ahmadou Bamba, avec sa grande mosquée.",
      "La ciudad santa de la cofradía muridí, fundada por Cheikh Ahmadou Bamba, con su gran mezquita.",
      "Die heilige Stadt der Muriden-Bruderschaft, gegründet von Scheich Ahmadou Bamba, mit ihrer großen Moschee.",
      "La città santa della confraternita muride, fondata da Cheikh Ahmadou Bamba, con la sua grande moschea.",
    ]),
    words: ["e.julli"],
  },
  {
    id: "saint-louis",
    emoji: "🌉",
    name: "Saint-Louis",
    share: 0.25,
    colors: ["#2c3672", "#c7891d"],
    fact: tx([
      "An island city on the Senegal River and a UNESCO World Heritage site; it was the capital of Senegal until 1957.",
      "Une ville-île sur le fleuve Sénégal, inscrite au patrimoine mondial de l'UNESCO ; elle fut la capitale du Sénégal jusqu'en 1957.",
      "Una ciudad isla en el río Senegal, Patrimonio de la Humanidad de la UNESCO; fue la capital de Senegal hasta 1957.",
      "Eine Inselstadt am Senegal-Fluss und UNESCO-Welterbe; bis 1957 war sie die Hauptstadt Senegals.",
      "Una città-isola sul fiume Senegal, patrimonio UNESCO; è stata la capitale del Senegal fino al 1957.",
    ]),
    words: ["a.dex", "f.jen"],
  },
  {
    id: "saloum",
    emoji: "🛶",
    name: "Sine-Saloum",
    share: 0.37,
    colors: ["#0b4a2b", "#0f6e72"],
    fact: tx([
      "A delta of mangroves and islands, explored by pirogue, and a UNESCO World Heritage site.",
      "Un delta de mangroves et d'îles, qu'on explore en pirogue, inscrit au patrimoine mondial de l'UNESCO.",
      "Un delta de manglares e islas que se recorre en piragua, Patrimonio de la Humanidad de la UNESCO.",
      "Ein Delta aus Mangroven und Inseln, das man mit der Piroge erkundet, und UNESCO-Welterbe.",
      "Un delta di mangrovie e isole, da esplorare in piroga, patrimonio mondiale dell'UNESCO.",
    ]),
    words: ["l.gaal", "f.ceebujen"],
  },
  {
    id: "tambacounda",
    emoji: "🦁",
    name: "Tambacounda",
    share: 0.5,
    colors: ["#94600f", "#b9481f"],
    fact: tx([
      "The gateway to Niokolo-Koba National Park, home to lions, hippos and chimpanzees.",
      "La porte du parc national du Niokolo-Koba, où vivent lions, hippopotames et chimpanzés.",
      "La puerta del Parque Nacional de Niokolo-Koba, hogar de leones, hipopótamos y chimpancés.",
      "Das Tor zum Nationalpark Niokolo-Koba mit Löwen, Flusspferden und Schimpansen.",
      "La porta del Parco nazionale del Niokolo-Koba, dove vivono leoni, ippopotami e scimpanzé.",
    ]),
    words: ["a.gaynde", "l.tali"],
  },
  {
    id: "kedougou",
    emoji: "⛰️",
    name: "Kédougou",
    share: 0.67,
    colors: ["#5b3a1a", "#0b4a2b"],
    fact: tx([
      "Hills, waterfalls and the Bassari Country, whose villages are a UNESCO World Heritage site.",
      "Des collines, des cascades et le pays Bassari, dont les villages sont inscrits au patrimoine mondial de l'UNESCO.",
      "Colinas, cascadas y el país Bassari, cuyos pueblos son Patrimonio de la Humanidad de la UNESCO.",
      "Hügel, Wasserfälle und das Bassari-Land, dessen Dörfer UNESCO-Welterbe sind.",
      "Colline, cascate e il paese Bassari, i cui villaggi sono patrimonio mondiale dell'UNESCO.",
    ]),
    words: ["t.nawet", "l.dekk"],
  },
  {
    id: "casamance",
    emoji: "🌴",
    name: "Casamance",
    share: 0.89,
    colors: ["#00853f", "#c7891d"],
    fact: tx([
      "The green south: rice fields, palm groves, the Casamance River and long beaches.",
      "Le sud verdoyant : rizières, palmeraies, le fleuve Casamance et de longues plages.",
      "El sur verde: arrozales, palmerales, el río Casamance y largas playas.",
      "Der grüne Süden: Reisfelder, Palmenhaine, der Casamance-Fluss und lange Strände.",
      "Il sud verde: risaie, palmeti, il fiume Casamance e lunghe spiagge.",
    ]),
    words: ["f.ceeb", "f.mango"],
  },
];

/** The most trophies anyone can have: one per course entry answered right in a duel. */
export const TROPHY_MAX = Object.keys(course.entries).length;

/** Arenas with their trophy thresholds; they stretch as new units add entries. */
export const ARENAS: Arena[] = ARENA_LIST.map((a) => ({ ...a, trophies: Math.round(a.share * TROPHY_MAX) }));

export interface ArenaProgress {
  arena: Arena;
  index: number;
  next: Arena | null;
  /** 0–1 towards the next arena (1 at the last one). */
  toNext: number;
}

export function arenaFor(trophies: number): ArenaProgress {
  let index = 0;
  for (let i = 0; i < ARENAS.length; i++) if (trophies >= ARENAS[i]!.trophies) index = i;
  const arena = ARENAS[index]!;
  const next = ARENAS[index + 1] ?? null;
  const toNext = next ? Math.min(1, Math.max(0, (trophies - arena.trophies) / (next.trophies - arena.trophies))) : 1;
  return { arena, index, next, toNext };
}
