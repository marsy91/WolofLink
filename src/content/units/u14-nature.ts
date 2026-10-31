// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // nature-1
  entry("a.xaj", "xaj", ["dog", "chien", "perro", "Hund", "cane"], { pic: "🐕" }),
  entry("a.muus", "muus", ["cat", "chat", "gato", "Katze", "gatto"], { pic: "🐈" }),
  entry("a.nag", "nag", ["cow", "vache", "vaca", "Kuh", "mucca"], { pic: "🐄" }),
  entry("a.xar", "xar", ["sheep", "mouton", "oveja", "Schaf", "pecora"], {
    pic: "🐑",
    note: [
      "Families buy a ram (xar) for Tabaski, and city rooftops fill with sheep the week before.",
      "Les familles achètent un mouton (xar) pour la Tabaski ; la semaine d'avant, on en voit jusque sur les toits.",
      "Las familias compran un carnero (xar) para la Tabaski; la semana antes hay ovejas hasta en las azoteas.",
      "Familien kaufen zum Tabaski einen Hammel (xar); in der Woche davor stehen Schafe sogar auf Dächern.",
      "Le famiglie comprano un montone (xar) per la Tabaski; la settimana prima ci sono pecore perfino sui tetti.",
    ],
  }),
  entry("a.bey", "bey", ["goat", "chèvre", "cabra", "Ziege", "capra"], { pic: "🐐" }),
  entry("a.fas", "fas", ["horse", "cheval", "caballo", "Pferd", "cavallo"], { pic: "🐎" }),
  entry("a.picc", "picc", ["bird", "oiseau", "pájaro", "Vogel", "uccello"], { pic: "🐦" }),

  // nature-2
  entry("a.gaynde", "gaynde", ["lion", "lion", "león", "Löwe", "leone"], {
    pic: "🦁",
    note: [
      "The lion is Senegal's national emblem.",
      "Le lion est l'emblème national du Sénégal.",
      "El león es el emblema nacional de Senegal.",
      "Der Löwe ist das Nationalsymbol Senegals.",
      "Il leone è l'emblema nazionale del Senegal.",
    ],
  }),
  entry("a.jant", "jant", ["sun", "soleil", "sol", "Sonne", "sole"], { pic: "☀️" }),
  entry("a.biddiiw", "biddiiw", ["star", "étoile", "estrella", "Stern", "stella"], { pic: "⭐" }),
  entry("a.asamaan", "asamaan", ["sky", "ciel", "cielo", "Himmel", "cielo"], { pic: "🌤️" }),
  entry("a.ngelaw", "ngelaw", ["wind", "vent", "viento", "Wind", "vento"], { pic: "🌬️" }),
  entry("a.dex", "dex", ["river", "fleuve, rivière", "río", "Fluss", "fiume"], { pic: "🏞️" }),
  entry("a.suuf", "suuf", ["sand, ground", "sable, sol", "arena, suelo", "Sand, Boden", "sabbia, terra"], { pic: "🏜️" }),

  // nature-3
  entry("a.amngaxaj", "Am nga xaj?", ["Do you have a dog?", "Tu as un chien ?", "¿Tienes perro?", "Hast du einen Hund?", "Hai un cane?"]),
  entry("a.naarixar", "Am naa ñaari xar", ["I have two sheep", "J'ai deux moutons", "Tengo dos ovejas", "Ich habe zwei Schafe", "Ho due pecore"]),
  entry("a.jantbi", "Jant bi dafa tàng", ["The sun is hot", "Le soleil est chaud", "El sol quema", "Die Sonne ist heiß", "Il sole è caldo"]),
  entry("a.ngelawli", "Ngelaw li dafa sedd", ["The wind is cold", "Le vent est froid", "El viento es frío", "Der Wind ist kalt", "Il vento è freddo"], {
    note: [
      "Each noun has its own word for “the”: jant bi, ngelaw li, dex gi.",
      "Chaque nom a son propre mot pour « le » : jant bi, ngelaw li, dex gi.",
      "Cada sustantivo tiene su palabra para «el»: jant bi, ngelaw li, dex gi.",
      "Jedes Nomen hat sein eigenes Wort für „der / die / das“: jant bi, ngelaw li, dex gi.",
      "Ogni nome ha la sua parola per «il»: jant bi, ngelaw li, dex gi.",
    ],
  }),
  entry("a.gispicc", "Gis naa picc mi", ["I see the bird", "Je vois l'oiseau", "Veo el pájaro", "Ich sehe den Vogel", "Vedo l'uccello"]),
  entry("a.dexgi", "Dex gi dafa sore", ["The river is far", "Le fleuve est loin", "El río está lejos", "Der Fluss ist weit weg", "Il fiume è lontano"]),
  entry("a.dafaytaw", "Dafay taw", ["It's raining", "Il pleut", "Está lloviendo", "Es regnet", "Piove"]),
];

export const unit: Unit = {
  id: "u14",
  glyph: "bird",
  tone: "sea",
  title: tx(["Animals and nature", "Animaux et nature", "Animales y naturaleza", "Tiere und Natur", "Animali e natura"]),
  lessons: [
    {
      id: "nature-1",
      title: tx(["Animals", "Les animaux", "Los animales", "Tiere", "Gli animali"]),
      tip: tx([
        "Most animals on a Senegalese farm live close to the house: sheep, goats, chickens, and a horse for the cart.",
        "Au Sénégal, beaucoup d'animaux vivent près de la maison : moutons, chèvres, poules, et un cheval pour la charrette.",
        "En Senegal muchos animales viven junto a la casa: ovejas, cabras, gallinas y un caballo para el carro.",
        "Im Senegal leben viele Tiere direkt am Haus: Schafe, Ziegen, Hühner und ein Pferd für den Karren.",
        "In Senegal molti animali vivono vicino a casa: pecore, capre, galline e un cavallo per il carretto.",
      ]),
      entries: ["a.xaj", "a.muus", "a.nag", "a.xar", "a.bey", "a.fas", "a.picc"],
      exercises: [
        { type: "pick_picture", entry: "a.xaj" },
        { type: "pick_picture", entry: "a.muus" },
        { type: "pick_picture", entry: "a.xar" },
        { type: "pick_picture", entry: "a.fas" },
        { type: "match", entries: ["a.xaj", "a.muus", "a.nag", "a.bey"] },
        { type: "listen", entry: "a.xar" },
        { type: "pick_picture", entry: "a.picc" },
        { type: "pick_wolof", entry: "a.nag" },
        { type: "pick_meaning", entry: "a.bey" },
        { type: "match", entries: ["a.xar", "a.fas", "a.picc", "a.nag"] },
        { type: "type_wolof", entry: "a.xaj" },
        { type: "listen", entry: "a.muus" },
      ],
    },
    {
      id: "nature-2",
      title: tx(["Sky and land", "Le ciel et la terre", "El cielo y la tierra", "Himmel und Erde", "Cielo e terra"]),
      tip: tx([
        "Senegal's football team are the “Lions of Teranga”: a lion is gaynde in Wolof, and Teranga comes from teraanga, hospitality.",
        "L'équipe de football du Sénégal, ce sont les « Lions de la Teranga » : lion se dit gaynde en wolof, et Teranga vient de teraanga, l'hospitalité.",
        "La selección de fútbol de Senegal son los «Leones de la Teranga»: león se dice gaynde en wolof, y Teranga viene de teraanga, la hospitalidad.",
        "Senegals Fußballteam heißt „Löwen der Teranga“: Löwe heißt auf Wolof gaynde, und Teranga kommt von teraanga, Gastfreundschaft.",
        "La nazionale di calcio del Senegal sono i «Leoni della Teranga»: leone in wolof si dice gaynde, e Teranga viene da teraanga, l'ospitalità.",
      ]),
      entries: ["a.gaynde", "a.jant", "a.biddiiw", "a.asamaan", "a.ngelaw", "a.dex", "a.suuf"],
      exercises: [
        { type: "pick_picture", entry: "a.gaynde" },
        { type: "pick_picture", entry: "a.jant" },
        { type: "pick_picture", entry: "a.biddiiw" },
        { type: "pick_picture", entry: "a.dex" },
        { type: "match", entries: ["a.jant", "a.biddiiw", "a.asamaan", "a.ngelaw"] },
        { type: "listen", entry: "a.gaynde" },
        { type: "pick_meaning", entry: "a.suuf" },
        { type: "pick_wolof", entry: "a.asamaan" },
        { type: "pick_meaning", entry: "a.ngelaw" },
        { type: "match", entries: ["a.gaynde", "a.dex", "a.suuf", "a.jant"] },
        { type: "type_wolof", entry: "a.jant" },
        { type: "listen", entry: "a.dex" },
      ],
    },
    {
      id: "nature-3",
      title: tx(["Outdoors", "Dehors", "Al aire libre", "Draußen", "All'aperto"]),
      tip: tx([
        "Dafay + verb describes what is happening: Dafay taw, “it's raining”. Dafa + adjective describes how something is: Dafa tàng, “it's hot”.",
        "Dafay + verbe décrit ce qui se passe : Dafay taw, « il pleut ». Dafa + adjectif décrit un état : Dafa tàng, « il fait chaud ».",
        "Dafay + verbo describe lo que pasa: Dafay taw, «está lloviendo». Dafa + adjetivo describe cómo es algo: Dafa tàng, «hace calor».",
        "Dafay + Verb beschreibt, was gerade passiert: Dafay taw, „es regnet“. Dafa + Adjektiv beschreibt einen Zustand: Dafa tàng, „es ist heiß“.",
        "Dafay + verbo descrive ciò che accade: Dafay taw, «piove». Dafa + aggettivo descrive uno stato: Dafa tàng, «fa caldo».",
      ]),
      entries: ["a.amngaxaj", "a.naarixar", "a.jantbi", "a.ngelawli", "a.gispicc", "a.dexgi", "a.dafaytaw"],
      exercises: [
        { type: "pick_meaning", entry: "a.amngaxaj" },
        { type: "pick_meaning", entry: "a.dafaytaw" },
        { type: "listen", entry: "a.jantbi" },
        { type: "build", entry: "a.naarixar", distractors: ["xaj", "nga"] },
        { type: "fill_blank", entry: "a.ngelawli", blank: 1, options: ["li", "bi", "gi"] },
        { type: "pick_wolof", entry: "a.gispicc" },
        { type: "fill_blank", entry: "a.jantbi", blank: 3, options: ["tàng", "sedd", "sore"] },
        { type: "pick_meaning", entry: "a.dexgi" },
        { type: "build", entry: "a.dexgi", distractors: ["bi", "tàng"] },
        { type: "listen", entry: "a.dafaytaw" },
        { type: "type_wolof", entry: "a.amngaxaj" },
        { type: "speak", entry: "a.jantbi" },
      ],
    },
  ],
};
