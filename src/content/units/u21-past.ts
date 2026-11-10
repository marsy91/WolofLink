// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // past-1
  entry("y.demndakaaru", "Dem naa Ndakaaru", ["I went to Dakar", "Je suis allé à Dakar", "Fui a Dakar", "Ich war in Dakar", "Sono andato a Dakar"]),
  entry("y.agsinaa", "Agsi naa", ["I've arrived", "Je suis arrivé", "He llegado", "Ich bin angekommen", "Sono arrivato"]),
  entry("y.newna", "Ñëw na", ["He or she has come", "Il ou elle est venu", "Ha venido", "Er oder sie ist gekommen", "È venuto o venuta"]),
  entry("y.dembligeey", "Démb, liggéey naa", ["Yesterday I worked", "Hier, j'ai travaillé", "Ayer trabajé", "Gestern habe ich gearbeitet", "Ieri ho lavorato"]),
  entry("y.gisnaala", "Gis naa la démb", ["I saw you yesterday", "Je t'ai vu hier", "Te vi ayer", "Ich habe dich gestern gesehen", "Ti ho visto ieri"]),

  // past-2
  entry("y.demuma", "Demuma", ["I didn't go", "Je n'y suis pas allé", "No fui", "Ich bin nicht hingegangen", "Non ci sono andato"]),
  entry("y.gisumako", "Gisuma ko", ["I didn't see him or her", "Je ne l'ai pas vu", "No lo vi", "Ich habe ihn oder sie nicht gesehen", "Non l'ho visto"], {
    note: [
      "ko means “him”, “her” or “it” and comes after the verb, just like la “you” in Gis naa la.",
      "ko veut dire « le », « la » ou « lui » et se place après le verbe, comme la « te » dans Gis naa la.",
      "ko significa «lo», «la» o «le» y va después del verbo, igual que la «te» en Gis naa la.",
      "ko heißt „ihn“, „sie“ oder „es“ und steht nach dem Verb, genau wie la „dich“ in Gis naa la.",
      "ko vuol dire «lo», «la» o «gli» e va dopo il verbo, proprio come la «ti» in Gis naa la.",
    ],
  }),
  entry("y.amoonoto", "Am naa woon oto", ["I used to have a car", "J'avais une voiture", "Antes tenía coche", "Ich hatte früher ein Auto", "Avevo una macchina"], {
    note: [
      "woon after the verb puts it further in the past: “used to”, “had”. It's the same past marker as -oon in Dama feebaroon, written as a separate word after naa.",
      "woon après le verbe place l'action plus loin dans le passé : « avant », « avais ». C'est le même marqueur que -oon dans Dama feebaroon, écrit à part après naa.",
      "woon después del verbo lo sitúa más atrás en el pasado: «antes», «tenía». Es el mismo marcador que -oon en Dama feebaroon, escrito aparte después de naa.",
      "woon nach dem Verb verlegt es weiter in die Vergangenheit: „früher“, „hatte“. Es ist dasselbe Zeichen wie -oon in Dama feebaroon, nach naa getrennt geschrieben.",
      "woon dopo il verbo lo sposta più indietro nel passato: «prima», «avevo». È lo stesso segno di -oon in Dama feebaroon, scritto staccato dopo naa.",
    ],
  }),
  entry("y.fandemoon", "Fan nga demoon?", ["Where have you been?", "Où étais-tu passé ?", "¿Dónde estabas?", "Wo warst du?", "Dove eri finito?"]),
  entry("y.doonligeey", "Dama doon liggéey", ["I was working", "J'étais en train de travailler", "Estaba trabajando", "Ich war am Arbeiten", "Stavo lavorando"]),
];

export const unit: Unit = {
  id: "u21",
  glyph: "clock",
  tone: "dusk",
  title: tx(["Talking about the past", "Parler du passé", "Hablar del pasado", "Über die Vergangenheit sprechen", "Parlare del passato"]),
  lessons: [
    {
      id: "past-1",
      title: tx(["What I did", "Ce que j'ai fait", "Lo que hice", "Was ich gemacht habe", "Cosa ho fatto"]),
      tip: tx([
        "For something done, put naa (I), nga (you) or na (he/she) after the verb: dem naa “I went”, ñëw na “he came”.",
        "Pour une action faite, mettez naa (je), nga (tu) ou na (il/elle) après le verbe : dem naa « je suis allé », ñëw na « il est venu ».",
        "Para algo ya hecho, pon naa (yo), nga (tú) o na (él/ella) después del verbo: dem naa «fui», ñëw na «vino».",
        "Für Erledigtes steht naa (ich), nga (du) oder na (er/sie) nach dem Verb: dem naa „ich ging“, ñëw na „er kam“.",
        "Per un'azione compiuta metti naa (io), nga (tu) o na (lui/lei) dopo il verbo: dem naa «sono andato», ñëw na «è venuto».",
      ]),
      entries: ["y.demndakaaru", "y.agsinaa", "y.newna", "y.dembligeey", "y.gisnaala", "v.lekknaa"],
      exercises: [
        { type: "pick_meaning", entry: "y.demndakaaru" },
        { type: "pick_meaning", entry: "y.agsinaa" },
        { type: "listen", entry: "y.newna" },
        { type: "match", entries: ["y.demndakaaru", "y.agsinaa", "y.newna", "v.lekknaa"] },
        { type: "pick_wolof", entry: "y.dembligeey" },
        { type: "fill_blank", entry: "y.gisnaala", blank: 3, options: ["démb", "tey", "suba"] },
        { type: "build", entry: "y.gisnaala", distractors: ["suba", "nga"] },
        { type: "pick_meaning", entry: "y.dembligeey" },
        { type: "listen", entry: "y.demndakaaru" },
        { type: "pick_wolof", entry: "y.newna" },
        { type: "type_wolof", entry: "y.agsinaa" },
        { type: "speak", entry: "y.demndakaaru" },
      ],
    },
    {
      id: "past-2",
      title: tx(["Didn't, used to, was doing", "Pas fait, avant, en train de", "No hice, antes, estaba", "Nicht, früher, gerade", "Non ho, prima, stavo"]),
      tip: tx([
        "To say you didn't, add -uma to the verb: dem → demuma “I didn't go”. -uma is only for “I”; you met -ul for others in Lu tax nga ñëwul? (unit 15). doon means “was …ing”: Dama doon liggéey.",
        "Pour dire que vous ne l'avez pas fait, ajoutez -uma au verbe : dem → demuma « je n'y suis pas allé ». -uma ne sert que pour « je » ; pour les autres, vous avez vu -ul dans Lu tax nga ñëwul ? (unité 15). doon veut dire « étais en train de » : Dama doon liggéey.",
        "Para decir que no lo hiciste, añade -uma al verbo: dem → demuma «no fui». -uma es solo para «yo»; para los demás viste -ul en Lu tax nga ñëwul? (unidad 15). doon significa «estaba …ando»: Dama doon liggéey.",
        "Für „nicht“ hängst du -uma an das Verb: dem → demuma „ich bin nicht gegangen“. -uma gilt nur für „ich“; für andere kennst du -ul aus Lu tax nga ñëwul? (Einheit 15). doon heißt „war gerade am …“: Dama doon liggéey.",
        "Per dire che non l'hai fatto aggiungi -uma al verbo: dem → demuma «non ci sono andato». -uma vale solo per «io»; per gli altri hai visto -ul in Lu tax nga ñëwul? (unità 15). doon vuol dire «stavo …ando»: Dama doon liggéey.",
      ]),
      entries: ["y.demuma", "y.gisumako", "y.amoonoto", "y.fandemoon", "y.doonligeey", "v.lekkuma"],
      exercises: [
        { type: "pick_meaning", entry: "y.demuma" },
        { type: "pick_meaning", entry: "y.gisumako" },
        { type: "match", entries: ["y.demuma", "y.gisumako", "v.lekkuma", "y.doonligeey"] },
        { type: "listen", entry: "y.fandemoon" },
        { type: "pick_wolof", entry: "y.amoonoto" },
        { type: "fill_blank", entry: "y.amoonoto", blank: 2, options: ["woon", "doon", "rekk"] },
        { type: "build", entry: "y.doonligeey", distractors: ["naa", "woon"] },
        { type: "pick_meaning", entry: "y.fandemoon" },
        { type: "pick_wolof", entry: "y.doonligeey" },
        { type: "listen", entry: "y.gisumako" },
        { type: "type_wolof", entry: "y.demuma" },
        { type: "speak", entry: "y.fandemoon" },
      ],
    },
  ],
};
