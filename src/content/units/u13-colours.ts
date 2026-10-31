// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // colours-1
  entry("r.xonq", "xonq", ["red", "rouge", "rojo", "rot", "rosso"], { pic: "🔴" }),
  entry("r.weex", "weex", ["white", "blanc", "blanco", "weiß", "bianco"], { pic: "⚪" }),
  entry("r.nuul", "ñuul", ["black", "noir", "negro", "schwarz", "nero"], { pic: "⚫" }),
  entry("r.bulo", "bulo", ["blue", "bleu", "azul", "blau", "blu"], {
    pic: "🔵",
    note: [
      "From French bleu; it's the everyday word in Senegal.",
      "Vient du français « bleu » ; c'est le mot courant au Sénégal.",
      "Viene del francés bleu; es la palabra habitual en Senegal.",
      "Vom französischen bleu; im Senegal das übliche Wort.",
      "Dal francese bleu; è la parola comune in Senegal.",
    ],
  }),
  entry("r.dafaxonq", "Dafa xonq", ["It's red", "C'est rouge", "Es rojo", "Es ist rot", "È rosso"]),
  entry("r.dafaweex", "Dafa weex", ["It's white", "C'est blanc", "Es blanco", "Es ist weiß", "È bianco"]),
  entry("r.dafarafet", "Dafa rafet", ["It's beautiful", "C'est beau", "Es bonito", "Es ist schön", "È bello"]),

  // colours-2
  entry("r.mbubb", "mbubb", ["boubou (long robe)", "boubou", "bubú (túnica larga)", "Boubou (langes Gewand)", "boubou (lunga tunica)"], {
    pic: "👘",
    note: [
      "The wide robe men and women wear for prayers, visits and celebrations.",
      "La grande robe que portent hommes et femmes pour la prière, les visites et les fêtes.",
      "La túnica amplia que llevan hombres y mujeres para rezar, visitar y en las fiestas.",
      "Das weite Gewand, das Männer und Frauen zum Gebet, für Besuche und Feste tragen.",
      "L'ampia tunica che uomini e donne indossano per pregare, per le visite e le feste.",
    ],
  }),
  entry("r.tubey", "tubéy", ["trousers", "pantalon", "pantalones", "Hose", "pantaloni"], { pic: "👖" }),
  entry("r.dall", "dàll", ["shoes", "chaussures", "zapatos", "Schuhe", "scarpe"], { pic: "👞" }),
  entry("r.mbaxana", "mbaxana", ["hat", "chapeau", "sombrero", "Hut", "cappello"], { pic: "👒" }),
  entry("r.sol", "sol", ["to put on, to wear", "mettre, porter (un habit)", "ponerse, llevar (ropa)", "anziehen, tragen", "mettere, indossare"]),
  entry("r.summi", "summi", ["to take off", "enlever (un habit)", "quitarse (ropa)", "ausziehen", "togliersi"]),
  entry("r.summil", "Summil sa dàll", ["Take off your shoes", "Enlève tes chaussures", "Quítate los zapatos", "Zieh deine Schuhe aus", "Togliti le scarpe"], {
    note: [
      "Many homes and every mosque ask you to take your shoes off at the door.",
      "Dans beaucoup de maisons et dans toutes les mosquées, on enlève ses chaussures à l'entrée.",
      "En muchas casas y en todas las mezquitas se quitan los zapatos en la puerta.",
      "In vielen Häusern und in jeder Moschee zieht man an der Tür die Schuhe aus.",
      "In molte case e in tutte le moschee ci si toglie le scarpe all'ingresso.",
    ],
  }),

  // colours-3
  entry("r.solmbubb", "Maa ngi sol sama mbubb", [
    "I'm putting on my boubou",
    "Je mets mon boubou",
    "Me estoy poniendo el bubú",
    "Ich ziehe mein Boubou an",
    "Mi sto mettendo il boubou",
  ]),
  entry("r.jenddall", "Dama bëgg jënd dàll", [
    "I want to buy shoes",
    "Je veux acheter des chaussures",
    "Quiero comprar zapatos",
    "Ich möchte Schuhe kaufen",
    "Voglio comprare delle scarpe",
  ]),
  entry("r.mbubbmi", "Mbubb mi dafa rafet", [
    "The boubou is beautiful",
    "Le boubou est beau",
    "El bubú es bonito",
    "Das Boubou ist schön",
    "Il boubou è bello",
  ], {
    note: [
      "Mbubb takes mi for “the”, not bi.",
      "Mbubb prend mi pour « le », pas bi.",
      "Mbubb lleva mi para «el», no bi.",
      "Mbubb nimmt mi für „das“, nicht bi.",
      "Mbubb prende mi per «il», non bi.",
    ],
  }),
  entry("r.naatadall", "Ñaata la dàll yi?", [
    "How much are the shoes?",
    "Combien coûtent les chaussures ?",
    "¿Cuánto cuestan los zapatos?",
    "Was kosten die Schuhe?",
    "Quanto costano le scarpe?",
  ]),
  entry("r.tubeyninuul", "Sama tubéy dafa ñuul", [
    "My trousers are black",
    "Mon pantalon est noir",
    "Mis pantalones son negros",
    "Meine Hose ist schwarz",
    "I miei pantaloni sono neri",
  ]),
];

export const unit: Unit = {
  id: "u13",
  glyph: "robe",
  tone: "sun",
  title: tx(["Colours and clothes", "Couleurs et vêtements", "Colores y ropa", "Farben und Kleidung", "Colori e vestiti"]),
  lessons: [
    {
      id: "colours-1",
      title: tx(["Colours", "Les couleurs", "Los colores", "Farben", "I colori"]),
      tip: tx([
        "Colours work like verbs: Dafa xonq means “it's red”. There's no separate word for “is”.",
        "Les couleurs fonctionnent comme des verbes : Dafa xonq veut dire « c'est rouge ». Pas besoin de mot pour « être ».",
        "Los colores funcionan como verbos: Dafa xonq significa «es rojo». No hace falta una palabra para «ser».",
        "Farben verhalten sich wie Verben: Dafa xonq heißt „es ist rot“. Ein eigenes Wort für „ist“ gibt es nicht.",
        "I colori funzionano come verbi: Dafa xonq significa «è rosso». Non serve una parola per «essere».",
      ]),
      entries: ["r.xonq", "r.weex", "r.nuul", "r.bulo", "r.dafaxonq", "r.dafaweex", "r.dafarafet"],
      exercises: [
        { type: "pick_picture", entry: "r.xonq" },
        { type: "pick_picture", entry: "r.weex" },
        { type: "pick_picture", entry: "r.nuul" },
        { type: "pick_picture", entry: "r.bulo" },
        { type: "match", entries: ["r.xonq", "r.weex", "r.nuul", "r.bulo"] },
        { type: "pick_meaning", entry: "r.dafaxonq" },
        { type: "listen", entry: "r.dafaweex" },
        { type: "fill_blank", entry: "r.dafaxonq", blank: 1, options: ["xonq", "weex", "ñuul"] },
        { type: "pick_wolof", entry: "r.dafarafet" },
        { type: "build", entry: "r.dafaweex", distractors: ["xonq", "naa"] },
        { type: "type_wolof", entry: "r.weex" },
        { type: "speak", entry: "r.dafarafet" },
      ],
    },
    {
      id: "colours-2",
      title: tx(["Clothes", "Les vêtements", "La ropa", "Kleidung", "I vestiti"]),
      tip: tx([
        "Add -l to a verb ending in a vowel to give an instruction: summi “to take off” → Summil! “Take it off!”",
        "Ajoutez -l à un verbe finissant par une voyelle pour donner une consigne : summi « enlever » → Summil ! « Enlève ! »",
        "Añade -l a un verbo que acaba en vocal para dar una orden: summi «quitarse» → ¡Summil! «¡Quítatelo!»",
        "Hänge -l an ein Verb auf Vokal, um eine Aufforderung zu geben: summi „ausziehen“ → Summil! „Zieh aus!“",
        "Aggiungi -l a un verbo che finisce in vocale per dare un ordine: summi «togliersi» → Summil! «Togliti!»",
      ]),
      entries: ["r.mbubb", "r.tubey", "r.dall", "r.mbaxana", "r.sol", "r.summi", "r.summil"],
      exercises: [
        { type: "pick_picture", entry: "r.mbubb" },
        { type: "pick_picture", entry: "r.tubey" },
        { type: "pick_picture", entry: "r.dall" },
        { type: "pick_picture", entry: "r.mbaxana" },
        { type: "match", entries: ["r.mbubb", "r.tubey", "r.dall", "r.mbaxana"] },
        { type: "pick_meaning", entry: "r.sol" },
        { type: "pick_meaning", entry: "r.summi" },
        { type: "listen", entry: "r.dall" },
        { type: "pick_meaning", entry: "r.summil" },
        { type: "build", entry: "r.summil", distractors: ["sol", "mbubb"] },
        { type: "type_wolof", entry: "r.dall" },
        { type: "speak", entry: "r.summil" },
      ],
    },
    {
      id: "colours-3",
      title: tx(["Getting dressed", "S'habiller", "Vestirse", "Sich anziehen", "Vestirsi"]),
      tip: tx([
        "Sama means “my” and comes before the noun: sama mbubb, sama tubéy. Sa means “your”.",
        "Sama veut dire « mon / ma » et se place avant le nom : sama mbubb, sama tubéy. Sa veut dire « ton / ta ».",
        "Sama significa «mi» y va delante del sustantivo: sama mbubb, sama tubéy. Sa significa «tu».",
        "Sama heißt „mein“ und steht vor dem Nomen: sama mbubb, sama tubéy. Sa heißt „dein“.",
        "Sama significa «mio» e va prima del nome: sama mbubb, sama tubéy. Sa significa «tuo».",
      ]),
      entries: ["r.solmbubb", "r.jenddall", "r.mbubbmi", "r.naatadall", "r.tubeyninuul"],
      exercises: [
        { type: "pick_meaning", entry: "r.solmbubb" },
        { type: "pick_meaning", entry: "r.mbubbmi" },
        { type: "listen", entry: "r.jenddall" },
        { type: "build", entry: "r.jenddall", distractors: ["sol", "yi"] },
        { type: "pick_wolof", entry: "r.naatadall" },
        { type: "fill_blank", entry: "r.tubeyninuul", blank: 3, options: ["ñuul", "weex", "xonq"] },
        { type: "fill_blank", entry: "r.mbubbmi", blank: 1, options: ["mi", "bi", "yi"] },
        { type: "build", entry: "r.solmbubb", distractors: ["dàll", "sa"] },
        { type: "pick_wolof", entry: "r.tubeyninuul" },
        { type: "listen", entry: "r.mbubbmi" },
        { type: "type_wolof", entry: "r.naatadall" },
        { type: "speak", entry: "r.jenddall" },
      ],
    },
  ],
};
