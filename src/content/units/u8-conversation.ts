import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // conversation-1
  entry("c.dimbali", "Ndax mën nga ma dimbali?", [
    "Can you help me?",
    "Peux-tu m'aider ?",
    "¿Puedes ayudarme?",
    "Kannst du mir helfen?",
    "Puoi aiutarmi?",
  ]),
  entry("c.lii", "Lii lan la?", ["What is this?", "Qu'est-ce que c'est ?", "¿Qué es esto?", "Was ist das?", "Che cos'è questo?"]),
  entry("c.baal", "Baal ma", ["Sorry, excuse me", "Pardon", "Perdón", "Entschuldigung", "Scusa"]),
  entry("c.amulsolo", "Amul solo", ["No problem", "Pas de problème", "No pasa nada", "Kein Problem", "Nessun problema"], {
    note: [
      "Literally “it has no importance”.",
      "Littéralement « ça n'a pas d'importance ».",
      "Literalmente «no tiene importancia».",
      "Wörtlich „es hat keine Bedeutung“.",
      "Letteralmente «non ha importanza».",
    ],
  }),
  entry("c.deggnaa", "Dégg naa", ["I understand", "Je comprends", "Entiendo", "Ich verstehe", "Capisco"]),
  entry("c.mennaa", "Mën naa", ["I can", "Je peux", "Puedo", "Ich kann", "Posso"]),
  entry("c.waxal", "Waxal ndank", ["Speak slowly", "Parle lentement", "Habla despacio", "Sprich langsam", "Parla piano"]),
  entry("c.maangidem", "Maa ngi dem", ["I'm leaving", "Je m'en vais", "Me voy", "Ich gehe jetzt", "Me ne vado"]),

  // conversation-2
  entry("c.dalal", "Dalal ak jàmm", ["Welcome", "Bienvenue", "Bienvenido", "Willkommen", "Benvenuto"], {
    note: [
      "Literally “settle in peace”.",
      "Littéralement « installe-toi en paix ».",
      "Literalmente «instálate en paz».",
      "Wörtlich „lass dich in Frieden nieder“.",
      "Letteralmente «sistemati in pace».",
    ],
  }),
  entry("c.jamm", "Jàmm nga am?", [
    "Are you at peace?",
    "Es-tu en paix ?",
    "¿Estás en paz?",
    "Bist du in Frieden?",
    "Sei in pace?",
  ]),
  entry("c.jammrekk", "Jàmm rekk", [
    "Peace only (all is well)",
    "La paix seulement (tout va bien)",
    "Solo paz (todo bien)",
    "Nur Frieden (alles gut)",
    "Solo pace (tutto bene)",
  ]),
  entry("c.toogal", "Toogal", ["Sit down", "Assieds-toi", "Siéntate", "Setz dich", "Siediti"]),
  entry("c.kaay", "Kaay lekk!", ["Come and eat!", "Viens manger !", "¡Ven a comer!", "Komm essen!", "Vieni a mangiare!"]),
  entry("c.suur", "Suur naa", ["I'm full", "J'ai assez mangé", "Estoy lleno/a", "Ich bin satt", "Sono sazio/a"]),
  entry("c.neexlool", "Neex na lool", [
    "It's really delicious",
    "C'est vraiment délicieux",
    "Está riquísimo",
    "Es ist sehr lecker",
    "È buonissimo",
  ], {
    note: ["Lool means “very”.", "Lool veut dire « très ».", "Lool significa «muy».", "Lool heißt „sehr“.", "Lool significa «molto»."],
  }),
  entry("c.nookobokk", "Ñoo ko bokk", ["You're welcome", "De rien", "De nada", "Gern geschehen", "Prego"], {
    note: [
      "A reply to thanks; literally “we share it”.",
      "Réponse à un merci ; littéralement « nous le partageons ».",
      "Respuesta a un gracias; literalmente «lo compartimos».",
      "Antwort auf Danke; wörtlich „wir teilen es“.",
      "Risposta a un grazie; letteralmente «lo condividiamo».",
    ],
  }),
  entry("c.amul", "Amul", ["There isn't any", "Il n'y en a pas", "No hay", "Es gibt keins", "Non ce n'è"]),
  entry("c.teraanga", "teraanga", ["hospitality", "hospitalité", "hospitalidad", "Gastfreundschaft", "ospitalità"], {
    note: [
      "Often written “teranga”: the Senegalese ideal of welcoming guests.",
      "Souvent écrit « teranga » : l'idéal sénégalais d'accueil.",
      "A menudo escrito «teranga»: el ideal senegalés de acoger al invitado.",
      "Oft „Teranga“ geschrieben: das senegalesische Ideal der Gastfreundschaft.",
      "Spesso scritto «teranga»: l'ideale senegalese dell'accoglienza.",
    ],
  }),
];

export const unit: Unit = {
  id: "u8",
  glyph: "chat",
  tone: "dusk",
  title: tx([
    "Everyday conversation",
    "Conversation de tous les jours",
    "Conversación cotidiana",
    "Alltagsgespräche",
    "Conversazione quotidiana",
  ]),
  lessons: [
    {
      id: "conversation-1",
      title: tx(["Getting by", "Se débrouiller", "Arreglárselas", "Zurechtkommen", "Cavarsela"]),
      tip: tx([
        "Ndax at the start turns a sentence into a yes/no question: Ndax mën nga ma dimbali? “Can you help me?”",
        "Ndax en début de phrase en fait une question fermée : Ndax mën nga ma dimbali? « Peux-tu m'aider ? »",
        "Ndax al principio convierte la frase en una pregunta de sí o no: Ndax mën nga ma dimbali? «¿Puedes ayudarme?»",
        "Ndax am Satzanfang macht daraus eine Ja/Nein-Frage: Ndax mën nga ma dimbali? „Kannst du mir helfen?“",
        "Ndax all'inizio trasforma la frase in una domanda sì/no: Ndax mën nga ma dimbali? «Puoi aiutarmi?»",
      ]),
      entries: [
        "c.dimbali",
        "c.lii",
        "c.baal",
        "c.amulsolo",
        "c.deggnaa",
        "c.mennaa",
        "c.waxal",
        "c.maangidem",
      ],
      exercises: [
        { type: "pick_meaning", entry: "c.dimbali" },
        { type: "pick_meaning", entry: "c.lii" },
        { type: "pick_meaning", entry: "c.amulsolo" },
        { type: "match", entries: ["c.baal", "c.amulsolo", "c.deggnaa", "c.mennaa"] },
        { type: "listen", entry: "c.lii" },
        { type: "build", entry: "c.lii", distractors: ["nga", "ma"] },
        { type: "pick_wolof", entry: "c.waxal" },
        { type: "fill_blank", entry: "c.waxal", blank: 1, options: ["ndank", "fii", "tuuti"] },
        { type: "pick_meaning", entry: "c.maangidem" },
        { type: "pick_wolof", entry: "c.dimbali" },
        { type: "build", entry: "c.dimbali", distractors: ["la", "lan"] },
        { type: "speak", entry: "c.dimbali" },
      ],
    },
    {
      id: "conversation-2",
      title: tx([
        "Teraanga: guests and meals",
        "Teraanga : invités et repas",
        "Teraanga: invitados y comidas",
        "Teraanga: Gäste und Essen",
        "Teraanga: ospiti e pasti",
      ]),
      tip: tx([
        "Teraanga (hospitality) is central in Senegal. Guests hear Dalal ak jàmm and are invited to share the meal: Kaay lekk!",
        "La teraanga (hospitalité) est essentielle au Sénégal. On accueille avec Dalal ak jàmm et on invite à partager le repas : Kaay lekk !",
        "La teraanga (hospitalidad) es esencial en Senegal. Se recibe con Dalal ak jàmm y se invita a compartir la comida: ¡Kaay lekk!",
        "Teraanga (Gastfreundschaft) ist im Senegal zentral. Gäste hören Dalal ak jàmm und werden zum Essen eingeladen: Kaay lekk!",
        "La teraanga (ospitalità) è centrale in Senegal. Gli ospiti sentono Dalal ak jàmm e sono invitati a condividere il pasto: Kaay lekk!",
      ]),
      entries: [
        "c.dalal",
        "c.jamm",
        "c.jammrekk",
        "c.toogal",
        "c.kaay",
        "c.suur",
        "c.neexlool",
        "c.nookobokk",
        "c.amul",
        "c.teraanga",
      ],
      exercises: [
        { type: "pick_meaning", entry: "c.dalal" },
        { type: "pick_meaning", entry: "c.jamm" },
        { type: "pick_meaning", entry: "c.jammrekk" },
        { type: "pick_meaning", entry: "c.toogal" },
        { type: "pick_meaning", entry: "c.kaay" },
        { type: "match", entries: ["c.suur", "c.neexlool", "c.nookobokk", "c.amul"] },
        { type: "listen", entry: "c.kaay" },
        { type: "build", entry: "c.neexlool", distractors: ["naa", "rekk"] },
        { type: "fill_blank", entry: "c.jammrekk", blank: 1, options: ["rekk", "lool", "naa"] },
        { type: "pick_wolof", entry: "c.nookobokk" },
        { type: "pick_meaning", entry: "c.teraanga" },
        { type: "speak", entry: "c.dalal" },
      ],
    },
  ],
};
