// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // compare-1
  entry("z.liimoogen", "Lii moo gën", ["This one is better", "Celui-ci est mieux", "Este es mejor", "Das hier ist besser", "Questo è meglio"]),
  entry("z.genamag", "Kii moo gëna mag", ["This person is older", "Celui-ci est plus âgé", "Esta persona es mayor", "Diese Person ist älter", "Questa persona è più grande"], {
    note: [
      "gëna before an adjective means “more”: gëna mag “older”, gëna yomb “cheaper”. You'll also see it written gën a.",
      "gëna devant un adjectif veut dire « plus » : gëna mag « plus âgé », gëna yomb « moins cher ». On l'écrit aussi gën a.",
      "gëna delante de un adjetivo significa «más»: gëna mag «mayor», gëna yomb «más barato». También se escribe gën a.",
      "gëna vor einem Adjektiv heißt „mehr“: gëna mag „älter“, gëna yomb „billiger“. Man schreibt es auch gën a.",
      "gëna davanti a un aggettivo vuol dire «più»: gëna mag «più grande», gëna yomb «più economico». Si scrive anche gën a.",
    ],
  }),
  entry("z.gudd", "Dafa gudd", ["It's long", "C'est long", "Es largo", "Das ist lang", "È lungo"]),
  entry("z.gatt", "Dafa gàtt", ["It's short", "C'est court", "Es corto", "Das ist kurz", "È corto"]),
  entry("z.rafetlool", "Dafa rafet lool", ["It's really beautiful", "C'est vraiment beau", "Es precioso", "Das ist wunderschön", "È bellissimo"]),

  // compare-2
  entry("z.ndakaarumag", "Ndakaaru dafa mag", ["Dakar is big", "Dakar est grand", "Dakar es grande", "Dakar ist groß", "Dakar è grande"]),
  entry("z.dekkbindaw", "Dëkk bi dafa ndaw", ["The town is small", "La ville est petite", "El pueblo es pequeño", "Der Ort ist klein", "Il paese è piccolo"]),
  entry("z.genatang", "Tey dafa gëna tàng", ["It's hotter today", "Il fait plus chaud aujourd'hui", "Hoy hace más calor", "Heute ist es heißer", "Oggi fa più caldo"]),
  entry("z.genayomb", "Lii moo gëna yomb", ["This one is cheaper", "Celui-ci est moins cher", "Este es más barato", "Das hier ist billiger", "Questo costa meno"]),
  entry("z.genaseer", "Lii moo gëna seer", ["This one is more expensive", "Celui-ci est plus cher", "Este es más caro", "Das hier ist teurer", "Questo costa di più"]),
];

export const unit: Unit = {
  id: "u24",
  glyph: "spark",
  tone: "sun",
  title: tx(["Comparing and describing", "Comparer et décrire", "Comparar y describir", "Vergleichen und beschreiben", "Confrontare e descrivere"]),
  lessons: [
    {
      id: "compare-1",
      title: tx(["Better and more", "Mieux et plus", "Mejor y más", "Besser und mehr", "Meglio e più"]),
      tip: tx([
        "Dafa + adjective describes something: Dafa gudd “it's long”. moo picks one out: Lii moo gën “this one (and not the other) is better”.",
        "Dafa + adjectif décrit quelque chose : Dafa gudd « c'est long ». moo désigne l'un parmi d'autres : Lii moo gën « c'est celui-ci qui est mieux ».",
        "Dafa + adjetivo describe algo: Dafa gudd «es largo». moo señala uno entre otros: Lii moo gën «este (y no el otro) es mejor».",
        "Dafa + Adjektiv beschreibt etwas: Dafa gudd „das ist lang“. moo hebt eines hervor: Lii moo gën „genau das hier ist besser“.",
        "Dafa + aggettivo descrive qualcosa: Dafa gudd «è lungo». moo ne indica uno tra tanti: Lii moo gën «è questo (e non l'altro) a essere meglio».",
      ]),
      entries: ["z.liimoogen", "z.genamag", "z.gudd", "z.gatt", "z.rafetlool", "r.dafarafet"],
      exercises: [
        { type: "pick_meaning", entry: "z.liimoogen" },
        { type: "pick_meaning", entry: "z.gudd" },
        { type: "match", entries: ["z.gudd", "z.gatt", "z.rafetlool", "z.liimoogen"] },
        { type: "listen", entry: "z.genamag" },
        { type: "pick_wolof", entry: "z.gatt" },
        { type: "fill_blank", entry: "z.rafetlool", blank: 2, options: ["lool", "tuuti", "rekk"] },
        { type: "build", entry: "z.genamag", distractors: ["lii", "dafa"] },
        { type: "pick_meaning", entry: "z.genamag" },
        { type: "pick_wolof", entry: "z.rafetlool" },
        { type: "listen", entry: "z.liimoogen" },
        { type: "type_wolof", entry: "z.gudd" },
        { type: "speak", entry: "z.liimoogen" },
      ],
    },
    {
      id: "compare-2",
      title: tx(["Places, weather and prices", "Lieux, météo et prix", "Lugares, tiempo y precios", "Orte, Wetter und Preise", "Luoghi, tempo e prezzi"]),
      tip: tx([
        "Comparing prices is part of every market visit: point and say Lii moo gëna yomb? to ask for the cheaper one.",
        "Comparer les prix fait partie de chaque visite au marché : montrez et dites Lii moo gëna yomb ? pour demander le moins cher.",
        "Comparar precios es parte de cada visita al mercado: señala y di ¿Lii moo gëna yomb? para pedir el más barato.",
        "Preise vergleichen gehört zu jedem Marktbesuch: zeig darauf und frag Lii moo gëna yomb?, um das Billigere zu finden.",
        "Confrontare i prezzi fa parte di ogni visita al mercato: indica e chiedi Lii moo gëna yomb? per trovare quello più economico.",
      ]),
      entries: ["z.ndakaarumag", "z.dekkbindaw", "z.genatang", "z.genayomb", "z.genaseer", "v.sedd"],
      exercises: [
        { type: "pick_meaning", entry: "z.ndakaarumag" },
        { type: "pick_meaning", entry: "z.genatang" },
        { type: "match", entries: ["z.ndakaarumag", "z.dekkbindaw", "z.genatang", "v.sedd"] },
        { type: "listen", entry: "z.genayomb" },
        { type: "pick_wolof", entry: "z.genaseer" },
        { type: "fill_blank", entry: "z.genayomb", blank: 3, options: ["yomb", "seer", "mag"] },
        { type: "build", entry: "z.dekkbindaw", distractors: ["mag", "lii"] },
        { type: "pick_meaning", entry: "z.genaseer" },
        { type: "pick_wolof", entry: "z.dekkbindaw" },
        { type: "listen", entry: "z.ndakaarumag" },
        { type: "type_wolof", entry: "z.genatang" },
        { type: "speak", entry: "z.genayomb" },
      ],
    },
  ],
};
