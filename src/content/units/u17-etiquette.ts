// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // etiquette-1
  entry("e.anasayaay", "Ana sa yaay?", ["How is your mother?", "Comment va ta mère ?", "¿Cómo está tu madre?", "Wie geht es deiner Mutter?", "Come sta tua madre?"], {
    note: [
      "Asking after each family member is part of a proper greeting; skipping it can seem cold.",
      "Demander des nouvelles de chaque membre de la famille fait partie d'une vraie salutation ; s'en passer peut paraître froid.",
      "Preguntar por cada miembro de la familia forma parte de un buen saludo; saltárselo puede parecer frío.",
      "Nach jedem Familienmitglied zu fragen gehört zu einer richtigen Begrüßung; es auszulassen wirkt kühl.",
      "Chiedere di ogni familiare fa parte di un vero saluto; saltarlo può sembrare freddo.",
    ],
  }),
  entry("e.anasabaay", "Ana sa baay?", ["How is your father?", "Comment va ton père ?", "¿Cómo está tu padre?", "Wie geht es deinem Vater?", "Come sta tuo padre?"]),
  entry("e.mungifi", "Mu ngi fi", ["He / she is fine", "Il / elle va bien", "Está bien", "Es geht ihm / ihr gut", "Sta bene"], {
    note: [
      "Literally “he / she is here”: the usual way to say someone is well.",
      "Littéralement « il / elle est là » : la façon courante de dire que quelqu'un va bien.",
      "Literalmente «está aquí»: la forma habitual de decir que alguien está bien.",
      "Wörtlich „er / sie ist hier“: so sagt man üblicherweise, dass es jemandem gut geht.",
      "Letteralmente «è qui»: il modo comune per dire che qualcuno sta bene.",
    ],
  }),
  entry("e.magni", "mag ñi", ["the elders", "les aînés", "los mayores", "die Älteren", "gli anziani"], {
    pic: "👴🏾",
    note: [
      "Greet elders first, let them speak first, and never interrupt them.",
      "Saluez d'abord les aînés, laissez-les parler en premier et ne les interrompez pas.",
      "Saluda primero a los mayores, déjales hablar primero y no los interrumpas.",
      "Begrüße zuerst die Älteren, lass sie zuerst sprechen und unterbrich sie nie.",
      "Saluta prima gli anziani, lasciali parlare per primi e non interromperli.",
    ],
  }),
  entry("e.ndeysaan", "Ndeysaan!", ["What a pity! / Poor thing!", "Quel dommage ! / Le pauvre !", "¡Qué pena! / ¡Pobre!", "Wie schade! / Der Arme!", "Che peccato! / Poverino!"], {
    note: [
      "Said to show sympathy when someone shares bad news.",
      "Se dit pour montrer sa compassion quand quelqu'un annonce une mauvaise nouvelle.",
      "Se dice para mostrar compasión cuando alguien cuenta una mala noticia.",
      "Sagt man, um Mitgefühl zu zeigen, wenn jemand schlechte Nachrichten erzählt.",
      "Si dice per mostrare compassione quando qualcuno dà una brutta notizia.",
    ],
  }),

  // etiquette-2
  entry("e.koor", "koor", ["Ramadan (the month of fasting)", "le Ramadan (mois du jeûne)", "el Ramadán (mes de ayuno)", "Ramadan (Fastenmonat)", "il Ramadan (mese del digiuno)"], {
    pic: "🌙",
    note: [
      "You'll also hear weeru koor, “the month of fasting”.",
      "On entend aussi weeru koor, « le mois du jeûne ».",
      "También se oye weeru koor, «el mes de ayuno».",
      "Man hört auch weeru koor, „der Fastenmonat“.",
      "Si sente anche weeru koor, «il mese del digiuno».",
    ],
  }),
  entry("e.woor", "woor", ["to fast", "jeûner", "ayunar", "fasten", "digiunare"]),
  entry("e.damawoor", "Dama woor", ["I'm fasting", "Je jeûne", "Estoy ayunando", "Ich faste", "Sto digiunando"]),
  entry("e.dangawoor", "Ndax danga woor?", ["Are you fasting?", "Tu jeûnes ?", "¿Estás ayunando?", "Fastest du?", "Stai digiunando?"]),
  entry("e.ndogu", "ndogu", ["meal that breaks the fast", "repas de rupture du jeûne", "comida que rompe el ayuno", "Mahlzeit zum Fastenbrechen", "pasto che rompe il digiuno"], {
    pic: "🍲",
    note: [
      "At sunset families and neighbours share the ndogu (often written ndogou), and passers-by are often invited in.",
      "Au coucher du soleil, familles et voisins partagent le ndogu (souvent écrit ndogou), et on invite volontiers les passants.",
      "Al ponerse el sol, familias y vecinos comparten el ndogu (a menudo escrito ndogou), y se suele invitar a quien pasa.",
      "Bei Sonnenuntergang teilen Familien und Nachbarn das Ndogu (oft ndogou geschrieben), und Vorbeikommende werden oft eingeladen.",
      "Al tramonto famiglie e vicini condividono il ndogu (spesso scritto ndogou), e chi passa viene spesso invitato.",
    ],
  }),
  entry("e.julli", "julli", ["to pray", "prier", "rezar", "beten", "pregare"], { pic: "🕌" }),
  entry("e.mungijulli", "Mu ngi julli", ["He / she is praying", "Il / elle prie", "Está rezando", "Er / sie betet gerade", "Sta pregando"]),

  // etiquette-3
  entry("e.gan", "gan", ["guest", "invité, hôte", "invitado", "Gast", "ospite"], { pic: "🧳" }),
  entry("e.toogalfii", "Toogal fii", ["Sit here", "Assieds-toi ici", "Siéntate aquí", "Setz dich hierhin", "Siediti qui"]),
  entry("e.joxmandox", "Jox ma ndox, su la neexee", [
    "Give me some water, please",
    "Donne-moi de l'eau, s'il te plaît",
    "Dame agua, por favor",
    "Gib mir bitte etwas Wasser",
    "Dammi dell'acqua, per favore",
  ]),
  entry("e.neexnalool", "Ceeb bi neex na lool", ["The rice is really good", "Le riz est vraiment bon", "El arroz está muy rico", "Der Reis ist richtig gut", "Il riso è davvero buono"], {
    note: [
      "Praising the food is the best compliment you can give your host.",
      "Complimenter le repas, c'est le plus beau compliment à faire à son hôte.",
      "Elogiar la comida es el mejor cumplido para tu anfitrión.",
      "Das Essen zu loben ist das schönste Kompliment für den Gastgeber.",
      "Lodare il cibo è il complimento più bello per chi ti ospita.",
    ],
  }),
  entry("e.jerejefsuur", "Jërëjëf, suur naa", ["Thank you, I'm full", "Merci, je suis rassasié", "Gracias, estoy lleno", "Danke, ich bin satt", "Grazie, sono sazio"], {
    note: [
      "Your host will keep offering food: saying you're full, with thanks, is the polite way to stop.",
      "Votre hôte vous resservira : dire qu'on est rassasié, en remerciant, est la façon polie d'arrêter.",
      "Tu anfitrión seguirá ofreciendo comida: decir que estás lleno, dando las gracias, es la forma educada de parar.",
      "Der Gastgeber bietet immer wieder Essen an: Mit Dank zu sagen, dass man satt ist, ist die höfliche Art aufzuhören.",
      "Chi ti ospita continuerà a offrirti cibo: dire che sei sazio, ringraziando, è il modo cortese di fermarsi.",
    ],
  }),
];

export const unit: Unit = {
  id: "u17",
  glyph: "wave",
  tone: "sea",
  title: tx(["Culture and etiquette", "Culture et savoir-vivre", "Cultura y buenos modales", "Kultur und Umgangsformen", "Cultura e buone maniere"]),
  lessons: [
    {
      id: "etiquette-1",
      title: tx(["Greeting the right way", "Bien saluer", "Saludar como es debido", "Richtig grüßen", "Salutare come si deve"]),
      tip: tx([
        "Always greet before anything else, even in a shop or an office. Shake hands with your right hand; with someone of the opposite sex, wait for them to offer theirs.",
        "Saluez toujours avant toute chose, même dans une boutique ou un bureau. Serrez la main droite ; avec une personne de l'autre sexe, attendez qu'elle tende la main.",
        "Saluda siempre antes que nada, también en una tienda o una oficina. Da la mano derecha; con alguien del otro sexo, espera a que te la ofrezca.",
        "Grüße immer zuerst, auch im Laden oder im Büro. Gib die rechte Hand; bei Personen des anderen Geschlechts warte, bis sie dir die Hand reichen.",
        "Saluta sempre prima di tutto, anche in un negozio o in un ufficio. Stringi la mano destra; con una persona dell'altro sesso, aspetta che sia lei a porgerla.",
      ]),
      entries: ["e.anasayaay", "e.anasabaay", "e.mungifi", "e.magni", "e.ndeysaan"],
      exercises: [
        { type: "pick_meaning", entry: "e.anasayaay" },
        { type: "pick_meaning", entry: "e.mungifi" },
        { type: "listen", entry: "e.anasabaay" },
        { type: "pick_picture", entry: "e.magni" },
        { type: "fill_blank", entry: "e.anasayaay", blank: 2, options: ["yaay", "baay", "xarit"] },
        { type: "match", entries: ["e.anasayaay", "e.anasabaay", "e.mungifi", "e.ndeysaan"] },
        { type: "pick_wolof", entry: "e.ndeysaan" },
        { type: "build", entry: "e.anasabaay", distractors: ["fi", "mu"] },
        { type: "pick_wolof", entry: "e.mungifi" },
        { type: "type_wolof", entry: "e.anasayaay" },
        { type: "listen", entry: "e.ndeysaan" },
        { type: "speak", entry: "e.anasayaay" },
      ],
    },
    {
      id: "etiquette-2",
      title: tx(["Ramadan and prayer", "Ramadan et prière", "Ramadán y oración", "Ramadan und Gebet", "Ramadan e preghiera"]),
      tip: tx([
        "During Ramadan, avoid eating, drinking or smoking in public in the daytime. Don't walk in front of someone who is praying, and dress modestly near mosques.",
        "Pendant le Ramadan, évitez de manger, boire ou fumer en public dans la journée. Ne passez pas devant quelqu'un qui prie, et habillez-vous sobrement près des mosquées.",
        "Durante el Ramadán, evita comer, beber o fumar en público de día. No pases por delante de alguien que reza y vístete con recato cerca de las mezquitas.",
        "Im Ramadan isst, trinkt und raucht man tagsüber nicht in der Öffentlichkeit. Geh nicht vor jemandem vorbei, der betet, und kleide dich in der Nähe von Moscheen zurückhaltend.",
        "Durante il Ramadan evita di mangiare, bere o fumare in pubblico di giorno. Non passare davanti a chi prega e vestiti in modo sobrio vicino alle moschee.",
      ]),
      entries: ["e.koor", "e.woor", "e.damawoor", "e.dangawoor", "e.ndogu", "e.julli", "e.mungijulli"],
      exercises: [
        { type: "pick_picture", entry: "e.koor" },
        { type: "pick_meaning", entry: "e.woor" },
        { type: "pick_meaning", entry: "e.damawoor" },
        { type: "listen", entry: "e.dangawoor" },
        { type: "pick_picture", entry: "e.ndogu" },
        { type: "match", entries: ["e.koor", "e.woor", "e.ndogu", "e.julli"] },
        { type: "pick_wolof", entry: "e.dangawoor" },
        { type: "fill_blank", entry: "e.mungijulli", blank: 2, options: ["julli", "woor", "lekk"] },
        { type: "build", entry: "e.dangawoor", distractors: ["dama", "julli"] },
        { type: "pick_meaning", entry: "e.mungijulli" },
        { type: "type_wolof", entry: "e.damawoor" },
        { type: "speak", entry: "e.dangawoor" },
      ],
    },
    {
      id: "etiquette-3",
      title: tx(["Being a good guest", "Être un bon invité", "Ser un buen invitado", "Ein guter Gast sein", "Essere un buon ospite"]),
      tip: tx([
        "Meals are often shared from one big bowl: wash your hands, eat with your right hand from the part in front of you, and let the host share out the meat.",
        "On mange souvent dans un grand plat commun : lavez-vous les mains, mangez de la main droite dans la partie devant vous, et laissez l'hôte répartir la viande.",
        "A menudo se come de una gran fuente común: lávate las manos, come con la mano derecha de la parte que tienes delante y deja que el anfitrión reparta la carne.",
        "Oft isst man aus einer großen gemeinsamen Schüssel: Hände waschen, mit der rechten Hand vom Teil vor dir essen und das Fleisch vom Gastgeber verteilen lassen.",
        "Spesso si mangia da un grande piatto comune: lavati le mani, mangia con la mano destra dalla parte davanti a te e lascia che sia chi ospita a distribuire la carne.",
      ]),
      entries: ["e.gan", "e.toogalfii", "e.joxmandox", "e.neexnalool", "e.jerejefsuur"],
      exercises: [
        { type: "pick_picture", entry: "e.gan" },
        { type: "pick_meaning", entry: "e.toogalfii" },
        { type: "listen", entry: "e.joxmandox" },
        { type: "pick_meaning", entry: "e.jerejefsuur" },
        { type: "build", entry: "e.joxmandox", distractors: ["mburu", "naa"] },
        { type: "pick_wolof", entry: "e.neexnalool" },
        { type: "fill_blank", entry: "e.jerejefsuur", blank: 1, options: ["suur", "xiif", "mar"] },
        { type: "match", entries: ["e.gan", "e.toogalfii", "e.neexnalool", "e.jerejefsuur"] },
        { type: "pick_wolof", entry: "e.toogalfii" },
        { type: "fill_blank", entry: "e.neexnalool", blank: 4, options: ["lool", "tuuti", "rekk"] },
        { type: "type_wolof", entry: "e.toogalfii" },
        { type: "speak", entry: "e.jerejefsuur" },
      ],
    },
  ],
};
