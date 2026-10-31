// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // leisure-1
  entry("s.fo", "fo", ["to play", "jouer", "jugar", "spielen", "giocare"], { pic: "🎲" }),
  entry("s.daw", "daw", ["to run", "courir", "correr", "laufen, rennen", "correre"], { pic: "🏃" }),
  entry("s.feey", "féey", ["to swim", "nager", "nadar", "schwimmen", "nuotare"], { pic: "🏊" }),
  entry("s.deglu", "déglu", ["to listen", "écouter", "escuchar", "zuhören", "ascoltare"], { pic: "🎧" }),
  entry("s.tukki", "tukki", ["to travel", "voyager", "viajar", "reisen", "viaggiare"], { pic: "🧳" }),
  entry("s.lamb", "làmb", ["Senegalese wrestling", "lutte sénégalaise", "lucha senegalesa", "senegalesisches Ringen", "lotta senegalese"], {
    pic: "🤼",
    note: [
      "Senegal's favourite traditional sport: the big fights fill stadiums and stop the country.",
      "Le sport traditionnel préféré du Sénégal : les grands combats remplissent les stades et arrêtent le pays.",
      "El deporte tradicional favorito de Senegal: los grandes combates llenan estadios y paralizan el país.",
      "Senegals beliebtester traditioneller Sport: Die großen Kämpfe füllen Stadien und legen das Land still.",
      "Lo sport tradizionale preferito del Senegal: i grandi incontri riempiono gli stadi e fermano il paese.",
    ],
  }),

  // leisure-2
  entry("s.begfeey", "Dama bëgg féey", ["I like swimming", "J'aime nager", "Me gusta nadar", "Ich schwimme gern", "Mi piace nuotare"], {
    note: [
      "Dama bëgg means both “I want” and “I like”; the situation tells you which.",
      "Dama bëgg veut dire « je veux » et « j'aime » ; le contexte fait la différence.",
      "Dama bëgg significa «quiero» y «me gusta»; el contexto lo aclara.",
      "Dama bëgg heißt „ich will“ und „ich mag“; der Zusammenhang entscheidet.",
      "Dama bëgg significa sia «voglio» sia «mi piace»; lo chiarisce il contesto.",
    ],
  }),
  entry("s.xaleyi", "Xale yi dañuy fo", ["The children are playing", "Les enfants jouent", "Los niños están jugando", "Die Kinder spielen", "I bambini giocano"]),
  entry("s.mbalax", "Dama bëgg déglu mbalax", [
    "I like listening to mbalax",
    "J'aime écouter du mbalax",
    "Me gusta escuchar mbalax",
    "Ich höre gern Mbalax",
    "Mi piace ascoltare il mbalax",
  ]),
  entry("s.lambnga", "Bëgg nga làmb?", ["Do you like wrestling?", "Tu aimes la lutte ?", "¿Te gusta la lucha?", "Magst du Ringen?", "Ti piace la lotta?"]),
  entry("s.maangidaw", "Maa ngi daw", ["I'm running", "Je cours", "Estoy corriendo", "Ich laufe gerade", "Sto correndo"]),

  // leisure-3
  entry("s.saxaar", "saxaar", ["train", "train", "tren", "Zug", "treno"], { pic: "🚆" }),
  entry("s.fanngaytukki", "Fan ngay tukki?", ["Where are you travelling to?", "Où vas-tu en voyage ?", "¿Adónde viajas?", "Wohin reist du?", "Dove vai in viaggio?"]),
  entry("s.dinaatukki", "Dinaa tukki suba", ["I'm travelling tomorrow", "Je pars en voyage demain", "Me voy de viaje mañana", "Ich reise morgen ab", "Parto domani"]),
  entry("s.jelsaxaar", "Dama bëgg jël saxaar", ["I want to take the train", "Je veux prendre le train", "Quiero coger el tren", "Ich möchte den Zug nehmen", "Voglio prendere il treno"]),
  entry("s.yoonwi", "Yoon wi dafa gudd", ["The journey is long", "Le trajet est long", "El viaje es largo", "Der Weg ist lang", "Il viaggio è lungo"], {
    note: [
      "Yoon means “way, road, journey” (and also “time”, as in beneen yoon, “another time”).",
      "Yoon veut dire « chemin, route, trajet » (et aussi « fois », comme dans beneen yoon, « une autre fois »).",
      "Yoon significa «camino, viaje» (y también «vez», como en beneen yoon, «otra vez»).",
      "Yoon heißt „Weg, Strecke“ (und auch „Mal“, wie in beneen yoon, „ein andermal“).",
      "Yoon significa «strada, tragitto» (e anche «volta», come in beneen yoon, «un'altra volta»).",
    ],
  }),
];

export const unit: Unit = {
  id: "u16",
  glyph: "run",
  tone: "dusk",
  title: tx(["Free time and travel", "Loisirs et voyages", "Ocio y viajes", "Freizeit und Reisen", "Tempo libero e viaggi"]),
  lessons: [
    {
      id: "leisure-1",
      title: tx(["Hobbies", "Les loisirs", "Aficiones", "Hobbys", "Hobby"]),
      tip: tx([
        "On Sunday afternoons the beaches of Dakar fill with people running, playing football and training for wrestling.",
        "Le dimanche après-midi, les plages de Dakar se remplissent de gens qui courent, jouent au foot et s'entraînent à la lutte.",
        "Los domingos por la tarde las playas de Dakar se llenan de gente que corre, juega al fútbol y entrena lucha.",
        "Sonntagnachmittags sind die Strände von Dakar voller Menschen, die laufen, Fußball spielen und für das Ringen trainieren.",
        "La domenica pomeriggio le spiagge di Dakar si riempiono di gente che corre, gioca a calcio e si allena alla lotta.",
      ]),
      entries: ["s.fo", "s.daw", "s.feey", "s.deglu", "s.tukki", "s.lamb"],
      exercises: [
        { type: "pick_picture", entry: "s.daw" },
        { type: "pick_picture", entry: "s.feey" },
        { type: "pick_picture", entry: "s.tukki" },
        { type: "pick_picture", entry: "s.lamb" },
        { type: "match", entries: ["s.fo", "s.daw", "s.feey", "s.deglu"] },
        { type: "listen", entry: "s.lamb" },
        { type: "pick_meaning", entry: "s.fo" },
        { type: "pick_wolof", entry: "s.deglu" },
        { type: "pick_picture", entry: "s.deglu" },
        { type: "match", entries: ["s.tukki", "s.lamb", "s.fo", "s.feey"] },
        { type: "type_wolof", entry: "s.daw" },
        { type: "listen", entry: "s.tukki" },
      ],
    },
    {
      id: "leisure-2",
      title: tx(["What I like doing", "Ce que j'aime faire", "Lo que me gusta hacer", "Was ich gern mache", "Cosa mi piace fare"]),
      tip: tx([
        "Dañuy + verb means “they are doing”: Xale yi dañuy fo, “the children are playing”. Yi is the plural “the”.",
        "Dañuy + verbe veut dire « ils sont en train de » : Xale yi dañuy fo, « les enfants jouent ». Yi est le « les » du pluriel.",
        "Dañuy + verbo significa «están haciendo»: Xale yi dañuy fo, «los niños están jugando». Yi es el «los» del plural.",
        "Dañuy + Verb heißt „sie sind gerade dabei“: Xale yi dañuy fo, „die Kinder spielen“. Yi ist das „die“ im Plural.",
        "Dañuy + verbo significa «stanno facendo»: Xale yi dañuy fo, «i bambini giocano». Yi è il «i / le» del plurale.",
      ]),
      entries: ["s.begfeey", "s.xaleyi", "s.mbalax", "s.lambnga", "s.maangidaw"],
      exercises: [
        { type: "pick_meaning", entry: "s.begfeey" },
        { type: "pick_meaning", entry: "s.xaleyi" },
        { type: "listen", entry: "s.mbalax" },
        { type: "build", entry: "s.mbalax", distractors: ["fo", "nga"] },
        { type: "pick_wolof", entry: "s.lambnga" },
        { type: "fill_blank", entry: "s.xaleyi", blank: 3, options: ["fo", "daw", "féey"] },
        { type: "pick_meaning", entry: "s.maangidaw" },
        { type: "build", entry: "s.xaleyi", distractors: ["bi", "naa"] },
        { type: "fill_blank", entry: "s.begfeey", blank: 2, options: ["féey", "fo", "tukki"] },
        { type: "pick_wolof", entry: "s.maangidaw" },
        { type: "type_wolof", entry: "s.lambnga" },
        { type: "speak", entry: "s.begfeey" },
      ],
    },
    {
      id: "leisure-3",
      title: tx(["Travelling", "Voyager", "Viajar", "Reisen", "Viaggiare"]),
      tip: tx([
        "Ngay asks what someone is doing or about to do: Fan ngay dem? “where are you going?”, Fan ngay tukki? “where are you travelling to?”.",
        "Ngay demande ce que quelqu'un fait ou va faire : Fan ngay dem ? « où vas-tu ? », Fan ngay tukki ? « où pars-tu en voyage ? ».",
        "Ngay pregunta qué hace o va a hacer alguien: ¿Fan ngay dem? «¿adónde vas?», ¿Fan ngay tukki? «¿adónde viajas?».",
        "Ngay fragt, was jemand tut oder vorhat: Fan ngay dem? „wohin gehst du?“, Fan ngay tukki? „wohin reist du?“.",
        "Ngay chiede cosa fa o farà qualcuno: Fan ngay dem? «dove vai?», Fan ngay tukki? «dove vai in viaggio?».",
      ]),
      entries: ["s.saxaar", "s.fanngaytukki", "s.dinaatukki", "s.jelsaxaar", "s.yoonwi"],
      exercises: [
        { type: "pick_picture", entry: "s.saxaar" },
        { type: "pick_meaning", entry: "s.fanngaytukki" },
        { type: "listen", entry: "s.dinaatukki" },
        { type: "build", entry: "s.jelsaxaar", distractors: ["tukki", "yi"] },
        { type: "pick_wolof", entry: "s.yoonwi" },
        { type: "fill_blank", entry: "s.dinaatukki", blank: 2, options: ["suba", "tey", "démb"] },
        { type: "pick_meaning", entry: "s.jelsaxaar" },
        { type: "fill_blank", entry: "s.yoonwi", blank: 3, options: ["gudd", "sore", "tàng"] },
        { type: "build", entry: "s.fanngaytukki", distractors: ["dem", "la"] },
        { type: "listen", entry: "s.yoonwi" },
        { type: "type_wolof", entry: "s.saxaar" },
        { type: "speak", entry: "s.fanngaytukki" },
      ],
    },
  ],
};
