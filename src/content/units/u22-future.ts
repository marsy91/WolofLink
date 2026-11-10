// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // future-1
  entry("u.dinaadem", "Dinaa dem Ndakaaru suba", ["I'll go to Dakar tomorrow", "J'irai à Dakar demain", "Iré a Dakar mañana", "Ich fahre morgen nach Dakar", "Domani andrò a Dakar"]),
  entry("u.dingaanew", "Ndax dinga ñëw?", ["Will you come?", "Est-ce que tu viendras ?", "¿Vendrás?", "Kommst du?", "Verrai?"]),
  entry("u.dumadem", "Duma dem", ["I won't go", "Je n'irai pas", "No iré", "Ich gehe nicht hin", "Non ci andrò"]),
  entry("u.dinanugis", "Dinañu gis", ["We'll see each other", "On se verra", "Nos veremos", "Wir sehen uns", "Ci vedremo"]),
  entry("u.dinaalawoo", "Dinaa la woo", ["I'll call you", "Je t'appellerai", "Te llamaré", "Ich rufe dich an", "Ti chiamerò"]),

  // future-2
  entry("u.basuba", "Ba suba", ["See you tomorrow", "À demain", "Hasta mañana", "Bis morgen", "A domani"]),
  entry("u.suyalla", "Su Yàlla soobee", ["God willing", "Si Dieu le veut", "Si Dios quiere", "So Gott will", "Se Dio vuole"], {
    note: [
      "You'll hear it after almost any plan. Many people also say Inshallah.",
      "On l'entend après presque chaque projet. Beaucoup disent aussi Inch'Allah.",
      "Se oye después de casi cualquier plan. Mucha gente también dice Inshallah.",
      "Man hört es nach fast jedem Plan. Viele sagen auch Inschallah.",
      "Si sente dopo quasi ogni progetto. Molti dicono anche Inshallah.",
    ],
  }),
  entry("u.yaakaar", "Yaakaar naa ne dinga ñëw", ["I hope you'll come", "J'espère que tu viendras", "Espero que vengas", "Ich hoffe, du kommst", "Spero che verrai"], {
    note: [
      "yaakaar means “to hope”; ne (“to say”) introduces what you hope, like “that”: Yaakaar naa ne… “I hope that…”.",
      "yaakaar veut dire « espérer » ; ne (« dire ») introduit ce qu'on espère, comme « que » : Yaakaar naa ne… « j'espère que… ».",
      "yaakaar significa «esperar»; ne («decir») introduce lo que esperas, como «que»: Yaakaar naa ne… «espero que…».",
      "yaakaar heißt „hoffen“; ne („sagen“) leitet ein, was man hofft, wie „dass“: Yaakaar naa ne… „ich hoffe, dass…“.",
      "yaakaar vuol dire «sperare»; ne («dire») introduce ciò che speri, come «che»: Yaakaar naa ne… «spero che…».",
    ],
  }),
  entry("u.menumatey", "Mënuma tey, waaye suba mën naa", ["I can't today, but tomorrow I can", "Je ne peux pas aujourd'hui, mais demain je peux", "Hoy no puedo, pero mañana sí", "Heute kann ich nicht, aber morgen schon", "Oggi non posso, ma domani sì"]),
  entry("u.dumanew", "Duma ñëw tey", ["I won't come today", "Je ne viendrai pas aujourd'hui", "Hoy no vendré", "Ich komme heute nicht", "Oggi non vengo"]),
];

export const unit: Unit = {
  id: "u22",
  glyph: "compass",
  tone: "sea",
  title: tx(["Plans and the future", "Projets et futur", "Planes y futuro", "Pläne und Zukunft", "Progetti e futuro"]),
  lessons: [
    {
      id: "future-1",
      title: tx(["What I will do", "Ce que je ferai", "Lo que haré", "Was ich machen werde", "Cosa farò"]),
      tip: tx([
        "For the future, start with dinaa (I will), dinga (you will) or dinañu (we will). “Won't” is duma: Duma dem.",
        "Pour le futur, commencez par dinaa (je vais), dinga (tu vas) ou dinañu (nous allons). « Ne … pas » se dit duma : Duma dem.",
        "Para el futuro, empieza con dinaa (yo), dinga (tú) o dinañu (nosotros). «No» en futuro es duma: Duma dem.",
        "Für die Zukunft beginnst du mit dinaa (ich werde), dinga (du wirst) oder dinañu (wir werden). „Nicht“ heißt duma: Duma dem.",
        "Per il futuro inizia con dinaa (io), dinga (tu) o dinañu (noi). «Non» al futuro è duma: Duma dem.",
      ]),
      entries: ["u.dinaadem", "u.dingaanew", "u.dumadem", "u.dinanugis", "u.dinaalawoo", "v.dinaanew"],
      exercises: [
        { type: "pick_meaning", entry: "u.dinaadem" },
        { type: "pick_meaning", entry: "u.dumadem" },
        { type: "listen", entry: "u.dingaanew" },
        { type: "match", entries: ["u.dumadem", "u.dinanugis", "u.dinaalawoo", "v.dinaanew"] },
        { type: "pick_wolof", entry: "u.dinanugis" },
        { type: "fill_blank", entry: "u.dinaadem", blank: 3, options: ["suba", "démb", "léegi"] },
        { type: "build", entry: "u.dinaadem", distractors: ["démb", "naa"] },
        { type: "pick_meaning", entry: "u.dinaalawoo" },
        { type: "listen", entry: "u.dinanugis" },
        { type: "pick_wolof", entry: "u.dingaanew" },
        { type: "type_wolof", entry: "u.dumadem" },
        { type: "speak", entry: "u.dinaalawoo" },
      ],
    },
    {
      id: "future-2",
      title: tx(["Arranging to meet", "Fixer un rendez-vous", "Quedar con alguien", "Sich verabreden", "Darsi appuntamento"]),
      tip: tx([
        "waaye means “but”: Mënuma tey, waaye suba mën naa. It's polite to answer an invitation with a plan, not a flat no.",
        "waaye veut dire « mais » : Mënuma tey, waaye suba mën naa. Il est poli de répondre à une invitation par une proposition plutôt que par un non sec.",
        "waaye significa «pero»: Mënuma tey, waaye suba mën naa. Es cortés responder a una invitación con otra propuesta, no con un no rotundo.",
        "waaye heißt „aber“: Mënuma tey, waaye suba mën naa. Auf eine Einladung antwortet man höflich mit einem Vorschlag statt mit einem glatten Nein.",
        "waaye vuol dire «ma»: Mënuma tey, waaye suba mën naa. È cortese rispondere a un invito con una proposta, non con un no secco.",
      ]),
      entries: ["u.basuba", "u.suyalla", "u.yaakaar", "u.menumatey", "u.dumanew", "q.waawdinaa"],
      exercises: [
        { type: "pick_meaning", entry: "u.basuba" },
        { type: "pick_meaning", entry: "u.suyalla" },
        { type: "match", entries: ["u.basuba", "u.suyalla", "u.dumanew", "q.waawdinaa"] },
        { type: "listen", entry: "u.yaakaar" },
        { type: "pick_wolof", entry: "u.menumatey" },
        { type: "fill_blank", entry: "u.menumatey", blank: 2, options: ["waaye", "ak", "ndax"] },
        { type: "build", entry: "u.yaakaar", distractors: ["duma", "démb"] },
        { type: "pick_meaning", entry: "u.menumatey" },
        { type: "pick_wolof", entry: "u.dumanew" },
        { type: "listen", entry: "u.suyalla" },
        { type: "type_wolof", entry: "u.basuba" },
        { type: "speak", entry: "u.yaakaar" },
      ],
    },
  ],
};
