// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // health-1
  entry("h.bopp", "bopp", ["head", "tête", "cabeza", "Kopf", "testa"], { pic: "🙂" }),
  entry("h.bet", "bët", ["eye", "œil", "ojo", "Auge", "occhio"], { pic: "👁️" }),
  entry("h.nopp", "nopp", ["ear", "oreille", "oreja", "Ohr", "orecchio"], { pic: "👂" }),
  entry("h.bakkan", "bakkan", ["nose", "nez", "nariz", "Nase", "naso"], { pic: "👃" }),
  entry("h.gemmin", "gémmiñ", ["mouth", "bouche", "boca", "Mund", "bocca"], { pic: "👄" }),
  entry("h.ben", "bëñ", ["tooth", "dent", "diente", "Zahn", "dente"], { pic: "🦷" }),
  entry("h.loxo", "loxo", ["hand, arm", "main, bras", "mano, brazo", "Hand, Arm", "mano, braccio"], { pic: "✋" }),
  entry("h.tank", "tànk", ["foot, leg", "pied, jambe", "pie, pierna", "Fuß, Bein", "piede, gamba"], { pic: "🦶" }),
  entry("h.biir", "biir", ["belly", "ventre", "barriga", "Bauch", "pancia"], { pic: "🫃" }),

  // health-2
  entry("h.boppmetti", "Sama bopp dafay metti", [
    "My head hurts",
    "J'ai mal à la tête",
    "Me duele la cabeza",
    "Mir tut der Kopf weh",
    "Mi fa male la testa",
  ], {
    note: [
      "Sama … dafay metti: “my … hurts”. Swap in any body part.",
      "Sama … dafay metti : « j'ai mal à … ». Remplacez par n'importe quelle partie du corps.",
      "Sama … dafay metti: «me duele …». Cambia la parte del cuerpo.",
      "Sama … dafay metti: „mein … tut weh“. Setze ein beliebiges Körperteil ein.",
      "Sama … dafay metti: «mi fa male …». Cambia la parte del corpo.",
    ],
  }),
  entry("h.biirmetti", "Sama biir dafay metti", [
    "My stomach hurts",
    "J'ai mal au ventre",
    "Me duele la barriga",
    "Mir tut der Bauch weh",
    "Mi fa male la pancia",
  ]),
  entry("h.doktoor", "doktoor", ["doctor", "médecin", "médico", "Arzt, Ärztin", "medico"], { pic: "🩺" }),
  entry("h.garab", "garab", ["medicine", "médicament", "medicina", "Medikament", "medicina"], {
    pic: "💊",
    note: [
      "Garab also means “tree”: traditional remedies came from plants.",
      "Garab veut aussi dire « arbre » : les remèdes traditionnels venaient des plantes.",
      "Garab también significa «árbol»: los remedios tradicionales venían de las plantas.",
      "Garab heißt auch „Baum“: traditionelle Heilmittel kamen aus Pflanzen.",
      "Garab significa anche «albero»: i rimedi tradizionali venivano dalle piante.",
    ],
  }),
  entry("h.wooal", "Wooal doktoor!", ["Call a doctor!", "Appelle un médecin !", "¡Llama a un médico!", "Ruf einen Arzt!", "Chiama un medico!"]),
  entry("h.amnggarab", "Am nga garab?", [
    "Do you have medicine?",
    "As-tu des médicaments ?",
    "¿Tienes medicinas?",
    "Hast du Medikamente?",
    "Hai delle medicine?",
  ]),
  entry("h.wernaa", "Wér naa", ["I'm well (healthy)", "Je vais bien (en forme)", "Estoy sano/a", "Ich bin gesund", "Sto bene (in salute)"]),
];

export const unit: Unit = {
  id: "u9",
  glyph: "heart",
  tone: "sea",
  title: tx(["Health and the body", "La santé et le corps", "La salud y el cuerpo", "Gesundheit und Körper", "Salute e corpo"]),
  lessons: [
    {
      id: "health-1",
      title: tx(["The body", "Le corps", "El cuerpo", "Der Körper", "Il corpo"]),
      tip: tx([
        "Some body words cover more than English does: loxo is the hand and arm, tànk the foot and leg.",
        "Certains mots couvrent plus qu'en français : loxo désigne la main et le bras, tànk le pied et la jambe.",
        "Algunas palabras abarcan más: loxo es la mano y el brazo, tànk el pie y la pierna.",
        "Manche Wörter umfassen mehr als im Deutschen: loxo ist Hand und Arm, tànk Fuß und Bein.",
        "Alcune parole coprono più dell'italiano: loxo è mano e braccio, tànk piede e gamba.",
      ]),
      entries: ["h.bopp", "h.bet", "h.nopp", "h.bakkan", "h.gemmin", "h.ben", "h.loxo", "h.tank", "h.biir"],
      exercises: [
        { type: "pick_picture", entry: "h.bet" },
        { type: "pick_picture", entry: "h.nopp" },
        { type: "pick_picture", entry: "h.bakkan" },
        { type: "pick_picture", entry: "h.gemmin" },
        { type: "match", entries: ["h.bopp", "h.loxo", "h.tank", "h.biir"] },
        { type: "listen", entry: "h.ben" },
        { type: "pick_picture", entry: "h.loxo" },
        { type: "pick_wolof", entry: "h.tank" },
        { type: "pick_meaning", entry: "h.biir" },
        { type: "match", entries: ["h.bet", "h.nopp", "h.ben", "h.bakkan"] },
        { type: "type_wolof", entry: "h.bopp" },
        { type: "speak", entry: "h.gemmin" },
      ],
    },
    {
      id: "health-2",
      title: tx(["At the doctor", "Chez le médecin", "En el médico", "Beim Arzt", "Dal medico"]),
      tip: tx([
        "Dafay adds “keeps doing / is doing”: Sama bopp dafay metti, “my head hurts”.",
        "Dafay exprime une action en cours : Sama bopp dafay metti, « j'ai mal à la tête ».",
        "Dafay expresa una acción en curso: Sama bopp dafay metti, «me duele la cabeza».",
        "Dafay drückt etwas Andauerndes aus: Sama bopp dafay metti, „mir tut der Kopf weh“.",
        "Dafay esprime un'azione in corso: Sama bopp dafay metti, «mi fa male la testa».",
      ]),
      entries: ["h.boppmetti", "h.biirmetti", "h.doktoor", "h.garab", "h.wooal", "h.amnggarab", "h.wernaa"],
      exercises: [
        { type: "pick_picture", entry: "h.doktoor" },
        { type: "pick_picture", entry: "h.garab" },
        { type: "pick_meaning", entry: "h.boppmetti" },
        { type: "pick_meaning", entry: "h.biirmetti" },
        { type: "listen", entry: "h.wooal" },
        { type: "pick_meaning", entry: "h.amnggarab" },
        { type: "build", entry: "h.boppmetti", distractors: ["biir", "naa"] },
        { type: "fill_blank", entry: "h.biirmetti", blank: 1, options: ["biir", "bopp", "loxo"] },
        { type: "match", entries: ["h.doktoor", "h.garab", "h.wernaa", "h.wooal"] },
        { type: "pick_wolof", entry: "h.wernaa" },
        { type: "type_wolof", entry: "h.doktoor" },
        { type: "speak", entry: "h.amnggarab" },
      ],
    },
  ],
};
