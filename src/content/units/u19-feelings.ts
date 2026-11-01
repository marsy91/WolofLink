// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // feelings-1
  entry("m.mer", "Dama mer", ["I'm angry", "Je suis fâché", "Estoy enfadado", "Ich bin wütend", "Sono arrabbiato"], { pic: "😠" }),
  entry("m.ragal", "Dama ragal", ["I'm scared", "J'ai peur", "Tengo miedo", "Ich habe Angst", "Ho paura"], { pic: "😨" }),
  entry("m.yeemu", "Dama yéemu", ["I'm surprised", "Je suis étonné", "Estoy sorprendido", "Ich bin überrascht", "Sono sorpreso"], { pic: "😮" }),
  entry("m.rus", "Dama rus", ["I'm embarrassed", "J'ai honte, je suis gêné", "Me da vergüenza", "Es ist mir peinlich", "Mi vergogno"], { pic: "😳" }),
  entry("m.jaaxle", "Dama jaaxle", ["I'm worried", "Je suis inquiet", "Estoy preocupado", "Ich mache mir Sorgen", "Sono preoccupato"], { pic: "😟" }),

  // feelings-2
  entry("m.lulada", "Lu la dal?", ["What happened to you?", "Qu'est-ce qui t'arrive ?", "¿Qué te ha pasado?", "Was ist dir passiert?", "Cosa ti è successo?"]),
  entry("m.amuldara", "Amul dara", ["It's nothing / Never mind", "Ce n'est rien", "No es nada", "Es ist nichts", "Non è niente"]),
  entry("m.bulragal", "Bul ragal", ["Don't be afraid", "N'aie pas peur", "No tengas miedo", "Hab keine Angst", "Non avere paura"], {
    note: [
      "Bul + verb tells someone not to do something: Bul ragal, Bul mer.",
      "Bul + verbe sert à interdire : Bul ragal, Bul mer.",
      "Bul + verbo sirve para decir «no hagas»: Bul ragal, Bul mer.",
      "Bul + Verb heißt „tu das nicht“: Bul ragal, Bul mer.",
      "Bul + verbo serve a dire «non fare»: Bul ragal, Bul mer.",
    ],
  }),
  entry("m.bulmer", "Bul mer", ["Don't be angry", "Ne te fâche pas", "No te enfades", "Sei nicht böse", "Non arrabbiarti"]),
  entry("m.mungibeg", "Mu ngi bég", ["He / she is happy", "Il / elle est content", "Está contento", "Er / sie freut sich", "È contento"]),
];

export const unit: Unit = {
  id: "u19",
  glyph: "heart",
  tone: "dusk",
  title: tx(["Feelings", "Les émotions", "Los sentimientos", "Gefühle", "Le emozioni"]),
  lessons: [
    {
      id: "feelings-1",
      title: tx(["How I feel", "Ce que je ressens", "Cómo me siento", "Wie ich mich fühle", "Come mi sento"]),
      tip: tx([
        "Dama + feeling says how you feel right now: Dama mer, Dama ragal. You already know Dama sonn and Dama xiif.",
        "Dama + émotion dit ce que vous ressentez maintenant : Dama mer, Dama ragal. Vous connaissez déjà Dama sonn et Dama xiif.",
        "Dama + sentimiento dice cómo te sientes ahora: Dama mer, Dama ragal. Ya conoces Dama sonn y Dama xiif.",
        "Dama + Gefühl sagt, wie es dir gerade geht: Dama mer, Dama ragal. Dama sonn und Dama xiif kennst du schon.",
        "Dama + emozione dice come ti senti ora: Dama mer, Dama ragal. Conosci già Dama sonn e Dama xiif.",
      ]),
      entries: ["m.mer", "m.ragal", "m.yeemu", "m.rus", "m.jaaxle"],
      exercises: [
        { type: "pick_picture", entry: "m.mer" },
        { type: "pick_picture", entry: "m.ragal" },
        { type: "pick_picture", entry: "m.yeemu" },
        { type: "match", entries: ["m.mer", "m.ragal", "m.yeemu", "m.jaaxle"] },
        { type: "listen", entry: "m.rus" },
        { type: "pick_meaning", entry: "m.jaaxle" },
        { type: "fill_blank", entry: "m.ragal", blank: 1, options: ["ragal", "mer", "rus"] },
        { type: "pick_wolof", entry: "m.rus" },
        { type: "pick_picture", entry: "m.jaaxle" },
        { type: "pick_wolof", entry: "m.mer" },
        { type: "type_wolof", entry: "m.ragal" },
        { type: "speak", entry: "m.yeemu" },
      ],
    },
    {
      id: "feelings-2",
      title: tx(["Comforting someone", "Réconforter quelqu'un", "Consolar a alguien", "Jemanden trösten", "Consolare qualcuno"]),
      tip: tx([
        "Lu la dal? is a kind way to ask what's wrong. If it's nothing, answer Amul dara.",
        "Lu la dal ? est une façon gentille de demander ce qui ne va pas. Si ce n'est rien, répondez Amul dara.",
        "¿Lu la dal? es una forma amable de preguntar qué pasa. Si no es nada, responde Amul dara.",
        "Lu la dal? fragt freundlich, was los ist. Wenn nichts ist, antworte Amul dara.",
        "Lu la dal? è un modo gentile di chiedere cosa non va. Se non è niente, rispondi Amul dara.",
      ]),
      entries: ["m.lulada", "m.amuldara", "m.bulragal", "m.bulmer", "m.mungibeg"],
      exercises: [
        { type: "pick_meaning", entry: "m.lulada" },
        { type: "pick_meaning", entry: "m.amuldara" },
        { type: "listen", entry: "m.bulragal" },
        { type: "match", entries: ["m.lulada", "m.amuldara", "m.bulragal", "m.bulmer"] },
        { type: "fill_blank", entry: "m.bulmer", blank: 1, options: ["mer", "ragal", "dara"] },
        { type: "pick_wolof", entry: "m.mungibeg" },
        { type: "build", entry: "m.lulada", distractors: ["mu", "dara"] },
        { type: "pick_meaning", entry: "m.mungibeg" },
        { type: "pick_wolof", entry: "m.bulragal" },
        { type: "build", entry: "m.mungibeg", distractors: ["dama", "la"] },
        { type: "type_wolof", entry: "m.amuldara" },
        { type: "speak", entry: "m.lulada" },
      ],
    },
  ],
};
