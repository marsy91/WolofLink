// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * "Sounds of Wolof": how the official (CLAD) spelling is pronounced. Wolof
 * spelling is phonetic, so learners mostly need the letters that differ from
 * English and French. Examples are course words that already have audio.
 */
import { tx } from "./units/helpers";
import type { Translations } from "./types";

export interface Sound {
  id: string;
  /** What is shown big: the letter or pattern. */
  label: string;
  /** Finds the sound in a Wolof word (used for "How to say it" tips). */
  pattern: RegExp;
  how: Translations;
  examples: string[];
}

export const SOUNDS: Sound[] = [
  {
    id: "e-dots",
    label: "ë",
    pattern: /ë/i,
    how: tx([
      "Like the “u” in “but” or the “a” in “about”: short and relaxed.",
      "Comme le « e » de « le » ou de « petit ».",
      "Una vocal corta y relajada, como la “a” inglesa de “about”.",
      "Wie das „e“ in „bitte“: kurz und entspannt.",
      "Una vocale breve e rilassata, come la “e” muta francese.",
    ]),
    examples: ["f.jen", "l.ker", "h.bet"],
  },
  {
    id: "e-acute",
    label: "é",
    pattern: /é/i,
    how: tx([
      "A closed “e”, like the “ay” in “say” without the glide at the end.",
      "Comme le « é » français de « été ».",
      "Como la “e” española de “mesa”.",
      "Ein geschlossenes „e“ wie in „See“, aber kürzer.",
      "Una “e” chiusa, come in “perché”.",
    ]),
    examples: ["t.bes", "l.geej", "x.sey"],
  },
  {
    id: "e-plain",
    label: "e",
    pattern: /e(?![́̈])/i,
    how: tx([
      "An open “e”, like the “e” in “bed”.",
      "Un « e » ouvert, comme le « è » de « mère ».",
      "Una “e” abierta, como en el inglés “bed”.",
      "Ein offenes „e“ wie in „Bett“.",
      "Una “e” aperta, come in “bello”.",
    ]),
    examples: ["v.lekk", "a.dex", "n.3"],
  },
  {
    id: "o-acute",
    label: "ó",
    pattern: /ó/i,
    how: tx([
      "A closed “o”, like the “o” in “go” without the glide at the end.",
      "Un « o » fermé, comme dans « beau ».",
      "Una “o” cerrada, como en “todo”.",
      "Ein geschlossenes „o“ wie in „Boot“, aber kürzer.",
      "Una “o” chiusa, come in “sole”.",
    ]),
    examples: ["p.goor", "n.5"],
  },
  {
    id: "o-plain",
    label: "o",
    pattern: /o(?!́)/i,
    how: tx([
      "An open “o”, like the “o” in British “lot”.",
      "Un « o » ouvert, comme dans « bol ».",
      "Una “o” abierta, como en el inglés británico “lot”.",
      "Ein offenes „o“ wie in „Sonne“.",
      "Una “o” aperta, come in “cosa”.",
    ]),
    examples: ["f.togg", "f.ndox"],
  },
  {
    id: "a-grave",
    label: "à",
    pattern: /à/i,
    how: tx([
      "An “a” as in “father”, held a little longer. Written à only before two consonants, where “aa” isn’t used.",
      "Un « a » comme dans « papa », un peu plus long. On écrit à seulement devant deux consonnes, où « aa » ne s’utilise pas.",
      "Una “a” como en “casa”, un poco más larga. Se escribe à solo delante de dos consonantes, donde no se usa “aa”.",
      "Ein „a“ wie in „Vater“, etwas länger. à steht nur vor zwei Konsonanten, wo man nicht „aa“ schreibt.",
      "Una “a” come in “casa”, un po’ più lunga. Si scrive à solo davanti a due consonanti, dove non si usa “aa”.",
    ]),
    examples: ["v.jang", "f.yapp", "h.tank"],
  },
  {
    id: "long",
    label: "aa · ee · ii · oo · uu",
    pattern: /(aa|ee|ée|ii|oo|óo|uu)/i,
    how: tx([
      "A doubled vowel is the same sound held twice as long. Length changes meaning, so take your time.",
      "Une voyelle doublée se prononce deux fois plus longue. La longueur change le sens : prenez votre temps.",
      "Una vocal doble se alarga el doble. La duración cambia el significado, así que tómate tu tiempo.",
      "Ein doppelter Vokal wird doppelt so lang gesprochen. Die Länge ändert die Bedeutung, also nimm dir Zeit.",
      "Una vocale doppia si pronuncia lunga il doppio. La durata cambia il significato: prenditi il tuo tempo.",
    ]),
    examples: ["f.ceeb", "f.jaay", "l.fii"],
  },
  {
    id: "double",
    label: "bb · gg · kk · ll · nn · pp · tt",
    pattern: /(bb|cc|dd|gg|jj|kk|ll|mm|nn|ññ|pp|tt|ww|yy)/i,
    how: tx([
      "A doubled consonant is held or pressed a little longer, as in “bookcase”.",
      "Une consonne doublée se tient un peu plus longtemps, comme en italien « notte ».",
      "Una consonante doble se mantiene un poco más, como en el italiano “notte”.",
      "Ein doppelter Konsonant wird etwas länger gehalten, wie in „Schiff-fahrt“.",
      "Una consonante doppia si tiene un po’ più a lungo, come in “notte”.",
    ]),
    examples: ["n.1", "n.10", "v.lekk"],
  },
  {
    id: "x",
    label: "x",
    pattern: /x/i,
    how: tx([
      "A rough sound from the back of the throat, like Scottish “loch” or German “Bach”. Never “ks”.",
      "Un son raclé au fond de la gorge, comme la « jota » espagnole. Jamais « ks ».",
      "Como la “j” española de “jamón”. Nunca “ks”.",
      "Wie „ch“ in „Bach“. Nie „ks“.",
      "Un suono aspro in fondo alla gola, come la “j” spagnola o il tedesco “Bach”. Mai “ks”.",
    ]),
    examples: ["a.xar", "v.wax", "p.baax"],
  },
  {
    id: "q",
    label: "q",
    pattern: /q/i,
    how: tx([
      "A deep “k”, made further back in the throat.",
      "Un « k » profond, prononcé au fond de la gorge.",
      "Una “k” profunda, pronunciada más atrás en la garganta.",
      "Ein tiefes „k“, weiter hinten im Hals gesprochen.",
      "Una “k” profonda, pronunciata più indietro in gola.",
    ]),
    examples: ["r.xonq"],
  },
  {
    id: "c",
    label: "c",
    pattern: /c/i,
    how: tx([
      "Like “ch” in “church”. Never “s” or “k”.",
      "Comme « tch » dans « tchèque ». Jamais « s » ni « k ».",
      "Como la “ch” de “chico”. Nunca “s” ni “k”.",
      "Wie „tsch“ in „Tschüss“. Nie „s“ oder „k“.",
      "Come “ci” in “ciao”. Mai “s” o “k”.",
    ]),
    examples: ["f.ceeb", "x.fecc", "a.picc"],
  },
  {
    id: "j",
    label: "j",
    pattern: /j/i,
    how: tx([
      "Like the “j” in “jump”.",
      "Comme « dj » dans « Djibouti ».",
      "Como la “j” inglesa de “jump”: un sonido parecido a “dy”.",
      "Wie „dsch“ in „Dschungel“.",
      "Come “gi” in “giorno”.",
    ]),
    examples: ["f.jaay", "a.jant", "w.laaj"],
  },
  {
    id: "n-tilde",
    label: "ñ",
    pattern: /ñ/i,
    how: tx([
      "Like “ny” in “canyon”.",
      "Comme « gn » dans « montagne ».",
      "Como la “ñ” española.",
      "Wie „nj“ in „Kognak“ oder spanisch „ñ“.",
      "Come “gn” in “gnocchi”.",
    ]),
    examples: ["n.2", "r.nuul", "f.an"],
  },
  {
    id: "eng",
    label: "ŋ",
    pattern: /ŋ/i,
    how: tx([
      "Like “ng” in “sing”, even at the start of a word.",
      "Comme « ng » dans l’anglais « parking », même en début de mot.",
      "Como la “n” de “tengo”, incluso al principio de una palabra.",
      "Wie „ng“ in „singen“, auch am Wortanfang.",
      "Come “n” in “fango”, anche a inizio parola.",
    ]),
    examples: ["b.million"],
  },
  {
    id: "prenasal",
    label: "mb · nd · ng · nj",
    pattern: /(^|[\s-])(mb|nd|ng|nj|nc|nk|mp|nt)/i,
    how: tx([
      "At the start of a word, say them as one sound: a quick hum straight into the consonant (“ndox” is one syllable).",
      "En début de mot, c’est un seul son : un bref « m » ou « n » enchaîné à la consonne (« ndox » fait une syllabe).",
      "Al principio de una palabra son un solo sonido: una “m” o “n” breve unida a la consonante (“ndox” es una sílaba).",
      "Am Wortanfang ein einziger Laut: ein kurzes Summen direkt in den Konsonanten („ndox“ ist eine Silbe).",
      "A inizio parola sono un unico suono: una breve “m” o “n” legata alla consonante (“ndox” è una sillaba).",
    ]),
    examples: ["f.ndox", "r.mbubb", "p.njool"],
  },
  {
    id: "u",
    label: "u",
    pattern: /u/i,
    how: tx([
      "Like “oo” in “food”.",
      "Comme « ou » dans « tout ».",
      "Como la “u” española.",
      "Wie „u“ in „gut“.",
      "Come “u” in “luna”.",
    ]),
    examples: ["t.suba", "a.muus", "n.10"],
  },
];

/** The sounds worth explaining for a word (the plain vowels e/o/u only when nothing else applies). */
export function soundsIn(wo: string): Sound[] {
  const text = wo.normalize("NFC");
  const found = SOUNDS.filter((s) => s.pattern.test(text));
  const special = found.filter((s) => !["e-plain", "o-plain", "u"].includes(s.id));
  return (special.length ? special : found).slice(0, 3);
}
