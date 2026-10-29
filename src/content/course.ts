import { entries } from "./entries";
import type { Course, Unit } from "./types";

const greetings: Unit = {
  id: "u1",
  glyph: "wave",
  tone: "sun",
  title: {
    en: "Greetings and introductions",
    fr: "Salutations et présentations",
    es: "Saludos y presentaciones",
    de: "Begrüßungen und Vorstellung",
    it: "Saluti e presentazioni",
  },
  lessons: [
    {
      id: "greetings-1",
      title: { en: "Greetings", fr: "Salutations", es: "Saludos", de: "Begrüßungen", it: "Saluti" },
      tip: {
        en: "Greetings matter in Senegal. Salaam aleekum is answered with Maalekum salaam, and people often ask after your day before anything else.",
        fr: "Les salutations comptent beaucoup au Sénégal. On répond à Salaam aleekum par Maalekum salaam, et on prend des nouvelles avant toute chose.",
        es: "Los saludos importan mucho en Senegal. A Salaam aleekum se responde Maalekum salaam, y se pregunta cómo estás antes de cualquier otra cosa.",
        de: "Begrüßungen sind im Senegal wichtig. Auf Salaam aleekum antwortet man Maalekum salaam, und man fragt erst nach dem Befinden.",
        it: "In Senegal i saluti contano molto. A Salaam aleekum si risponde Maalekum salaam, e si chiede come stai prima di tutto.",
      },
      entries: [
        "g.salaam",
        "g.maalekum",
        "g.nanga",
        "g.fi",
        "g.tudd",
        "g.awa",
        "g.jerejef",
        "g.waaw",
        "g.deedeet",
        "g.babeneen",
        "g.basuba",
      ],
      exercises: [
        { type: "pick_meaning", entry: "g.salaam" },
        { type: "pick_meaning", entry: "g.maalekum" },
        { type: "listen", entry: "g.salaam" },
        { type: "pick_meaning", entry: "g.nanga" },
        { type: "pick_meaning", entry: "g.fi" },
        { type: "build", entry: "g.nanga", distractors: ["tudd", "rekk"] },
        { type: "match", entries: ["g.waaw", "g.deedeet", "g.jerejef", "g.basuba"] },
        { type: "fill_blank", entry: "g.fi", blank: 2, options: ["fi", "def", "suba"] },
        { type: "pick_wolof", entry: "g.babeneen" },
        { type: "build", entry: "g.awa", distractors: ["nga", "fi"] },
        { type: "fill_blank", entry: "g.tudd", blank: 2, options: ["tudd", "def", "suba"] },
        { type: "speak", entry: "g.nanga" },
      ],
    },
  ],
};

const numbers: Unit = {
  id: "u2",
  glyph: "count",
  tone: "sea",
  title: {
    en: "Numbers and counting",
    fr: "Nombres et calcul",
    es: "Números y contar",
    de: "Zahlen und Zählen",
    it: "Numeri e contare",
  },
  lessons: [
    {
      id: "numbers-1",
      title: { en: "Numbers 1–10", fr: "Nombres 1–10", es: "Números 1–10", de: "Zahlen 1–10", it: "Numeri 1–10" },
      tip: {
        en: "Wolof counts in fives. Six to nine are “five + one” up to “five + four”: juróom benn, juróom ñaar…",
        fr: "Le wolof compte par cinq. De six à neuf, on dit « cinq + un » jusqu'à « cinq + quatre » : juróom benn, juróom ñaar…",
        es: "El wolof cuenta de cinco en cinco. Del seis al nueve se dice «cinco + uno» hasta «cinco + cuatro»: juróom benn, juróom ñaar…",
        de: "Wolof zählt in Fünfern. Sechs bis neun heißen „fünf + eins“ bis „fünf + vier“: juróom benn, juróom ñaar…",
        it: "Il wolof conta per cinque. Da sei a nove si dice «cinque + uno» fino a «cinque + quattro»: juróom benn, juróom ñaar…",
      },
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
  ],
};

const food: Unit = {
  id: "u3",
  glyph: "bowl",
  tone: "clay",
  title: {
    en: "Food and drink",
    fr: "Nourriture et boissons",
    es: "Comida y bebida",
    de: "Essen und Trinken",
    it: "Cibo e bevande",
  },
  lessons: [
    {
      id: "food-1",
      title: {
        en: "Food and drink",
        fr: "Nourriture et boissons",
        es: "Comida y bebida",
        de: "Essen und Trinken",
        it: "Cibo e bevande",
      },
      tip: {
        en: "Dama + a verb puts the focus on what you feel or do: Dama xiif, “I'm hungry”.",
        fr: "Dama + un verbe met l'accent sur ce que vous ressentez ou faites : Dama xiif, « j'ai faim ».",
        es: "Dama + un verbo pone el foco en lo que sientes o haces: Dama xiif, «tengo hambre».",
        de: "Dama + Verb betont, was du fühlst oder tust: Dama xiif, „ich habe Hunger“.",
        it: "Dama + un verbo mette l'accento su ciò che senti o fai: Dama xiif, «ho fame».",
      },
      entries: [
        "f.ndox",
        "f.mburu",
        "f.ceeb",
        "f.jen",
        "f.yapp",
        "f.kafe",
        "f.attaaya",
        "f.ceebujen",
        "f.xiif",
        "f.mar",
        "f.begg",
        "f.neex",
      ],
      exercises: [
        { type: "pick_picture", entry: "f.ndox" },
        { type: "pick_picture", entry: "f.mburu" },
        { type: "pick_picture", entry: "f.ceeb" },
        { type: "pick_meaning", entry: "f.jen" },
        { type: "listen", entry: "f.kafe" },
        { type: "match", entries: ["f.ndox", "f.mburu", "f.ceeb", "f.yapp"] },
        { type: "pick_meaning", entry: "f.xiif" },
        { type: "build", entry: "f.begg", distractors: ["mar", "ceeb"] },
        { type: "pick_wolof", entry: "f.neex" },
        { type: "fill_blank", entry: "f.mar", blank: 1, options: ["mar", "xiif", "bëgg"] },
        { type: "pick_picture", entry: "f.attaaya" },
        { type: "speak", entry: "f.ceebujen" },
      ],
    },
  ],
};

/** Planned units, shown on the path as "coming soon" until they get lessons. */
const planned: Unit[] = [
  {
    id: "u4",
    glyph: "family",
    tone: "dusk",
    title: {
      en: "People and family",
      fr: "Les gens et la famille",
      es: "Personas y familia",
      de: "Menschen und Familie",
      it: "Persone e famiglia",
    },
    lessons: [],
  },
  {
    id: "u5",
    glyph: "spark",
    tone: "sun",
    title: { en: "Common verbs", fr: "Verbes courants", es: "Verbos comunes", de: "Häufige Verben", it: "Verbi comuni" },
    lessons: [],
  },
  {
    id: "u6",
    glyph: "compass",
    tone: "sea",
    title: {
      en: "Places and directions",
      fr: "Lieux et directions",
      es: "Lugares y direcciones",
      de: "Orte und Wegbeschreibungen",
      it: "Luoghi e indicazioni",
    },
    lessons: [],
  },
  {
    id: "u7",
    glyph: "clock",
    tone: "clay",
    title: { en: "Time and days", fr: "L'heure et les jours", es: "La hora y los días", de: "Zeit und Tage", it: "Ore e giorni" },
    lessons: [],
  },
  {
    id: "u8",
    glyph: "chat",
    tone: "dusk",
    title: {
      en: "Everyday conversation",
      fr: "Conversation de tous les jours",
      es: "Conversación cotidiana",
      de: "Alltagsgespräche",
      it: "Conversazione quotidiana",
    },
    lessons: [],
  },
];

export const course: Course = {
  id: "wo-core",
  target: "wo",
  title: { en: "Wolof", fr: "Wolof", es: "Wolof", de: "Wolof", it: "Wolof" },
  units: [greetings, numbers, food, ...planned],
  entries,
};

export const allLessons = course.units.flatMap((u) => u.lessons);

export function findLesson(id: string) {
  for (const unit of course.units) {
    const lesson = unit.lessons.find((l) => l.id === id);
    if (lesson) return { unit, lesson };
  }
  return null;
}
