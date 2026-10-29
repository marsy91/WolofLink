import type { Entry } from "./types";

/**
 * Wolof vocabulary and phrases (CLAD orthography) with interface-language
 * translations. Ids are namespaced by unit: g = greetings, n = numbers,
 * f = food and drink.
 *
 * Recorded audio does not exist yet; when it does, add `audio:
 * "audio/wo/<id>.mp3"` to an entry and drop the file in public/audio/wo/.
 */
const list: Entry[] = [
  // ── Greetings ────────────────────────────────────────────────────────────
  {
    id: "g.salaam",
    wo: "Salaam aleekum",
    tokens: ["Salaam", "aleekum"],
    tr: { en: "Hello", fr: "Bonjour", es: "Hola", de: "Hallo", it: "Ciao" },
    note: {
      en: "Literally “peace be upon you”, the everyday greeting.",
      fr: "Littéralement « que la paix soit sur vous », la salutation de tous les jours.",
      es: "Literalmente «la paz sea contigo», el saludo de cada día.",
      de: "Wörtlich „Friede sei mit dir“, der alltägliche Gruß.",
      it: "Letteralmente «la pace sia con te», il saluto di tutti i giorni.",
    },
  },
  {
    id: "g.maalekum",
    wo: "Maalekum salaam",
    tokens: ["Maalekum", "salaam"],
    tr: {
      en: "Hello (in reply)",
      fr: "Bonjour (en réponse)",
      es: "Hola (en respuesta)",
      de: "Hallo (als Antwort)",
      it: "Ciao (in risposta)",
    },
    note: {
      en: "The reply to Salaam aleekum.",
      fr: "La réponse à Salaam aleekum.",
      es: "La respuesta a Salaam aleekum.",
      de: "Die Antwort auf Salaam aleekum.",
      it: "La risposta a Salaam aleekum.",
    },
  },
  {
    id: "g.nanga",
    wo: "Na nga def?",
    tr: { en: "How are you?", fr: "Comment vas-tu ?", es: "¿Cómo estás?", de: "Wie geht es dir?", it: "Come stai?" },
  },
  {
    id: "g.fi",
    wo: "Maa ngi fi rekk",
    tr: { en: "I'm fine", fr: "Je vais bien", es: "Estoy bien", de: "Mir geht es gut", it: "Sto bene" },
    note: {
      en: "Literally “I'm just here”.",
      fr: "Littéralement « je suis juste là ».",
      es: "Literalmente «solo estoy aquí».",
      de: "Wörtlich „ich bin einfach hier“.",
      it: "Letteralmente «sono solo qui».",
    },
  },
  {
    id: "g.tudd",
    wo: "Naka nga tudd?",
    tr: {
      en: "What's your name?",
      fr: "Comment t'appelles-tu ?",
      es: "¿Cómo te llamas?",
      de: "Wie heißt du?",
      it: "Come ti chiami?",
    },
  },
  {
    id: "g.awa",
    wo: "Maa ngi tudd Awa",
    tr: { en: "My name is Awa", fr: "Je m'appelle Awa", es: "Me llamo Awa", de: "Ich heiße Awa", it: "Mi chiamo Awa" },
  },
  {
    id: "g.jerejef",
    wo: "Jërëjëf",
    tr: { en: "Thank you", fr: "Merci", es: "Gracias", de: "Danke", it: "Grazie" },
  },
  { id: "g.waaw", wo: "Waaw", tr: { en: "Yes", fr: "Oui", es: "Sí", de: "Ja", it: "Sì" } },
  { id: "g.deedeet", wo: "Déedéet", tr: { en: "No", fr: "Non", es: "No", de: "Nein", it: "No" } },
  {
    id: "g.babeneen",
    wo: "Ba beneen yoon",
    tr: {
      en: "See you next time",
      fr: "À la prochaine",
      es: "Hasta la próxima",
      de: "Bis zum nächsten Mal",
      it: "Alla prossima",
    },
  },
  {
    id: "g.basuba",
    wo: "Ba suba",
    tr: { en: "See you tomorrow", fr: "À demain", es: "Hasta mañana", de: "Bis morgen", it: "A domani" },
  },

  // ── Numbers 1–10 ─────────────────────────────────────────────────────────
  { id: "n.1", wo: "benn", pic: "1", tr: { en: "one", fr: "un", es: "uno", de: "eins", it: "uno" } },
  { id: "n.2", wo: "ñaar", pic: "2", tr: { en: "two", fr: "deux", es: "dos", de: "zwei", it: "due" } },
  { id: "n.3", wo: "ñett", pic: "3", tr: { en: "three", fr: "trois", es: "tres", de: "drei", it: "tre" } },
  { id: "n.4", wo: "ñeent", pic: "4", tr: { en: "four", fr: "quatre", es: "cuatro", de: "vier", it: "quattro" } },
  { id: "n.5", wo: "juróom", pic: "5", tr: { en: "five", fr: "cinq", es: "cinco", de: "fünf", it: "cinque" } },
  {
    id: "n.6",
    wo: "juróom benn",
    pic: "6",
    tr: { en: "six", fr: "six", es: "seis", de: "sechs", it: "sei" },
    note: {
      en: "Five + one.",
      fr: "Cinq + un.",
      es: "Cinco + uno.",
      de: "Fünf + eins.",
      it: "Cinque + uno.",
    },
  },
  {
    id: "n.7",
    wo: "juróom ñaar",
    pic: "7",
    tr: { en: "seven", fr: "sept", es: "siete", de: "sieben", it: "sette" },
    note: { en: "Five + two.", fr: "Cinq + deux.", es: "Cinco + dos.", de: "Fünf + zwei.", it: "Cinque + due." },
  },
  {
    id: "n.8",
    wo: "juróom ñett",
    pic: "8",
    tr: { en: "eight", fr: "huit", es: "ocho", de: "acht", it: "otto" },
    note: { en: "Five + three.", fr: "Cinq + trois.", es: "Cinco + tres.", de: "Fünf + drei.", it: "Cinque + tre." },
  },
  {
    id: "n.9",
    wo: "juróom ñeent",
    pic: "9",
    tr: { en: "nine", fr: "neuf", es: "nueve", de: "neun", it: "nove" },
    note: {
      en: "Five + four.",
      fr: "Cinq + quatre.",
      es: "Cinco + cuatro.",
      de: "Fünf + vier.",
      it: "Cinque + quattro.",
    },
  },
  { id: "n.10", wo: "fukk", pic: "10", tr: { en: "ten", fr: "dix", es: "diez", de: "zehn", it: "dieci" } },
  {
    id: "n.count",
    wo: "Benn, ñaar, ñett",
    tr: {
      en: "One, two, three",
      fr: "Un, deux, trois",
      es: "Uno, dos, tres",
      de: "Eins, zwei, drei",
      it: "Uno, due, tre",
    },
  },

  // ── Food and drink ───────────────────────────────────────────────────────
  { id: "f.ndox", wo: "ndox", pic: "💧", tr: { en: "water", fr: "eau", es: "agua", de: "Wasser", it: "acqua" } },
  { id: "f.mburu", wo: "mburu", pic: "🥖", tr: { en: "bread", fr: "pain", es: "pan", de: "Brot", it: "pane" } },
  { id: "f.ceeb", wo: "ceeb", pic: "🍚", tr: { en: "rice", fr: "riz", es: "arroz", de: "Reis", it: "riso" } },
  { id: "f.jen", wo: "jën", pic: "🐟", tr: { en: "fish", fr: "poisson", es: "pescado", de: "Fisch", it: "pesce" } },
  { id: "f.yapp", wo: "yàpp", pic: "🍖", tr: { en: "meat", fr: "viande", es: "carne", de: "Fleisch", it: "carne" } },
  { id: "f.kafe", wo: "kafe", pic: "☕", tr: { en: "coffee", fr: "café", es: "café", de: "Kaffee", it: "caffè" } },
  {
    id: "f.attaaya",
    wo: "àttaaya",
    pic: "🍵",
    tr: { en: "tea", fr: "thé", es: "té", de: "Tee", it: "tè" },
    note: {
      en: "Strong sweet green tea, brewed and shared in three rounds.",
      fr: "Thé vert fort et sucré, préparé et partagé en trois tournées.",
      es: "Té verde fuerte y dulce, preparado y compartido en tres rondas.",
      de: "Starker, süßer grüner Tee, in drei Runden zubereitet und geteilt.",
      it: "Tè verde forte e dolce, preparato e condiviso in tre giri.",
    },
  },
  {
    id: "f.ceebujen",
    wo: "Ceebu jën",
    pic: "🍛",
    tr: {
      en: "Rice with fish",
      fr: "Riz au poisson",
      es: "Arroz con pescado",
      de: "Reis mit Fisch",
      it: "Riso con pesce",
    },
    note: {
      en: "Senegal's best-known dish. Ceeb + -u (“of”) + jën.",
      fr: "Le plat le plus connu du Sénégal. Ceeb + -u (« de ») + jën.",
      es: "El plato más conocido de Senegal. Ceeb + -u («de») + jën.",
      de: "Das bekannteste Gericht Senegals. Ceeb + -u („von“) + jën.",
      it: "Il piatto più noto del Senegal. Ceeb + -u («di») + jën.",
    },
  },
  {
    id: "f.xiif",
    wo: "Dama xiif",
    tr: { en: "I'm hungry", fr: "J'ai faim", es: "Tengo hambre", de: "Ich habe Hunger", it: "Ho fame" },
  },
  {
    id: "f.mar",
    wo: "Dama mar",
    tr: { en: "I'm thirsty", fr: "J'ai soif", es: "Tengo sed", de: "Ich habe Durst", it: "Ho sete" },
  },
  {
    id: "f.begg",
    wo: "Dama bëgg ndox",
    tr: {
      en: "I want water",
      fr: "Je veux de l'eau",
      es: "Quiero agua",
      de: "Ich möchte Wasser",
      it: "Voglio dell'acqua",
    },
  },
  {
    id: "f.neex",
    wo: "Neex na!",
    tr: { en: "It's delicious!", fr: "C'est délicieux !", es: "¡Está delicioso!", de: "Es ist lecker!", it: "È delizioso!" },
  },
];

export const entries: Record<string, Entry> = Object.fromEntries(list.map((e) => [e.id, e]));
