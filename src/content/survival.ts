// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * "Survival Wolof": the 100 course words and phrases a newcomer needs first
 * (for example field staff in their first weeks), grouped by theme. Shown as
 * a Dictionary filter, drilled from the Practice tab and printed in the pocket
 * phrasebook (scripts/print). Every id must exist in the course (checked by tests).
 */
import type { Translations } from "./types";

export const SURVIVAL_TITLE: Translations = {
  en: "Survival Wolof",
  fr: "Wolof de survie",
  es: "Wolof de supervivencia",
  de: "Wolof zum Überleben",
  it: "Wolof di sopravvivenza",
};

const t = (en: string, fr: string, es: string, de: string, it: string): Translations => ({ en, fr, es, de, it });

export interface SurvivalGroup {
  title: Translations;
  ids: readonly string[];
}

export const SURVIVAL_GROUPS: readonly SurvivalGroup[] = [
  {
    title: t("Greetings and basics", "Salutations et essentiel", "Saludos y lo básico", "Begrüßung und Grundlagen", "Saluti e basi"),
    ids: [
      "g.salaam", "g.maalekum", "g.nanga", "g.fi", "g.yownag", "g.tudd", "g.awa", "g.jerejef", "g.waaw", "g.deedeet",
      "g.babeneen", "g.fandekk", "g.joge", "g.degg", "g.deggguma", "g.waxaatal", "c.waxal", "c.baal", "c.amulsolo",
      "c.deggnaa", "v.xamuma",
    ],
  },
  {
    title: t("Courtesy and visits", "Politesse et visites", "Cortesía y visitas", "Höflichkeit und Besuche", "Cortesia e visite"),
    ids: ["c.nookobokk", "c.dalal", "c.jamm", "c.jammrekk", "c.toogal", "c.kaay", "c.suur", "c.neexlool", "c.teraanga", "c.maangidem"],
  },
  {
    title: t("Numbers and money", "Chiffres et argent", "Números y dinero", "Zahlen und Geld", "Numeri e soldi"),
    ids: ["n.1", "n.2", "n.3", "n.4", "n.5", "n.10", "n.20", "n.100", "n.junni", "n.price", "n.xaalis", "n.amuma", "n.joxma", "f.seer", "f.wanni"],
  },
  {
    title: t("Food and drink", "Manger et boire", "Comida y bebida", "Essen und Trinken", "Cibo e bevande"),
    ids: ["f.ndox", "f.mburu", "f.ceeb", "f.jen", "f.xiif", "f.mar", "f.begg", "f.neex", "c.amul", "k.anawanag"],
  },
  {
    title: t("Getting around", "Se déplacer", "Moverse", "Unterwegs", "Spostarsi"),
    ids: [
      "l.fangay", "l.ana", "l.fii", "l.fale", "l.cammoon", "l.ndeyjoor", "l.jubal", "l.sore", "l.jege", "l.taxawal",
      "l.taksi", "l.garaas", "l.loppitaan", "v.begdem", "s.fanngaytukki",
    ],
  },
  {
    title: t("Time", "Le temps", "El tiempo", "Zeit", "Il tempo"),
    ids: ["t.tey", "t.suba", "t.demb", "t.waxtu", "t.leegi", "t.kan", "q.banwaxtu", "q.baaxna"],
  },
  {
    title: t("Health and emergencies", "Santé et urgences", "Salud y emergencias", "Gesundheit und Notfälle", "Salute ed emergenze"),
    ids: ["c.dimbali", "c.feebar", "h.boppmetti", "h.biirmetti", "h.doktoor", "h.wooal", "h.amnggarab", "h.wernaa", "v.sonn"],
  },
  {
    title: t("Questions and plans", "Questions et projets", "Preguntas y planes", "Fragen und Pläne", "Domande e programmi"),
    ids: [
      "c.lii", "q.lannga", "q.kiikanla", "q.lutax", "q.ndaxdinga", "q.menuma", "q.nudem", "v.dinaanew",
      "w.lanngayligeey", "r.summil", "a.dafaytaw", "v.tang",
    ],
  },
];

export const SURVIVAL_IDS: readonly string[] = SURVIVAL_GROUPS.flatMap((g) => g.ids);
