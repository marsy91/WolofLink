// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // culture-1
  entry("x.tabaski", "Tabaski", ["Eid al-Adha", "Tabaski (Aïd el-Kébir)", "Tabaski (Eid al-Adha)", "Tabaski (Opferfest)", "Tabaski (Eid al-Adha)"], {
    pic: "🐏",
    note: [
      "The biggest celebration of the year in Senegal, shared with family.",
      "La plus grande fête de l'année au Sénégal, célébrée en famille.",
      "La mayor fiesta del año en Senegal, celebrada en familia.",
      "Das größte Fest des Jahres im Senegal, gefeiert mit der Familie.",
      "La festa più grande dell'anno in Senegal, celebrata in famiglia.",
    ],
  }),
  entry("x.korite", "Koorite", ["Eid al-Fitr", "Korité (Aïd el-Fitr)", "Korité (Eid al-Fitr)", "Korité (Fastenbrechen)", "Korité (Eid al-Fitr)"], {
    pic: "🎉",
  }),
  entry("x.ngente", "ngénte", ["naming ceremony", "baptême", "ceremonia del nombre", "Namensfeier", "cerimonia del nome"], {
    pic: "👶",
    note: [
      "A celebration a week after a baby is born, when the name is announced.",
      "Une fête une semaine après la naissance, quand on annonce le prénom.",
      "Una fiesta una semana después del nacimiento, cuando se anuncia el nombre.",
      "Ein Fest eine Woche nach der Geburt, bei dem der Name verkündet wird.",
      "Una festa una settimana dopo la nascita, quando si annuncia il nome.",
    ],
  }),
  entry("x.sey", "sëy", ["marriage", "mariage", "matrimonio", "Ehe, Heirat", "matrimonio"], { pic: "💍" }),
  entry("x.dewenati", "Dewenati!", [
    "Many happy returns!",
    "Bonne fête, à l'année prochaine !",
    "¡Felices fiestas y hasta el año que viene!",
    "Frohes Fest, bis nächstes Jahr!",
    "Buona festa, all'anno prossimo!",
  ], {
    note: [
      "Said at holidays: “may we see next year”.",
      "Se dit pendant les fêtes : « que nous voyions l'année prochaine ».",
      "Se dice en las fiestas: «que veamos el año que viene».",
      "Wird an Festtagen gesagt: „mögen wir das nächste Jahr erleben“.",
      "Si dice durante le feste: «che possiamo vedere il prossimo anno».",
    ],
  }),
  entry("x.baalmaaq", "Baal ma sama àq", [
    "Forgive me my wrongs",
    "Pardonne-moi mes torts",
    "Perdóname mis faltas",
    "Vergib mir meine Fehler",
    "Perdonami i miei torti",
  ], {
    note: [
      "Asked of friends and family at festivals, to start afresh.",
      "Se demande aux proches pendant les fêtes, pour repartir à zéro.",
      "Se pide a los allegados en las fiestas, para empezar de nuevo.",
      "Bittet man Freunde und Familie an Festtagen, um neu anzufangen.",
      "Si chiede a parenti e amici durante le feste, per ricominciare.",
    ],
  }),
  entry("x.baalnaala", "Baal naa la", ["I forgive you", "Je te pardonne", "Te perdono", "Ich vergebe dir", "Ti perdono"]),

  // culture-2
  entry("x.sabar", "sabar", ["sabar drum and dance", "sabar (tambour et danse)", "sabar (tambor y baile)", "Sabar (Trommel und Tanz)", "sabar (tamburo e danza)"], {
    pic: "🥁",
  }),
  entry("x.mbalax", "mbalax", ["mbalax music", "mbalax (musique)", "mbalax (música)", "Mbalax (Musik)", "mbalax (musica)"], {
    pic: "🎶",
    note: [
      "Senegal's popular dance music, built on sabar rhythms.",
      "La musique populaire du Sénégal, bâtie sur les rythmes du sabar.",
      "La música popular de Senegal, basada en los ritmos del sabar.",
      "Senegals populäre Tanzmusik auf Sabar-Rhythmen.",
      "La musica popolare del Senegal, costruita sui ritmi del sabar.",
    ],
  }),
  entry("x.woy", "woy", ["song, to sing", "chanson, chanter", "canción, cantar", "Lied, singen", "canzone, cantare"], { pic: "🎤" }),
  entry("x.fecc", "fecc", ["to dance", "danser", "bailar", "tanzen", "ballare"], { pic: "💃" }),
  entry("x.beggfecc", "Dama bëgg fecc", ["I want to dance", "Je veux danser", "Quiero bailar", "Ich möchte tanzen", "Voglio ballare"]),
  entry("x.ndank", "Ndank ndank mooy japp golo ci ñaay", [
    "Slowly, slowly catches the monkey in the forest",
    "Doucement, doucement, on attrape le singe dans la forêt",
    "Poco a poco se atrapa al mono en el bosque",
    "Langsam, langsam fängt man den Affen im Wald",
    "Piano piano si prende la scimmia nella foresta",
  ], {
    note: [
      "A proverb: patience wins. Fitting for language learners!",
      "Un proverbe : la patience paie. Parfait pour apprendre une langue !",
      "Un proverbio: la paciencia gana. ¡Ideal para aprender un idioma!",
      "Ein Sprichwort: Geduld zahlt sich aus. Perfekt fürs Sprachenlernen!",
      "Un proverbio: la pazienza vince. Perfetto per imparare una lingua!",
    ],
  }),
  entry("x.nitnit", "Nit, nit ay garabam", [
    "People are each other's remedy",
    "L'homme est le remède de l'homme",
    "Las personas son el remedio de las personas",
    "Der Mensch ist des Menschen Heilmittel",
    "L'uomo è il rimedio dell'uomo",
  ], {
    note: [
      "A famous proverb about solidarity at the heart of teraanga.",
      "Un proverbe célèbre sur la solidarité, au cœur de la teraanga.",
      "Un proverbio famoso sobre la solidaridad, en el corazón de la teraanga.",
      "Ein bekanntes Sprichwort über Solidarität, das Herz der Teraanga.",
      "Un proverbio famoso sulla solidarietà, al cuore della teraanga.",
    ],
  }),
];

export const unit: Unit = {
  id: "u12",
  glyph: "drum",
  tone: "sun",
  title: tx(["Celebrations and culture", "Fêtes et culture", "Fiestas y cultura", "Feste und Kultur", "Feste e cultura"]),
  lessons: [
    {
      id: "culture-1",
      title: tx(["Celebrations", "Les fêtes", "Las fiestas", "Feste", "Le feste"]),
      tip: tx([
        "At festivals people visit each other, say Dewenati! and ask forgiveness: Baal ma sama àq. The usual reply is Baal naa la.",
        "Pendant les fêtes, on se rend visite, on dit Dewenati ! et on demande pardon : Baal ma sama àq. On répond Baal naa la.",
        "En las fiestas la gente se visita, dice ¡Dewenati! y pide perdón: Baal ma sama àq. Se responde Baal naa la.",
        "An Festtagen besucht man sich, sagt Dewenati! und bittet um Vergebung: Baal ma sama àq. Man antwortet Baal naa la.",
        "Durante le feste ci si visita, si dice Dewenati! e si chiede perdono: Baal ma sama àq. Si risponde Baal naa la.",
      ]),
      entries: ["x.tabaski", "x.korite", "x.ngente", "x.sey", "x.dewenati", "x.baalmaaq", "x.baalnaala"],
      exercises: [
        { type: "pick_picture", entry: "x.tabaski" },
        { type: "pick_picture", entry: "x.ngente" },
        { type: "pick_picture", entry: "x.sey" },
        { type: "pick_meaning", entry: "x.korite" },
        { type: "pick_meaning", entry: "x.dewenati" },
        { type: "listen", entry: "x.dewenati" },
        { type: "pick_meaning", entry: "x.baalmaaq" },
        { type: "build", entry: "x.baalmaaq", distractors: ["naa", "la"] },
        { type: "pick_wolof", entry: "x.baalnaala" },
        { type: "match", entries: ["x.tabaski", "x.ngente", "x.sey", "x.baalnaala"] },
        { type: "type_wolof", entry: "x.sey" },
        { type: "speak", entry: "x.baalmaaq" },
      ],
    },
    {
      id: "culture-2",
      title: tx(["Music and proverbs", "Musique et proverbes", "Música y proverbios", "Musik und Sprichwörter", "Musica e proverbi"]),
      tip: tx([
        "Wolof is rich in proverbs. Using one at the right moment always earns a smile.",
        "Le wolof est riche en proverbes. En placer un au bon moment fait toujours sourire.",
        "El wolof es rico en proverbios. Usar uno en el momento justo siempre arranca una sonrisa.",
        "Wolof ist reich an Sprichwörtern. Eines im richtigen Moment zu benutzen, bringt immer ein Lächeln.",
        "Il wolof è ricco di proverbi. Usarne uno al momento giusto strappa sempre un sorriso.",
      ]),
      entries: ["x.sabar", "x.mbalax", "x.woy", "x.fecc", "x.beggfecc", "x.ndank", "x.nitnit"],
      exercises: [
        { type: "pick_picture", entry: "x.sabar" },
        { type: "pick_picture", entry: "x.woy" },
        { type: "pick_picture", entry: "x.fecc" },
        { type: "pick_meaning", entry: "x.mbalax" },
        { type: "listen", entry: "x.beggfecc" },
        { type: "build", entry: "x.beggfecc", distractors: ["woy", "naa"] },
        { type: "pick_meaning", entry: "x.ndank" },
        { type: "pick_meaning", entry: "x.nitnit" },
        { type: "match", entries: ["x.sabar", "x.woy", "x.fecc", "x.mbalax"] },
        { type: "fill_blank", entry: "x.nitnit", blank: 1, options: ["nit", "garab", "golo"] },
        { type: "type_wolof", entry: "x.fecc" },
        { type: "speak", entry: "x.nitnit" },
      ],
    },
  ],
};
