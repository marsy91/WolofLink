import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // numbers-1
  entry("n.1", "benn", ["one", "un", "uno", "eins", "uno"], { pic: "1" }),
  entry("n.2", "ñaar", ["two", "deux", "dos", "zwei", "due"], { pic: "2" }),
  entry("n.3", "ñett", ["three", "trois", "tres", "drei", "tre"], { pic: "3" }),
  entry("n.4", "ñeent", ["four", "quatre", "cuatro", "vier", "quattro"], { pic: "4" }),
  entry("n.5", "juróom", ["five", "cinq", "cinco", "fünf", "cinque"], { pic: "5" }),
  entry("n.6", "juróom benn", ["six", "six", "seis", "sechs", "sei"], {
    pic: "6",
    note: ["Five + one.", "Cinq + un.", "Cinco + uno.", "Fünf + eins.", "Cinque + uno."],
  }),
  entry("n.7", "juróom ñaar", ["seven", "sept", "siete", "sieben", "sette"], {
    pic: "7",
    note: ["Five + two.", "Cinq + deux.", "Cinco + dos.", "Fünf + zwei.", "Cinque + due."],
  }),
  entry("n.8", "juróom ñett", ["eight", "huit", "ocho", "acht", "otto"], {
    pic: "8",
    note: ["Five + three.", "Cinq + trois.", "Cinco + tres.", "Fünf + drei.", "Cinque + tre."],
  }),
  entry("n.9", "juróom ñeent", ["nine", "neuf", "nueve", "neun", "nove"], {
    pic: "9",
    note: ["Five + four.", "Cinq + quatre.", "Cinco + cuatro.", "Fünf + vier.", "Cinque + quattro."],
  }),
  entry("n.10", "fukk", ["ten", "dix", "diez", "zehn", "dieci"], { pic: "10" }),
  entry("n.count", "Benn, ñaar, ñett", [
    "One, two, three",
    "Un, deux, trois",
    "Uno, dos, tres",
    "Eins, zwei, drei",
    "Uno, due, tre",
  ]),

  // numbers-2
  entry("n.11", "fukk ak benn", ["eleven", "onze", "once", "elf", "undici"], {
    pic: "11",
    note: ["Ten and one.", "Dix et un.", "Diez y uno.", "Zehn und eins.", "Dieci e uno."],
  }),
  entry("n.12", "fukk ak ñaar", ["twelve", "douze", "doce", "zwölf", "dodici"], { pic: "12" }),
  entry("n.15", "fukk ak juróom", ["fifteen", "quinze", "quince", "fünfzehn", "quindici"], { pic: "15" }),
  entry("n.20", "ñaar-fukk", ["twenty", "vingt", "veinte", "zwanzig", "venti"], {
    pic: "20",
    note: ["Two tens.", "Deux dizaines.", "Dos decenas.", "Zwei Zehner.", "Due decine."],
  }),
  entry("n.30", "fanweer", ["thirty", "trente", "treinta", "dreißig", "trenta"], { pic: "30" }),
  entry("n.50", "juróom-fukk", ["fifty", "cinquante", "cincuenta", "fünfzig", "cinquanta"], { pic: "50" }),
  entry("n.100", "téeméer", ["one hundred", "cent", "cien", "hundert", "cento"], { pic: "100" }),
  entry("n.price", "Ñaata la?", [
    "How much is it?",
    "C'est combien ?",
    "¿Cuánto cuesta?",
    "Wie viel kostet das?",
    "Quanto costa?",
  ]),
  entry("n.age", "Ñaata at nga am?", [
    "How old are you?",
    "Quel âge as-tu ?",
    "¿Cuántos años tienes?",
    "Wie alt bist du?",
    "Quanti anni hai?",
  ]),
  entry("n.age20", "Am naa ñaar-fukk at", [
    "I'm twenty years old",
    "J'ai vingt ans",
    "Tengo veinte años",
    "Ich bin zwanzig Jahre alt",
    "Ho vent'anni",
  ]),
];

export const unit: Unit = {
  id: "u2",
  glyph: "count",
  tone: "sea",
  title: tx(["Numbers and counting", "Nombres et calcul", "Números y contar", "Zahlen und Zählen", "Numeri e contare"]),
  lessons: [
    {
      id: "numbers-1",
      title: tx(["Numbers 1–10", "Nombres 1–10", "Números 1–10", "Zahlen 1–10", "Numeri 1–10"]),
      tip: tx([
        "Wolof counts in fives. Six to nine are “five + one” up to “five + four”: juróom benn, juróom ñaar…",
        "Le wolof compte par cinq. De six à neuf, on dit « cinq + un » jusqu'à « cinq + quatre » : juróom benn, juróom ñaar…",
        "El wolof cuenta de cinco en cinco. Del seis al nueve se dice «cinco + uno» hasta «cinco + cuatro»: juróom benn, juróom ñaar…",
        "Wolof zählt in Fünfern. Sechs bis neun heißen „fünf + eins“ bis „fünf + vier“: juróom benn, juróom ñaar…",
        "Il wolof conta per cinque. Da sei a nove si dice «cinque + uno» fino a «cinque + quattro»: juróom benn, juróom ñaar…",
      ]),
      entries: ["n.1", "n.2", "n.3", "n.4", "n.5", "n.6", "n.7", "n.8", "n.9", "n.10", "n.count"],
      exercises: [
        { type: "pick_picture", entry: "n.1" },
        { type: "pick_picture", entry: "n.2" },
        { type: "pick_picture", entry: "n.3" },
        { type: "pick_meaning", entry: "n.5" },
        { type: "listen", entry: "n.4" },
        { type: "match", entries: ["n.1", "n.2", "n.3", "n.4"] },
        { type: "pick_picture", entry: "n.6" },
        { type: "build", entry: "n.7", distractors: ["ñett", "benn"] },
        { type: "fill_blank", entry: "n.8", blank: 1, options: ["ñett", "ñaar", "fukk"] },
        { type: "pick_wolof", entry: "n.10" },
        { type: "match", entries: ["n.5", "n.6", "n.9", "n.10"] },
        { type: "speak", entry: "n.count" },
      ],
    },
    {
      id: "numbers-2",
      title: tx([
        "Bigger numbers and prices",
        "Grands nombres et prix",
        "Números grandes y precios",
        "Größere Zahlen und Preise",
        "Numeri grandi e prezzi",
      ]),
      tip: tx([
        "From 11 to 19 you say “ten and…”: fukk ak benn = 11. Tens multiply: ñaar-fukk is “two tens”, 20.",
        "De 11 à 19, on dit « dix et… » : fukk ak benn = 11. Les dizaines se multiplient : ñaar-fukk, « deux dizaines », 20.",
        "Del 11 al 19 se dice «diez y…»: fukk ak benn = 11. Las decenas se multiplican: ñaar-fukk, «dos decenas», 20.",
        "Von 11 bis 19 sagt man „zehn und …“: fukk ak benn = 11. Zehner werden multipliziert: ñaar-fukk, „zwei Zehner“, 20.",
        "Da 11 a 19 si dice «dieci e…»: fukk ak benn = 11. Le decine si moltiplicano: ñaar-fukk, «due decine», 20.",
      ]),
      entries: ["n.11", "n.12", "n.15", "n.20", "n.30", "n.50", "n.100", "n.price", "n.age", "n.age20"],
      exercises: [
        { type: "pick_picture", entry: "n.11" },
        { type: "pick_meaning", entry: "n.12" },
        { type: "build", entry: "n.15", distractors: ["ñaar", "benn"] },
        { type: "pick_picture", entry: "n.20" },
        { type: "listen", entry: "n.11" },
        { type: "match", entries: ["n.20", "n.30", "n.50", "n.100"] },
        { type: "pick_wolof", entry: "n.100" },
        { type: "pick_meaning", entry: "n.price" },
        { type: "fill_blank", entry: "n.12", blank: 2, options: ["ñaar", "ñett", "benn"] },
        { type: "pick_meaning", entry: "n.age" },
        { type: "build", entry: "n.age20", distractors: ["nga", "la"] },
        { type: "speak", entry: "n.price" },
      ],
    },
  ],
};
