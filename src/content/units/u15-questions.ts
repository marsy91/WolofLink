// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // questions-1
  entry("q.kan", "Kan?", ["Who?", "Qui ?", "¿Quién?", "Wer?", "Chi?"]),
  entry("q.lutax", "Lu tax?", ["Why?", "Pourquoi ?", "¿Por qué?", "Warum?", "Perché?"], {
    note: [
      "Literally “what caused (it)?”.",
      "Littéralement « qu'est-ce qui a causé (cela) ? ».",
      "Literalmente «¿qué lo causó?».",
      "Wörtlich „was hat (es) verursacht?“.",
      "Letteralmente «che cosa (lo) ha causato?».",
    ],
  }),
  entry("q.ban", "Ban?", ["Which?", "Lequel ?", "¿Cuál?", "Welcher?", "Quale?"]),
  entry("q.naka", "Naka?", ["How?", "Comment ?", "¿Cómo?", "Wie?", "Come?"]),
  entry("q.kiikanla", "Kii kan la?", ["Who is this?", "Qui est-ce ?", "¿Quién es?", "Wer ist das?", "Chi è?"]),
  entry("q.lannga", "Lan nga bëgg?", ["What do you want?", "Qu'est-ce que tu veux ?", "¿Qué quieres?", "Was möchtest du?", "Cosa vuoi?"]),
  entry("q.banngabegg", "Ban nga bëgg?", ["Which one do you want?", "Lequel veux-tu ?", "¿Cuál quieres?", "Welchen möchtest du?", "Quale vuoi?"]),

  // questions-2
  entry("q.nakalatudd", "Naka la tudd?", ["What's his or her name?", "Comment s'appelle-t-il ou elle ?", "¿Cómo se llama?", "Wie heißt er oder sie?", "Come si chiama?"]),
  entry("q.fanladekk", "Fan la dëkk?", ["Where does he or she live?", "Où habite-t-il ou elle ?", "¿Dónde vive?", "Wo wohnt er oder sie?", "Dove abita?"]),
  entry("q.naatadoom", "Ñaata doom nga am?", ["How many children do you have?", "Combien d'enfants as-tu ?", "¿Cuántos hijos tienes?", "Wie viele Kinder hast du?", "Quanti figli hai?"]),
  entry("q.kanmoonew", "Kan moo ñëw?", ["Who came?", "Qui est venu ?", "¿Quién vino?", "Wer ist gekommen?", "Chi è venuto?"], {
    note: [
      "Moo puts the stress on the person: “who is it that came?”",
      "Moo met l'accent sur la personne : « qui est-ce qui est venu ? »",
      "Moo pone el énfasis en la persona: «¿quién es el que vino?»",
      "Moo betont die Person: „Wer ist es, der gekommen ist?“",
      "Moo mette in risalto la persona: «chi è che è venuto?»",
    ],
  }),
  entry("q.lutaxnga", "Lu tax nga ñëwul?", ["Why didn't you come?", "Pourquoi tu n'es pas venu ?", "¿Por qué no viniste?", "Warum bist du nicht gekommen?", "Perché non sei venuto?"], {
    note: [
      "-ul makes a verb negative: ñëw “come”, ñëwul “didn't come”.",
      "-ul met un verbe à la forme négative : ñëw « venir », ñëwul « n'est pas venu ».",
      "-ul niega un verbo: ñëw «venir», ñëwul «no vino».",
      "-ul verneint ein Verb: ñëw „kommen“, ñëwul „ist nicht gekommen“.",
      "-ul rende negativo un verbo: ñëw «venire», ñëwul «non è venuto».",
    ],
  }),
  entry("q.feebaroon", "Dama feebaroon", ["I was ill", "J'étais malade", "Estaba enfermo", "Ich war krank", "Ero malato"], {
    note: [
      "-oon puts a sentence in the past: Dama feebar “I'm ill”, Dama feebaroon “I was ill”.",
      "-oon met la phrase au passé : Dama feebar « je suis malade », Dama feebaroon « j'étais malade ».",
      "-oon pone la frase en pasado: Dama feebar «estoy enfermo», Dama feebaroon «estaba enfermo».",
      "-oon setzt den Satz in die Vergangenheit: Dama feebar „ich bin krank“, Dama feebaroon „ich war krank“.",
      "-oon mette la frase al passato: Dama feebar «sono malato», Dama feebaroon «ero malato».",
    ],
  }),

  // questions-3
  entry("q.ndaxdinga", "Ndax dinga ñëw?", ["Will you come?", "Tu viendras ?", "¿Vendrás?", "Kommst du?", "Verrai?"]),
  entry("q.waawdinaa", "Waaw, dinaa ñëw", ["Yes, I'll come", "Oui, je viendrai", "Sí, vendré", "Ja, ich komme", "Sì, verrò"]),
  entry("q.menngasuba", "Ndax mën nga ñëw suba?", ["Can you come tomorrow?", "Tu peux venir demain ?", "¿Puedes venir mañana?", "Kannst du morgen kommen?", "Puoi venire domani?"]),
  entry("q.menuma", "Mënuma ñëw", ["I can't come", "Je ne peux pas venir", "No puedo venir", "Ich kann nicht kommen", "Non posso venire"]),
  entry("q.banwaxtu", "Ban waxtu?", ["What time?", "À quelle heure ?", "¿A qué hora?", "Um wie viel Uhr?", "A che ora?"]),
  entry("q.baaxna", "Baax na", ["OK, that's fine", "D'accord, c'est bien", "Vale, está bien", "Okay, gut", "Va bene"]),
  entry("q.nudem", "Ñu dem!", ["Let's go!", "Allons-y !", "¡Vamos!", "Los geht's!", "Andiamo!"]),
];

export const unit: Unit = {
  id: "u15",
  glyph: "question",
  tone: "clay",
  title: tx(["Asking questions", "Poser des questions", "Hacer preguntas", "Fragen stellen", "Fare domande"]),
  lessons: [
    {
      id: "questions-1",
      title: tx(["Question words", "Les mots interrogatifs", "Palabras interrogativas", "Fragewörter", "Parole interrogative"]),
      tip: tx([
        "Question words go first: Kan? “who?”, Lan? “what?”, Fan? “where?”, Kañ? “when?”, Lu tax? “why?”.",
        "Les mots interrogatifs viennent en premier : Kan ? « qui ? », Lan ? « quoi ? », Fan ? « où ? », Kañ ? « quand ? », Lu tax ? « pourquoi ? ».",
        "Las palabras interrogativas van primero: ¿Kan? «¿quién?», ¿Lan? «¿qué?», ¿Fan? «¿dónde?», ¿Kañ? «¿cuándo?», ¿Lu tax? «¿por qué?».",
        "Fragewörter stehen vorn: Kan? „wer?“, Lan? „was?“, Fan? „wo?“, Kañ? „wann?“, Lu tax? „warum?“.",
        "Le parole interrogative vanno all'inizio: Kan? «chi?», Lan? «cosa?», Fan? «dove?», Kañ? «quando?», Lu tax? «perché?».",
      ]),
      entries: ["q.kan", "q.lutax", "q.ban", "q.naka", "q.kiikanla", "q.lannga", "q.banngabegg"],
      exercises: [
        { type: "pick_meaning", entry: "q.kan" },
        { type: "pick_meaning", entry: "q.lutax" },
        { type: "pick_meaning", entry: "q.ban" },
        { type: "match", entries: ["q.kan", "q.lutax", "q.ban", "q.naka"] },
        { type: "listen", entry: "q.kiikanla" },
        { type: "pick_wolof", entry: "q.lannga" },
        { type: "build", entry: "q.lannga", distractors: ["kan", "la"] },
        { type: "pick_meaning", entry: "q.banngabegg" },
        { type: "fill_blank", entry: "q.banngabegg", blank: 0, options: ["Ban", "Kan", "Naka"] },
        { type: "pick_wolof", entry: "q.naka" },
        { type: "type_wolof", entry: "q.kan" },
        { type: "speak", entry: "q.kiikanla" },
      ],
    },
    {
      id: "questions-2",
      title: tx(["Asking about people", "Parler des gens", "Preguntar por la gente", "Nach Leuten fragen", "Chiedere delle persone"]),
      tip: tx([
        "Nga means “you” and la means “he / she” in these questions: Naka nga tudd? “what's your name?”, Naka la tudd? “what's his or her name?”.",
        "Dans ces questions, nga veut dire « tu » et la « il / elle » : Naka nga tudd ? « comment tu t'appelles ? », Naka la tudd ? « comment il ou elle s'appelle ? ».",
        "En estas preguntas, nga significa «tú» y la «él / ella»: ¿Naka nga tudd? «¿cómo te llamas?», ¿Naka la tudd? «¿cómo se llama?».",
        "In diesen Fragen heißt nga „du“ und la „er / sie“: Naka nga tudd? „wie heißt du?“, Naka la tudd? „wie heißt er oder sie?“.",
        "In queste domande nga significa «tu» e la «lui / lei»: Naka nga tudd? «come ti chiami?», Naka la tudd? «come si chiama?».",
      ]),
      entries: ["q.nakalatudd", "q.fanladekk", "q.naatadoom", "q.kanmoonew", "q.lutaxnga", "q.feebaroon"],
      exercises: [
        { type: "pick_meaning", entry: "q.nakalatudd" },
        { type: "pick_meaning", entry: "q.fanladekk" },
        { type: "listen", entry: "q.naatadoom" },
        { type: "build", entry: "q.naatadoom", distractors: ["la", "xale"] },
        { type: "pick_meaning", entry: "q.kanmoonew" },
        { type: "pick_wolof", entry: "q.lutaxnga" },
        { type: "pick_meaning", entry: "q.feebaroon" },
        { type: "fill_blank", entry: "q.fanladekk", blank: 1, options: ["la", "nga", "naa"] },
        { type: "build", entry: "q.lutaxnga", distractors: ["kan", "dem"] },
        { type: "listen", entry: "q.kanmoonew" },
        { type: "type_wolof", entry: "q.nakalatudd" },
        { type: "speak", entry: "q.lutaxnga" },
      ],
    },
    {
      id: "questions-3",
      title: tx(["Making plans", "Faire des projets", "Hacer planes", "Pläne machen", "Fare programmi"]),
      tip: tx([
        "Di- marks the future: dinaa “I will”, dinga “you will”. Ndax at the start turns a sentence into a yes/no question.",
        "Di- marque le futur : dinaa « je vais », dinga « tu vas ». Ndax au début transforme une phrase en question fermée.",
        "Di- marca el futuro: dinaa «yo iré / haré», dinga «tú…». Ndax al principio convierte la frase en una pregunta de sí o no.",
        "Di- zeigt die Zukunft an: dinaa „ich werde“, dinga „du wirst“. Ndax am Anfang macht aus einem Satz eine Ja-/Nein-Frage.",
        "Di- indica il futuro: dinaa «io farò», dinga «tu farai». Ndax all'inizio trasforma la frase in una domanda sì/no.",
      ]),
      entries: ["q.ndaxdinga", "q.waawdinaa", "q.menngasuba", "q.menuma", "q.banwaxtu", "q.baaxna", "q.nudem"],
      exercises: [
        { type: "pick_meaning", entry: "q.ndaxdinga" },
        { type: "pick_meaning", entry: "q.waawdinaa" },
        { type: "listen", entry: "q.menngasuba" },
        { type: "pick_wolof", entry: "q.menuma" },
        { type: "match", entries: ["q.banwaxtu", "q.baaxna", "q.nudem", "q.menuma"] },
        { type: "build", entry: "q.menngasuba", distractors: ["dinaa", "fan"] },
        { type: "fill_blank", entry: "q.waawdinaa", blank: 1, options: ["dinaa", "dinga", "mënuma"] },
        { type: "pick_wolof", entry: "q.ndaxdinga" },
        { type: "pick_meaning", entry: "q.baaxna" },
        { type: "listen", entry: "q.nudem" },
        { type: "type_wolof", entry: "q.baaxna" },
        { type: "speak", entry: "q.ndaxdinga" },
      ],
    },
  ],
};
