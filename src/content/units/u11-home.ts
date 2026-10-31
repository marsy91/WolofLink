// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // home-1
  entry("k.neeg", "néeg", ["room", "chambre, pièce", "habitación", "Zimmer", "stanza"], { pic: "🚪" }),
  entry("k.palanteer", "palanteer", ["window", "fenêtre", "ventana", "Fenster", "finestra"], { pic: "🪟" }),
  entry("k.lal", "lal", ["bed", "lit", "cama", "Bett", "letto"], { pic: "🛏️" }),
  entry("k.taabal", "taabal", ["table", "table", "mesa", "Tisch", "tavolo"], { pic: "🪑" }),
  entry("k.waan", "waañ", ["kitchen", "cuisine (pièce)", "cocina", "Küche", "cucina"], { pic: "🥘" }),
  entry("k.wanag", "wanag", ["toilet", "toilettes", "baño", "Toilette", "bagno"], { pic: "🚽" }),
  entry("k.anawanag", "Ana wanag wi?", [
    "Where is the toilet?",
    "Où sont les toilettes ?",
    "¿Dónde está el baño?",
    "Wo ist die Toilette?",
    "Dov'è il bagno?",
  ]),

  // home-2
  entry("k.yewwu", "Dama yewwu", ["I wake up", "Je me réveille", "Me despierto", "Ich wache auf", "Mi sveglio"]),
  entry("k.sangu", "Maa ngi sangu", ["I'm taking a shower", "Je me lave", "Me estoy duchando", "Ich dusche gerade", "Mi sto lavando"]),
  entry("k.sol", "Maa ngi sol sama yére", [
    "I'm getting dressed",
    "Je m'habille",
    "Me estoy vistiendo",
    "Ich ziehe mich an",
    "Mi sto vestendo",
  ]),
  entry("k.foot", "Maa ngi fóot", ["I'm doing the laundry", "Je fais la lessive", "Estoy lavando la ropa", "Ich wasche Wäsche", "Faccio il bucato"]),
  entry("k.bale", "Maa ngi bale", ["I'm sweeping", "Je balaie", "Estoy barriendo", "Ich fege", "Sto spazzando"]),
  entry("k.yere", "yére", ["clothes", "vêtements", "ropa", "Kleidung", "vestiti"], { pic: "👕" }),
];

export const unit: Unit = {
  id: "u11",
  glyph: "home",
  tone: "dusk",
  title: tx(["Home and daily life", "La maison et le quotidien", "La casa y el día a día", "Zuhause und Alltag", "Casa e vita quotidiana"]),
  lessons: [
    {
      id: "home-1",
      title: tx(["Around the house", "Dans la maison", "En casa", "Im Haus", "In casa"]),
      tip: tx([
        "Like bi, wi means “the” after some nouns: wanag wi, “the toilet”. Each noun takes its own little word.",
        "Comme bi, wi veut dire « le / la » après certains noms : wanag wi, « les toilettes ». Chaque nom a son petit mot.",
        "Como bi, wi significa «el / la» tras algunos sustantivos: wanag wi, «el baño». Cada sustantivo lleva el suyo.",
        "Wie bi heißt auch wi „der / die / das“ nach manchen Nomen: wanag wi, „die Toilette“. Jedes Nomen hat sein eigenes Wort.",
        "Come bi, wi significa «il / la» dopo alcuni nomi: wanag wi, «il bagno». Ogni nome ha la sua parolina.",
      ]),
      entries: ["k.neeg", "k.palanteer", "k.lal", "k.taabal", "k.waan", "k.wanag", "k.anawanag"],
      exercises: [
        { type: "pick_picture", entry: "k.lal" },
        { type: "pick_picture", entry: "k.palanteer" },
        { type: "pick_picture", entry: "k.taabal" },
        { type: "pick_picture", entry: "k.waan" },
        { type: "match", entries: ["k.neeg", "k.lal", "k.wanag", "k.palanteer"] },
        { type: "listen", entry: "k.wanag" },
        { type: "pick_meaning", entry: "k.anawanag" },
        { type: "pick_wolof", entry: "k.neeg" },
        { type: "build", entry: "k.anawanag", distractors: ["bi", "lal"] },
        { type: "pick_meaning", entry: "k.waan" },
        { type: "type_wolof", entry: "k.lal" },
        { type: "speak", entry: "k.anawanag" },
      ],
    },
    {
      id: "home-2",
      title: tx(["Daily routine", "La routine", "La rutina", "Der Tagesablauf", "La routine"]),
      tip: tx([
        "Maa ngi + verb is the everyday way to say what you're doing now: Maa ngi bale, “I'm sweeping”.",
        "Maa ngi + verbe est la façon courante de dire ce que vous faites : Maa ngi bale, « je balaie ».",
        "Maa ngi + verbo es la forma habitual de decir lo que haces: Maa ngi bale, «estoy barriendo».",
        "Maa ngi + Verb sagt im Alltag, was du gerade tust: Maa ngi bale, „ich fege“.",
        "Maa ngi + verbo è il modo comune per dire cosa fai ora: Maa ngi bale, «sto spazzando».",
      ]),
      entries: ["k.yewwu", "k.sangu", "k.sol", "k.foot", "k.bale", "k.yere"],
      exercises: [
        { type: "pick_meaning", entry: "k.yewwu" },
        { type: "pick_meaning", entry: "k.sangu" },
        { type: "pick_picture", entry: "k.yere" },
        { type: "pick_meaning", entry: "k.sol" },
        { type: "match", entries: ["k.yewwu", "k.sangu", "k.foot", "k.bale"] },
        { type: "listen", entry: "k.bale" },
        { type: "build", entry: "k.sol", distractors: ["sangu", "bi"] },
        { type: "fill_blank", entry: "k.foot", blank: 2, options: ["fóot", "bale", "sangu"] },
        { type: "pick_wolof", entry: "k.foot" },
        { type: "pick_wolof", entry: "k.yewwu" },
        { type: "type_wolof", entry: "k.yere" },
        { type: "speak", entry: "k.sangu" },
      ],
    },
  ],
};
