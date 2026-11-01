// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // dishes-1
  entry("d.maafe", "maafe", ["mafé (peanut stew)", "mafé (sauce arachide)", "mafé (guiso de cacahuete)", "Mafé (Erdnusseintopf)", "mafé (stufato di arachidi)"], {
    pic: "🍲",
    note: [
      "Meat or fish simmered in a tomato and peanut sauce, served with rice.",
      "Viande ou poisson mijotés dans une sauce tomate et arachide, servis avec du riz.",
      "Carne o pescado guisados en salsa de tomate y cacahuete, con arroz.",
      "Fleisch oder Fisch in Tomaten-Erdnuss-Soße, mit Reis serviert.",
      "Carne o pesce cotti in salsa di pomodoro e arachidi, serviti con riso.",
    ],
  }),
  entry("d.dibi", "dibi", ["grilled meat", "viande grillée", "carne a la parrilla", "gegrilltes Fleisch", "carne alla griglia"], {
    pic: "🍖",
    note: [
      "Usually lamb grilled over wood, eaten with onions and mustard.",
      "En général de l'agneau grillé au feu de bois, mangé avec oignons et moutarde.",
      "Normalmente cordero a la leña, con cebolla y mostaza.",
      "Meist Lamm vom Holzfeuer, mit Zwiebeln und Senf.",
      "Di solito agnello alla brace, con cipolle e senape.",
    ],
  }),
  entry("d.lax", "lax", ["millet porridge", "bouillie de mil", "papilla de mijo", "Hirsebrei", "porridge di miglio"], { pic: "🥣" }),
  entry("d.soow", "soow", ["curdled milk", "lait caillé", "leche cuajada", "Dickmilch", "latte cagliato"]),
  entry("d.meew", "meew", ["milk", "lait", "leche", "Milch", "latte"], { pic: "🥛" }),
  entry("d.dugub", "dugub", ["millet", "mil", "mijo", "Hirse", "miglio"], { pic: "🌾" }),

  // dishes-2
  entry("d.lannga", "Lan nga bëgg lekk?", [
    "What would you like to eat?",
    "Qu'est-ce que tu veux manger ?",
    "¿Qué quieres comer?",
    "Was möchtest du essen?",
    "Cosa vuoi mangiare?",
  ]),
  entry("d.beggmaafe", "Bëgg naa maafe", ["I'd like mafé", "J'aimerais du mafé", "Me gustaría mafé", "Ich hätte gern Mafé", "Vorrei il mafé"]),
  entry("d.ammeew", "Ndax am nga meew?", ["Do you have milk?", "Tu as du lait ?", "¿Tienes leche?", "Hast du Milch?", "Hai del latte?"]),
  entry("d.laxaksoow", "Lax ak soow", [
    "Millet porridge with curdled milk",
    "Bouillie de mil au lait caillé",
    "Papilla de mijo con leche cuajada",
    "Hirsebrei mit Dickmilch",
    "Porridge di miglio con latte cagliato",
  ], {
    note: [
      "A favourite breakfast, and often served at naming ceremonies.",
      "Un petit-déjeuner apprécié, souvent servi aux baptêmes.",
      "Un desayuno muy querido, que se sirve a menudo en los bautizos.",
      "Ein beliebtes Frühstück, oft bei Namensfeiern serviert.",
      "Una colazione amata, spesso servita ai battesimi.",
    ],
  }),
  entry("d.ceebjen", "Bëgg naa ceebu jën ak dibi", [
    "I like rice with fish and grilled meat",
    "J'aime le riz au poisson et la viande grillée",
    "Me gusta el arroz con pescado y la carne a la parrilla",
    "Ich mag Reis mit Fisch und gegrilltes Fleisch",
    "Mi piacciono il riso con pesce e la carne alla griglia",
  ]),
];

export const unit: Unit = {
  id: "u18",
  glyph: "bowl",
  tone: "clay",
  title: tx(["Senegalese food", "Cuisine sénégalaise", "Comida senegalesa", "Senegalesisches Essen", "Cucina senegalese"]),
  lessons: [
    {
      id: "dishes-1",
      title: tx(["Dishes", "Les plats", "Los platos", "Gerichte", "I piatti"]),
      tip: tx([
        "Ak means “and” or “with”: lax ak soow, “porridge with curdled milk”.",
        "Ak veut dire « et » ou « avec » : lax ak soow, « bouillie au lait caillé ».",
        "Ak significa «y» o «con»: lax ak soow, «papilla con leche cuajada».",
        "Ak heißt „und“ oder „mit“: lax ak soow, „Brei mit Dickmilch“.",
        "Ak significa «e» o «con»: lax ak soow, «porridge con latte cagliato».",
      ]),
      entries: ["d.maafe", "d.dibi", "d.lax", "d.soow", "d.meew", "d.dugub"],
      exercises: [
        { type: "pick_picture", entry: "d.maafe" },
        { type: "pick_picture", entry: "d.dibi" },
        { type: "pick_picture", entry: "d.meew" },
        { type: "pick_picture", entry: "d.dugub" },
        { type: "match", entries: ["d.maafe", "d.dibi", "d.lax", "d.soow"] },
        { type: "listen", entry: "d.lax" },
        { type: "pick_meaning", entry: "d.soow" },
        { type: "pick_wolof", entry: "d.meew" },
        { type: "pick_picture", entry: "d.lax" },
        { type: "match", entries: ["d.meew", "d.dugub", "d.maafe", "d.lax"] },
        { type: "type_wolof", entry: "d.dibi" },
        { type: "speak", entry: "d.maafe" },
      ],
    },
    {
      id: "dishes-2",
      title: tx(["At the table", "À table", "En la mesa", "Bei Tisch", "A tavola"]),
      tip: tx([
        "Bëgg naa means both “I want” and “I like”: Bëgg naa maafe can be an order or a compliment.",
        "Bëgg naa veut dire « je veux » et « j'aime » : Bëgg naa maafe peut être une commande ou un compliment.",
        "Bëgg naa significa «quiero» y «me gusta»: Bëgg naa maafe puede ser un pedido o un elogio.",
        "Bëgg naa heißt „ich will“ und „ich mag“: Bëgg naa maafe kann eine Bestellung oder ein Lob sein.",
        "Bëgg naa significa «voglio» e «mi piace»: Bëgg naa maafe può essere un'ordinazione o un complimento.",
      ]),
      entries: ["d.lannga", "d.beggmaafe", "d.ammeew", "d.laxaksoow", "d.ceebjen"],
      exercises: [
        { type: "pick_meaning", entry: "d.lannga" },
        { type: "pick_meaning", entry: "d.beggmaafe" },
        { type: "listen", entry: "d.ammeew" },
        { type: "build", entry: "d.lannga", distractors: ["naa", "maafe"] },
        { type: "fill_blank", entry: "d.ammeew", blank: 3, options: ["meew", "soow", "lax"] },
        { type: "pick_wolof", entry: "d.laxaksoow" },
        { type: "build", entry: "d.beggmaafe", distractors: ["nga", "dibi"] },
        { type: "pick_meaning", entry: "d.ceebjen" },
        { type: "fill_blank", entry: "d.laxaksoow", blank: 1, options: ["ak", "ci", "la"] },
        { type: "pick_wolof", entry: "d.ammeew" },
        { type: "type_wolof", entry: "d.beggmaafe" },
        { type: "speak", entry: "d.lannga" },
      ],
    },
  ],
};
