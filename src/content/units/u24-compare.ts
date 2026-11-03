// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, line, question, tx } from "./helpers";

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
  story: {
    id: "story-compare",
    title: tx(["Which one is cheaper?", "Lequel est moins cher ?", "¿Cuál es más barato?", "Welches ist billiger?", "Quale costa meno?"]),
    lines: [
      line("Fatou", "Lii moo gëna yomb?", ["Is this one cheaper?", "Celui-ci est moins cher ?", "¿Este es más barato?", "Ist das hier billiger?", "Questo costa meno?"]),
      line("Moodu", "Déedéet, lii moo gëna seer.", ["No, this one is more expensive.", "Non, celui-ci est plus cher.", "No, este es más caro.", "Nein, das hier ist teurer.", "No, questo costa di più."]),
      line("Fatou", "Dafa seer lool! Mën nga ko wàññi?", ["It's very expensive! Can you lower the price?", "C'est très cher ! Tu peux baisser le prix ?", "¡Es muy caro! ¿Puedes bajar el precio?", "Das ist sehr teuer! Kannst du mit dem Preis runtergehen?", "È molto caro! Puoi abbassare il prezzo?"]),
      line("Moodu", "Juróomi téeméer la.", ["It's five hundred.", "C'est cinq cents.", "Son quinientos.", "Das macht fünfhundert.", "Sono cinquecento."]),
      line("Fatou", "Dafa rafet lool. Jërëjëf!", ["It's really beautiful. Thank you!", "C'est vraiment beau. Merci !", "Es precioso. ¡Gracias!", "Das ist wunderschön. Danke!", "È bellissimo. Grazie!"]),
      line("Moodu", "Ba beneen yoon!", ["See you next time!", "À la prochaine !", "¡Hasta la próxima!", "Bis zum nächsten Mal!", "Alla prossima!"]),
    ],
    questions: [
      question(
        ["Is the first one cheaper?", "Le premier est-il moins cher ?", "¿El primero es más barato?", "Ist das erste billiger?", "Il primo costa meno?"],
        ["No, it's more expensive", "Non, il est plus cher", "No, es más caro", "Nein, es ist teurer", "No, costa di più"],
        ["Yes, it's cheaper", "Oui, il est moins cher", "Sí, es más barato", "Ja, es ist billiger", "Sì, costa meno"],
        ["It's free", "C'est gratuit", "Es gratis", "Es ist umsonst", "È gratis"],
      ),
      question(
        ["What price does Moodu give?", "Quel prix Moodu donne-t-il ?", "¿Qué precio da Moodu?", "Welchen Preis nennt Moodu?", "Che prezzo dice Moodu?"],
        ["Five hundred", "Cinq cents", "Quinientos", "Fünfhundert", "Cinquecento"],
        ["Two thousand", "Deux mille", "Dos mil", "Zweitausend", "Duemila"],
        ["Three hundred", "Trois cents", "Trescientos", "Dreihundert", "Trecento"],
      ),
      question(
        ["What does Fatou think of it?", "Qu'en pense Fatou ?", "¿Qué opina Fatou?", "Was hält Fatou davon?", "Cosa ne pensa Fatou?"],
        ["It's really beautiful", "C'est vraiment beau", "Es precioso", "Es ist wunderschön", "È bellissimo"],
        ["It's too short", "C'est trop court", "Es demasiado corto", "Es ist zu kurz", "È troppo corto"],
        ["It's too small", "C'est trop petit", "Es demasiado pequeño", "Es ist zu klein", "È troppo piccolo"],
      ),
    ],
  },
};
