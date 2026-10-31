// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // work-1
  entry("w.janglekat", "jàngalekat", ["teacher", "enseignant(e)", "profesor(a)", "Lehrer(in)", "insegnante"], { pic: "🧑‍🏫" }),
  entry("w.beykat", "beykat", ["farmer", "cultivateur", "agricultor(a)", "Bauer, Bäuerin", "contadino/a"], { pic: "🧑‍🌾" }),
  entry("w.napkat", "nappkat", ["fisher", "pêcheur", "pescador(a)", "Fischer(in)", "pescatore"], { pic: "🎣" }),
  entry("w.jaaykat", "jaaykat", ["seller, trader", "vendeur, commerçant", "vendedor(a)", "Verkäufer(in)", "venditore"], { pic: "🏷️" }),
  entry("w.dawalkat", "dawalkat", ["driver", "chauffeur", "conductor(a)", "Fahrer(in)", "autista"], { pic: "🚖" }),
  entry("w.lanngayligeey", "Lan ngay liggéey?", [
    "What's your job?",
    "Quel est ton métier ?",
    "¿En qué trabajas?",
    "Was arbeitest du?",
    "Che lavoro fai?",
  ]),
  entry("w.jangalekatlaa", "Jàngalekat laa", ["I'm a teacher", "Je suis enseignant(e)", "Soy profesor(a)", "Ich bin Lehrer(in)", "Sono insegnante"], {
    note: [
      "-kat makes a person who does something: jàngale (teach) → jàngalekat, jaay (sell) → jaaykat.",
      "-kat désigne celui qui fait l'action : jàngale (enseigner) → jàngalekat, jaay (vendre) → jaaykat.",
      "-kat indica a quien hace algo: jàngale (enseñar) → jàngalekat, jaay (vender) → jaaykat.",
      "-kat bildet die Person, die etwas tut: jàngale (lehren) → jàngalekat, jaay (verkaufen) → jaaykat.",
      "-kat indica chi fa qualcosa: jàngale (insegnare) → jàngalekat, jaay (vendere) → jaaykat.",
    ],
  }),

  // work-2
  entry("w.ndongo", "ndongo", ["student, pupil", "élève, étudiant(e)", "alumno/a", "Schüler(in)", "studente"], { pic: "🎒" }),
  entry("w.teere", "téere", ["book", "livre", "libro", "Buch", "libro"], { pic: "📕" }),
  entry("w.kaayit", "kayit", ["paper", "papier", "papel", "Papier", "carta"], { pic: "📄" }),
  entry("w.bind", "bind", ["to write", "écrire", "escribir", "schreiben", "scrivere"], { pic: "✍️" }),
  entry("w.laaj", "laaj", ["to ask", "demander", "preguntar", "fragen", "chiedere"], { pic: "❓" }),
  entry("w.maangibind", "Maa ngi bind", ["I'm writing", "J'écris", "Estoy escribiendo", "Ich schreibe gerade", "Sto scrivendo"]),
  entry("w.ubbil", "Ubbil téere bi", ["Open the book", "Ouvre le livre", "Abre el libro", "Öffne das Buch", "Apri il libro"]),
];

export const unit: Unit = {
  id: "u10",
  glyph: "briefcase",
  tone: "clay",
  title: tx(["Work and school", "Travail et école", "Trabajo y escuela", "Arbeit und Schule", "Lavoro e scuola"]),
  lessons: [
    {
      id: "work-1",
      title: tx(["Jobs", "Les métiers", "Los oficios", "Berufe", "I mestieri"]),
      tip: tx([
        "Add -kat to a verb to name the person who does it: bey (farm) → beykat, dawal (drive) → dawalkat.",
        "Ajoutez -kat à un verbe pour nommer celui qui le fait : bey (cultiver) → beykat, dawal (conduire) → dawalkat.",
        "Añade -kat a un verbo para nombrar a quien lo hace: bey (cultivar) → beykat, dawal (conducir) → dawalkat.",
        "Mit -kat am Verb benennt man die Person: bey (Feld bestellen) → beykat, dawal (fahren) → dawalkat.",
        "Aggiungi -kat a un verbo per chi lo fa: bey (coltivare) → beykat, dawal (guidare) → dawalkat.",
      ]),
      entries: ["w.janglekat", "w.beykat", "w.napkat", "w.jaaykat", "w.dawalkat", "w.lanngayligeey", "w.jangalekatlaa"],
      exercises: [
        { type: "pick_picture", entry: "w.janglekat" },
        { type: "pick_picture", entry: "w.beykat" },
        { type: "pick_picture", entry: "w.napkat" },
        { type: "pick_meaning", entry: "w.jaaykat" },
        { type: "match", entries: ["w.janglekat", "w.beykat", "w.dawalkat", "w.jaaykat"] },
        { type: "listen", entry: "w.dawalkat" },
        { type: "pick_meaning", entry: "w.lanngayligeey" },
        { type: "pick_meaning", entry: "w.jangalekatlaa" },
        { type: "build", entry: "w.lanngayligeey", distractors: ["laa", "def"] },
        { type: "pick_wolof", entry: "w.napkat" },
        { type: "type_wolof", entry: "w.jaaykat" },
        { type: "speak", entry: "w.jangalekatlaa" },
      ],
    },
    {
      id: "work-2",
      title: tx(["At school", "À l'école", "En la escuela", "In der Schule", "A scuola"]),
      tip: tx([
        "bi after a noun means “the” for a thing nearby: téere bi, “the book”.",
        "bi après un nom veut dire « le / la » pour une chose proche : téere bi, « le livre ».",
        "bi tras un sustantivo significa «el / la» para algo cercano: téere bi, «el libro».",
        "bi nach einem Nomen heißt „der / die / das“ für etwas in der Nähe: téere bi, „das Buch“.",
        "bi dopo un nome significa «il / la» per qualcosa di vicino: téere bi, «il libro».",
      ]),
      entries: ["w.ndongo", "w.teere", "w.kaayit", "w.bind", "w.laaj", "w.maangibind", "w.ubbil"],
      exercises: [
        { type: "pick_picture", entry: "w.teere" },
        { type: "pick_picture", entry: "w.kaayit" },
        { type: "pick_picture", entry: "w.ndongo" },
        { type: "pick_meaning", entry: "w.bind" },
        { type: "pick_meaning", entry: "w.laaj" },
        { type: "match", entries: ["w.teere", "w.kaayit", "w.bind", "w.laaj"] },
        { type: "listen", entry: "w.maangibind" },
        { type: "pick_meaning", entry: "w.ubbil" },
        { type: "build", entry: "w.ubbil", distractors: ["kaayit", "bind"] },
        { type: "fill_blank", entry: "w.maangibind", blank: 2, options: ["bind", "jàng", "laaj"] },
        { type: "type_wolof", entry: "w.teere" },
        { type: "speak", entry: "w.ubbil" },
      ],
    },
  ],
};
