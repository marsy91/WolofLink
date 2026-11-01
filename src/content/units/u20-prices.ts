// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // prices-1
  entry("b.200", "ñaari téeméer", ["two hundred", "deux cents", "doscientos", "zweihundert", "duecento"]),
  entry("b.300", "ñetti téeméer", ["three hundred", "trois cents", "trescientos", "dreihundert", "trecento"]),
  entry("b.500", "juróomi téeméer", ["five hundred", "cinq cents", "quinientos", "fünfhundert", "cinquecento"]),
  entry("b.10000", "fukki junni", ["ten thousand", "dix mille", "diez mil", "zehntausend", "diecimila"]),
  entry("b.million", "benn milyoŋ", ["one million", "un million", "un millón", "eine Million", "un milione"]),

  // prices-2
  entry("b.its500", "Juróomi téeméer la", ["It's five hundred", "C'est cinq cents", "Son quinientos", "Das macht fünfhundert", "Sono cinquecento"], {
    note: [
      "Prices are in CFA francs. In markets you'll also hear them counted in dërëm (1 dërëm = 5 francs).",
      "Les prix sont en francs CFA. Au marché, on les compte aussi en dërëm (1 dërëm = 5 francs).",
      "Los precios están en francos CFA. En los mercados también se cuentan en dërëm (1 dërëm = 5 francos).",
      "Preise sind in CFA-Franc. Auf Märkten zählt man auch in dërëm (1 dërëm = 5 Franc).",
      "I prezzi sono in franchi CFA. Al mercato si contano anche in dërëm (1 dërëm = 5 franchi).",
    ],
  }),
  entry("b.its2000", "Ñaari junni la", ["It's two thousand", "C'est deux mille", "Son dos mil", "Das macht zweitausend", "Sono duemila"]),
  entry("b.yomb", "Dafa yomb", ["It's cheap", "C'est bon marché", "Es barato", "Das ist billig", "È economico"]),
  entry("b.seerlool", "Dafa seer lool", ["It's very expensive", "C'est très cher", "Es muy caro", "Das ist sehr teuer", "È molto caro"]),
  entry("b.wanni", "Mën nga ko wàññi?", ["Can you lower the price?", "Tu peux baisser le prix ?", "¿Puedes bajar el precio?", "Kannst du mit dem Preis runtergehen?", "Puoi abbassare il prezzo?"]),
];

export const unit: Unit = {
  id: "u20",
  glyph: "count",
  tone: "sun",
  title: tx(["Big numbers and prices", "Grands nombres et prix", "Números grandes y precios", "Große Zahlen und Preise", "Numeri grandi e prezzi"]),
  lessons: [
    {
      id: "prices-1",
      title: tx(["Hundreds and thousands", "Centaines et milliers", "Cientos y miles", "Hunderte und Tausende", "Centinaia e migliaia"]),
      tip: tx([
        "To multiply, add -i to the number: ñaar “two” → ñaari téeméer “two hundred”, fukk “ten” → fukki junni “ten thousand”.",
        "Pour multiplier, ajoutez -i au nombre : ñaar « deux » → ñaari téeméer « deux cents », fukk « dix » → fukki junni « dix mille ».",
        "Para multiplicar, añade -i al número: ñaar «dos» → ñaari téeméer «doscientos», fukk «diez» → fukki junni «diez mil».",
        "Zum Multiplizieren hängst du -i an die Zahl: ñaar „zwei“ → ñaari téeméer „zweihundert“, fukk „zehn“ → fukki junni „zehntausend“.",
        "Per moltiplicare aggiungi -i al numero: ñaar «due» → ñaari téeméer «duecento», fukk «dieci» → fukki junni «diecimila».",
      ]),
      entries: ["b.200", "b.300", "b.500", "b.10000", "b.million"],
      exercises: [
        { type: "pick_meaning", entry: "b.200" },
        { type: "pick_meaning", entry: "b.500" },
        { type: "match", entries: ["b.200", "b.300", "b.500", "b.10000"] },
        { type: "listen", entry: "b.300" },
        { type: "pick_wolof", entry: "b.10000" },
        { type: "fill_blank", entry: "b.500", blank: 0, options: ["juróomi", "ñaari", "ñetti"] },
        { type: "pick_meaning", entry: "b.million" },
        { type: "build", entry: "b.10000", distractors: ["téeméer", "ñaari"] },
        { type: "pick_wolof", entry: "b.300" },
        { type: "listen", entry: "b.500" },
        { type: "type_wolof", entry: "b.200" },
        { type: "speak", entry: "b.500" },
      ],
    },
    {
      id: "prices-2",
      title: tx(["Paying and bargaining", "Payer et marchander", "Pagar y regatear", "Bezahlen und handeln", "Pagare e contrattare"]),
      tip: tx([
        "Bargaining is normal in markets and taxis, and it's friendly: smile, offer a price, and meet in the middle.",
        "Marchander est normal au marché et en taxi, et ça se fait dans la bonne humeur : souriez, proposez un prix et trouvez un terrain d'entente.",
        "Regatear es normal en mercados y taxis, y se hace con buen humor: sonríe, propón un precio y encontrad un punto medio.",
        "Handeln ist auf Märkten und im Taxi normal und freundlich: lächeln, einen Preis vorschlagen und sich in der Mitte treffen.",
        "Contrattare è normale nei mercati e in taxi, e si fa con il sorriso: proponi un prezzo e incontratevi a metà strada.",
      ]),
      entries: ["b.its500", "b.its2000", "b.yomb", "b.seerlool", "b.wanni"],
      exercises: [
        { type: "pick_meaning", entry: "b.its500" },
        { type: "pick_meaning", entry: "b.yomb" },
        { type: "listen", entry: "b.its2000" },
        { type: "match", entries: ["b.its500", "b.its2000", "b.yomb", "b.seerlool"] },
        { type: "fill_blank", entry: "b.seerlool", blank: 2, options: ["lool", "tuuti", "rekk"] },
        { type: "pick_wolof", entry: "b.wanni" },
        { type: "build", entry: "b.wanni", distractors: ["naa", "la"] },
        { type: "pick_wolof", entry: "b.yomb" },
        { type: "build", entry: "b.its2000", distractors: ["téeméer", "ñetti"] },
        { type: "pick_meaning", entry: "b.wanni" },
        { type: "type_wolof", entry: "b.yomb" },
        { type: "speak", entry: "b.wanni" },
      ],
    },
  ],
};
