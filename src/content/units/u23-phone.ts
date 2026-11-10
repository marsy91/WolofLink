// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, line, question, tx } from "./helpers";

export const entries = [
  // phone-1
  entry("i.allo", "Allo, kan la?", ["Hello, who is it?", "Allô, c'est qui ?", "¿Diga? ¿Quién es?", "Hallo, wer ist da?", "Pronto, chi è?"]),
  entry("i.manla", "Man la", ["It's me", "C'est moi", "Soy yo", "Ich bin's", "Sono io"], {
    note: [
      "man is the strong form of “I / me”, used to point to yourself: Man la, “it's me”.",
      "man est la forme forte de « je / moi », pour se désigner : Man la, « c'est moi ».",
      "man es la forma fuerte de «yo», para señalarte a ti mismo: Man la, «soy yo».",
      "man ist die betonte Form von „ich“, um auf sich selbst zu zeigen: Man la, „ich bin's“.",
      "man è la forma forte di «io / me», per indicare te stesso: Man la, «sono io».",
    ],
  }),
  entry("i.deggumala", "Dégguma la bu baax", ["I can't hear you well", "Je ne t'entends pas bien", "No te oigo bien", "Ich höre dich nicht gut", "Non ti sento bene"], {
    note: [
      "dégg is “to hear” (and “to understand”); bu baax means “well”.",
      "dégg veut dire « entendre » (et « comprendre ») ; bu baax veut dire « bien ».",
      "dégg es «oír» (y «entender»); bu baax significa «bien».",
      "dégg heißt „hören“ (und „verstehen“); bu baax heißt „gut“.",
      "dégg vuol dire «sentire» (e «capire»); bu baax vuol dire «bene».",
    ],
  }),
  entry("i.wooma", "Woo ma suba", ["Call me tomorrow", "Appelle-moi demain", "Llámame mañana", "Ruf mich morgen an", "Chiamami domani"]),
  entry("i.doonlawoo", "Dama la doon woo", ["I was trying to call you", "J'essayais de t'appeler", "Te estaba llamando", "Ich wollte dich gerade anrufen", "Ti stavo chiamando"]),

  // phone-2
  entry("i.yonneema", "Yónnee ma bataaxal", ["Send me a message", "Envoie-moi un message", "Mándame un mensaje", "Schick mir eine Nachricht", "Mandami un messaggio"], {
    note: [
      "bataaxal is a letter or message; for a text many people simply say SMS or message.",
      "bataaxal, c'est une lettre ou un message ; pour un texto, beaucoup disent simplement SMS ou message.",
      "bataaxal es una carta o un mensaje; para un SMS mucha gente dice simplemente SMS o message.",
      "bataaxal ist ein Brief oder eine Nachricht; für eine SMS sagen viele einfach SMS oder message.",
      "bataaxal è una lettera o un messaggio; per un SMS molti dicono semplicemente SMS o message.",
    ],
  }),
  entry("i.joxalnimero", "Joxal ma sa nimero", ["Give me your number", "Donne-moi ton numéro", "Dame tu número", "Gib mir deine Nummer", "Dammi il tuo numero"]),
  entry("i.bindalma", "Bindal ma", ["Write to me", "Écris-moi", "Escríbeme", "Schreib mir", "Scrivimi"]),
  entry("i.yonneengako", "Ndax yónnee nga ko?", ["Did you send it?", "Tu l'as envoyé ?", "¿Lo enviaste?", "Hast du es geschickt?", "L'hai mandato?"]),
  entry("i.delluwoo", "Dinaa la dellu woo", ["I'll call you back", "Je te rappellerai", "Te devuelvo la llamada", "Ich rufe dich zurück", "Ti richiamo"]),
];

export const unit: Unit = {
  id: "u23",
  glyph: "chat",
  tone: "clay",
  title: tx(["On the phone", "Au téléphone", "Por teléfono", "Am Telefon", "Al telefono"]),
  lessons: [
    {
      id: "phone-1",
      title: tx(["Calling someone", "Appeler quelqu'un", "Llamar a alguien", "Jemanden anrufen", "Chiamare qualcuno"]),
      tip: tx([
        "woo means “to call”. Put ma (me) or la (you) before it in the future: Dinaa la woo, and after it in a request: Woo ma.",
        "woo veut dire « appeler ». Au futur, ma (moi) ou la (toi) vient avant : Dinaa la woo ; dans une demande, après : Woo ma.",
        "woo significa «llamar». En futuro, ma (me) o la (te) va delante: Dinaa la woo; en una petición, detrás: Woo ma.",
        "woo heißt „anrufen“. In der Zukunft steht ma (mich) oder la (dich) davor: Dinaa la woo; in einer Bitte dahinter: Woo ma.",
        "woo vuol dire «chiamare». Al futuro ma (mi) o la (ti) va prima: Dinaa la woo; in una richiesta dopo: Woo ma.",
      ]),
      entries: ["i.allo", "i.manla", "i.deggumala", "i.wooma", "i.doonlawoo", "u.dinaalawoo"],
      exercises: [
        { type: "pick_meaning", entry: "i.allo" },
        { type: "pick_meaning", entry: "i.manla" },
        { type: "listen", entry: "i.deggumala" },
        { type: "match", entries: ["i.allo", "i.manla", "i.wooma", "u.dinaalawoo"] },
        { type: "pick_wolof", entry: "i.deggumala" },
        { type: "fill_blank", entry: "i.wooma", blank: 2, options: ["suba", "démb", "fii"] },
        { type: "build", entry: "i.doonlawoo", distractors: ["naa", "dinaa"] },
        { type: "pick_meaning", entry: "i.doonlawoo" },
        { type: "listen", entry: "i.allo" },
        { type: "pick_wolof", entry: "i.wooma" },
        { type: "type_wolof", entry: "i.manla" },
        { type: "speak", entry: "i.allo" },
      ],
    },
    {
      id: "phone-2",
      title: tx(["Messages and numbers", "Messages et numéros", "Mensajes y números", "Nachrichten und Nummern", "Messaggi e numeri"]),
      tip: tx([
        "Phone numbers are usually given in pairs, often in French: 77 123 45 67. Ask to hear it again with Waxaatal!",
        "Les numéros se donnent souvent par paires, souvent en français : 77 123 45 67. Pour réentendre, dites Waxaatal !",
        "Los números se dan por pares, a menudo en francés: 77 123 45 67. Para oírlo otra vez di ¡Waxaatal!",
        "Telefonnummern nennt man meist paarweise, oft auf Französisch: 77 123 45 67. Zum Wiederholen sag Waxaatal!",
        "I numeri si dicono di solito a coppie, spesso in francese: 77 123 45 67. Per riascoltarlo di' Waxaatal!",
      ]),
      entries: ["i.yonneema", "i.joxalnimero", "i.bindalma", "i.yonneengako", "i.delluwoo"],
      exercises: [
        { type: "pick_meaning", entry: "i.yonneema" },
        { type: "pick_meaning", entry: "i.joxalnimero" },
        { type: "match", entries: ["i.yonneema", "i.joxalnimero", "i.bindalma", "i.delluwoo"] },
        { type: "listen", entry: "i.yonneengako" },
        { type: "pick_wolof", entry: "i.bindalma" },
        { type: "fill_blank", entry: "i.joxalnimero", blank: 2, options: ["sa", "sama", "ak"] },
        { type: "build", entry: "i.delluwoo", distractors: ["ma", "duma"] },
        { type: "pick_meaning", entry: "i.yonneengako" },
        { type: "pick_wolof", entry: "i.delluwoo" },
        { type: "listen", entry: "i.joxalnimero" },
        { type: "type_wolof", entry: "i.bindalma" },
        { type: "speak", entry: "i.yonneema" },
      ],
    },
  ],
  story: {
    id: "story-call",
    title: tx(["A phone call", "Un coup de fil", "Una llamada", "Ein Anruf", "Una telefonata"]),
    lines: [
      line("Awa", "Allo, kan la?", ["Hello, who is it?", "Allô, c'est qui ?", "¿Diga? ¿Quién es?", "Hallo, wer ist da?", "Pronto, chi è?"]),
      line("Moodu", "Man la. Dama la doon woo.", ["It's me. I was trying to call you.", "C'est moi. J'essayais de t'appeler.", "Soy yo. Te estaba llamando.", "Ich bin's. Ich wollte dich gerade anrufen.", "Sono io. Ti stavo chiamando."]),
      line("Awa", "Dégguma la bu baax. Waxaatal!", ["I can't hear you well. Say it again!", "Je ne t'entends pas bien. Répète !", "No te oigo bien. ¡Repítelo!", "Ich höre dich nicht gut. Sag es noch einmal!", "Non ti sento bene. Ripeti!"]),
      line("Moodu", "Ndax dinga ñëw?", ["Will you come?", "Est-ce que tu viendras ?", "¿Vendrás?", "Kommst du?", "Verrai?"]),
      line("Awa", "Mënuma tey, waaye suba mën naa.", ["I can't today, but tomorrow I can.", "Je ne peux pas aujourd'hui, mais demain je peux.", "Hoy no puedo, pero mañana sí.", "Heute kann ich nicht, aber morgen schon.", "Oggi non posso, ma domani sì."]),
      line("Moodu", "Waaw. Dinaa la woo. Ba suba!", ["Yes. I'll call you. See you tomorrow!", "Oui. Je t'appellerai. À demain !", "Sí. Te llamaré. ¡Hasta mañana!", "Ja. Ich rufe dich an. Bis morgen!", "Sì. Ti chiamerò. A domani!"]),
      line("Awa", "Su Yàlla soobee. Jërëjëf!", ["God willing. Thank you!", "Si Dieu le veut. Merci !", "Si Dios quiere. ¡Gracias!", "So Gott will. Danke!", "Se Dio vuole. Grazie!"]),
    ],
    questions: [
      question(
        ["Who is calling?", "Qui appelle ?", "¿Quién llama?", "Wer ruft an?", "Chi chiama?"],
        ["Moodu", "Moodu", "Moodu", "Moodu", "Moodu"],
        ["Awa", "Awa", "Awa", "Awa", "Awa"],
        ["A doctor", "Un médecin", "Un médico", "Ein Arzt", "Un medico"],
      ),
      question(
        ["When can Awa come?", "Quand Awa peut-elle venir ?", "¿Cuándo puede venir Awa?", "Wann kann Awa kommen?", "Quando può venire Awa?"],
        ["Tomorrow", "Demain", "Mañana", "Morgen", "Domani"],
        ["Today", "Aujourd'hui", "Hoy", "Heute", "Oggi"],
        ["Never", "Jamais", "Nunca", "Nie", "Mai"],
      ),
      question(
        ["Why does Awa say “Waxaatal”?", "Pourquoi Awa dit-elle « Waxaatal » ?", "¿Por qué dice Awa «Waxaatal»?", "Warum sagt Awa „Waxaatal“?", "Perché Awa dice «Waxaatal»?"],
        ["She can't hear him well", "Elle ne l'entend pas bien", "No lo oye bien", "Sie hört ihn nicht gut", "Non lo sente bene"],
        ["She is angry", "Elle est fâchée", "Está enfadada", "Sie ist wütend", "È arrabbiata"],
        ["She wants his number", "Elle veut son numéro", "Quiere su número", "Sie will seine Nummer", "Vuole il suo numero"],
      ),
    ],
  },
};
