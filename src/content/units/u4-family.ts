import type { Unit } from "../types";
import { entry, tx } from "./helpers";

export const entries = [
  // family-1
  entry("p.yaay", "yaay", ["mother", "mère", "madre", "Mutter", "madre"], { pic: "👩‍🍼" }),
  entry("p.baay", "baay", ["father", "père", "padre", "Vater", "padre"], { pic: "👨‍🍼" }),
  entry("p.xale", "xale", ["child", "enfant", "niño", "Kind", "bambino"], { pic: "🧒" }),
  entry("p.doom", "doom", ["son or daughter", "fils ou fille", "hijo o hija", "Sohn oder Tochter", "figlio o figlia"]),
  entry(
    "p.mag",
    "mag",
    [
      "older sibling",
      "grand frère ou grande sœur",
      "hermano o hermana mayor",
      "älteres Geschwister",
      "fratello o sorella maggiore",
    ],
    {
      note: [
        "Mag also means an elder, someone older you show respect to.",
        "Mag désigne aussi un aîné, une personne plus âgée que l'on respecte.",
        "Mag también es un mayor, alguien de más edad a quien se respeta.",
        "Mag heißt auch „Älterer“, jemand, dem man Respekt zeigt.",
        "Mag indica anche un anziano, una persona più grande da rispettare.",
      ],
    },
  ),
  entry("p.rakk", "rakk", [
    "younger sibling",
    "petit frère ou petite sœur",
    "hermano o hermana menor",
    "jüngeres Geschwister",
    "fratello o sorella minore",
  ]),
  entry("p.goor", "góor", ["man", "homme", "hombre", "Mann", "uomo"], { pic: "🧔" }),
  entry("p.jigeen", "jigéen", ["woman", "femme", "mujer", "Frau", "donna"], { pic: "👩" }),
  entry("p.samayaay", "Sama yaay", ["my mother", "ma mère", "mi madre", "meine Mutter", "mia madre"]),
  entry("p.samabaay", "Sama baay", ["my father", "mon père", "mi padre", "mein Vater", "mio padre"]),

  // family-2
  entry("p.xarit", "xarit", ["friend", "ami(e)", "amigo/a", "Freund(in)", "amico/a"]),
  entry("p.kii", "Kii sama xarit la", [
    "This is my friend",
    "Voici mon ami(e)",
    "Este es mi amigo",
    "Das ist mein Freund",
    "Questo è il mio amico",
  ]),
  entry("p.amnga", "Am nga doom?", ["Do you have children?", "As-tu des enfants ?", "¿Tienes hijos?", "Hast du Kinder?", "Hai figli?"]),
  entry("p.amnaa", "Am naa ñaari doom", ["I have two children", "J'ai deux enfants", "Tengo dos hijos", "Ich habe zwei Kinder", "Ho due figli"], {
    note: [
      "Before a noun, a number takes -i: ñaar → ñaari doom.",
      "Devant un nom, le nombre prend -i : ñaar → ñaari doom.",
      "Delante de un sustantivo, el número toma -i: ñaar → ñaari doom.",
      "Vor einem Nomen bekommt die Zahl -i: ñaar → ñaari doom.",
      "Davanti a un nome il numero prende -i: ñaar → ñaari doom.",
    ],
  }),
  entry("p.moodu", "Mu ngi tudd Moodu", ["His name is Modou", "Il s'appelle Modou", "Se llama Modou", "Er heißt Modou", "Si chiama Modou"], {
    note: [
      "Mu means both “he” and “she”.",
      "Mu veut dire à la fois « il » et « elle ».",
      "Mu significa tanto «él» como «ella».",
      "Mu heißt sowohl „er“ als auch „sie“.",
      "Mu vuol dire sia «lui» sia «lei».",
    ],
  }),
  entry(
    "p.ana",
    "Ana waa kër gi?",
    ["How is the family?", "Comment va la famille ?", "¿Cómo está la familia?", "Wie geht es der Familie?", "Come sta la famiglia?"],
    {
      note: [
        "Literally “where are the people of the house?”",
        "Littéralement « où sont les gens de la maison ? »",
        "Literalmente «¿dónde está la gente de la casa?»",
        "Wörtlich „wo sind die Leute des Hauses?“",
        "Letteralmente «dove sono quelli di casa?»",
      ],
    },
  ),
  entry("p.nungifa", "Ñu ngi fa", ["They're fine", "Ils vont bien", "Están bien", "Es geht ihnen gut", "Stanno bene"], {
    note: [
      "Literally “they are there”.",
      "Littéralement « ils sont là-bas ».",
      "Literalmente «están allí».",
      "Wörtlich „sie sind dort“.",
      "Letteralmente «sono là».",
    ],
  }),
  entry("p.jabar", "jabar", ["wife", "épouse", "esposa", "Ehefrau", "moglie"]),
  entry("p.jekker", "jëkkër", ["husband", "mari", "marido", "Ehemann", "marito"]),
];

export const unit: Unit = {
  id: "u4",
  glyph: "family",
  tone: "dusk",
  title: tx(["People and family", "Les gens et la famille", "Personas y familia", "Menschen und Familie", "Persone e famiglia"]),
  lessons: [
    {
      id: "family-1",
      title: tx(["Family", "La famille", "La familia", "Die Familie", "La famiglia"]),
      tip: tx([
        "Mag and rakk mean older and younger sibling, brother or sister alike. In family words, age often matters more than gender.",
        "Mag et rakk désignent l'aîné et le cadet, frère ou sœur. Dans les mots de la famille, l'âge compte souvent plus que le genre.",
        "Mag y rakk son el hermano mayor y el menor, sea hermano o hermana. En la familia, la edad suele importar más que el género.",
        "Mag und rakk bedeuten älteres und jüngeres Geschwister, Bruder wie Schwester. Bei Familienwörtern zählt das Alter oft mehr als das Geschlecht.",
        "Mag e rakk indicano il fratello o la sorella maggiore e minore. Nelle parole di famiglia l'età conta spesso più del genere.",
      ]),
      entries: [
        "p.yaay",
        "p.baay",
        "p.xale",
        "p.doom",
        "p.mag",
        "p.rakk",
        "p.goor",
        "p.jigeen",
        "p.samayaay",
        "p.samabaay",
      ],
      exercises: [
        { type: "pick_picture", entry: "p.yaay" },
        { type: "pick_picture", entry: "p.baay" },
        { type: "pick_picture", entry: "p.xale" },
        { type: "pick_meaning", entry: "p.mag" },
        { type: "pick_meaning", entry: "p.rakk" },
        { type: "match", entries: ["p.yaay", "p.baay", "p.goor", "p.jigeen"] },
        { type: "listen", entry: "p.xale" },
        { type: "pick_meaning", entry: "p.samayaay" },
        { type: "build", entry: "p.samabaay", distractors: ["yaay", "mag"] },
        { type: "pick_wolof", entry: "p.doom" },
        { type: "fill_blank", entry: "p.samayaay", blank: 1, options: ["yaay", "baay", "rakk"] },
        { type: "speak", entry: "p.samabaay" },
      ],
    },
    {
      id: "family-2",
      title: tx(["Friends and family", "Amis et famille", "Amigos y familia", "Freunde und Familie", "Amici e famiglia"]),
      tip: tx([
        "Asking about someone's family is part of a proper greeting: Ana waa kër gi? The usual answer is Ñu ngi fa.",
        "Prendre des nouvelles de la famille fait partie des salutations : Ana waa kër gi? On répond en général Ñu ngi fa.",
        "Preguntar por la familia es parte del saludo: Ana waa kër gi? Lo normal es responder Ñu ngi fa.",
        "Nach der Familie zu fragen gehört zum Grüßen: Ana waa kër gi? Die übliche Antwort ist Ñu ngi fa.",
        "Chiedere della famiglia fa parte del saluto: Ana waa kër gi? Di solito si risponde Ñu ngi fa.",
      ]),
      entries: [
        "p.xarit",
        "p.kii",
        "p.amnga",
        "p.amnaa",
        "p.moodu",
        "p.ana",
        "p.nungifa",
        "p.jabar",
        "p.jekker",
      ],
      exercises: [
        { type: "pick_meaning", entry: "p.xarit" },
        { type: "pick_meaning", entry: "p.kii" },
        { type: "build", entry: "p.kii", distractors: ["yaay", "nga"] },
        { type: "pick_meaning", entry: "p.ana" },
        { type: "pick_meaning", entry: "p.nungifa" },
        { type: "match", entries: ["p.jabar", "p.jekker", "p.xarit", "p.nungifa"] },
        { type: "listen", entry: "p.ana" },
        { type: "pick_meaning", entry: "p.amnga" },
        { type: "build", entry: "p.amnaa", distractors: ["nga", "benn"] },
        { type: "fill_blank", entry: "p.moodu", blank: 2, options: ["tudd", "dëkk", "fi"] },
        { type: "pick_wolof", entry: "p.amnga" },
        { type: "speak", entry: "p.ana" },
      ],
    },
  ],
};
