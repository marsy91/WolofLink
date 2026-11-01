// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Holidays and important dates in Senegal.
 *
 * Three kinds of date:
 * - fixed: same day every year (4 April, 25 December…);
 * - easter: a number of days after Western Easter (Easter Monday, Ascension, Whit Monday);
 * - lunar: Islamic dates. They move about 11 days earlier each year and are only
 *   confirmed a day or two ahead by moon sighting, so the app shows them as
 *   "expected" until the owner confirms them (supabase/migrations/*_calendar.sql).
 *
 * Lunar estimates = the Umm al-Qura date + 1 day. Senegal usually celebrates a day
 * after Saudi Arabia (Tabaski 2024 and 2025, Korité 2025, Magal 2024 and 2025),
 * and some communities a day apart from each other, hence "expected".
 * Regenerate with: scripts/calendar/lunar-estimates.mjs
 */
import { tx } from "./units/helpers";
import type { Translations } from "./types";

export type HolidayKind = "fixed" | "easter" | "lunar";
export type DateStatus = "fixed" | "expected" | "confirmed";

export interface Holiday {
  id: string;
  emoji: string;
  kind: HolidayKind;
  /** Public holiday: offices, banks and most schools close. */
  publicHoliday: boolean;
  title: Translations;
  about: Translations;
  /** Course entries to practise (greetings, related words); all have audio. */
  words: string[];
  /** fixed: [month 1–12, day] */
  fixed?: [number, number];
  /** easter: days after Easter Sunday */
  easterOffset?: number;
  /** lunar: expected dates in Senegal, YYYY-MM-DD */
  expected?: string[];
  /** How many days it lasts (Ramadan), for the "now" label. */
  lengthDays?: number;
}

export const HOLIDAYS: Holiday[] = [
  {
    id: "new-year",
    emoji: "🎆",
    kind: "fixed",
    publicHoliday: true,
    fixed: [1, 1],
    title: tx(["New Year's Day", "Jour de l'An", "Año Nuevo", "Neujahr", "Capodanno"]),
    about: tx([
      "Public holiday. Offices and banks are closed.",
      "Jour férié. Bureaux et banques sont fermés.",
      "Día festivo. Oficinas y bancos cierran.",
      "Gesetzlicher Feiertag. Büros und Banken sind geschlossen.",
      "Giorno festivo. Uffici e banche sono chiusi.",
    ]),
    words: [],
  },
  {
    id: "ramadan",
    emoji: "🌙",
    kind: "lunar",
    publicHoliday: false,
    lengthDays: 29,
    expected: ["2026-02-19", "2027-02-09", "2028-01-29", "2029-01-17", "2030-01-06", "2030-12-27"],
    title: tx(["Start of Ramadan", "Début du Ramadan", "Comienzo del Ramadán", "Beginn des Ramadan", "Inizio del Ramadan"]),
    about: tx([
      "The month of fasting begins. It isn't a public holiday, but daily life slows down: many people fast from dawn to sunset and offices often close earlier. Avoid eating or drinking in public in the daytime.",
      "Le mois du jeûne commence. Ce n'est pas un jour férié, mais le rythme ralentit : beaucoup jeûnent de l'aube au coucher du soleil et les bureaux ferment souvent plus tôt. Évitez de manger ou de boire en public dans la journée.",
      "Empieza el mes de ayuno. No es festivo, pero la vida diaria se ralentiza: mucha gente ayuna del alba al atardecer y las oficinas suelen cerrar antes. Evita comer o beber en público durante el día.",
      "Der Fastenmonat beginnt. Kein Feiertag, aber der Alltag wird ruhiger: Viele fasten von der Morgendämmerung bis Sonnenuntergang, und Büros schließen oft früher. Iss und trink tagsüber nicht in der Öffentlichkeit.",
      "Inizia il mese del digiuno. Non è festivo, ma la vita rallenta: molti digiunano dall'alba al tramonto e gli uffici chiudono spesso prima. Evita di mangiare o bere in pubblico durante il giorno.",
    ]),
    words: ["e.koor", "e.woor", "e.ndogu"],
  },
  {
    id: "korite",
    emoji: "🎉",
    kind: "lunar",
    publicHoliday: true,
    expected: ["2026-03-21", "2027-03-10", "2028-02-27", "2029-02-15", "2030-02-05"],
    title: tx(["Korité (Eid al-Fitr)", "Korité (Aïd el-Fitr)", "Korité (Eid al-Fitr)", "Korité (Fastenbrechen)", "Korité (Eid al-Fitr)"]),
    about: tx([
      "The end of Ramadan. Families dress in new clothes, go to prayer, then visit relatives and neighbours to wish them a happy holiday and ask forgiveness.",
      "La fin du Ramadan. Les familles s'habillent de neuf, vont à la prière, puis rendent visite aux proches et aux voisins pour souhaiter bonne fête et demander pardon.",
      "El final del Ramadán. Las familias estrenan ropa, van a la oración y luego visitan a parientes y vecinos para felicitarlos y pedir perdón.",
      "Das Ende des Ramadan. Familien tragen neue Kleidung, gehen zum Gebet und besuchen dann Verwandte und Nachbarn, um ein frohes Fest zu wünschen und um Vergebung zu bitten.",
      "La fine del Ramadan. Le famiglie indossano abiti nuovi, vanno alla preghiera e poi visitano parenti e vicini per fare gli auguri e chiedere perdono.",
    ]),
    words: ["x.korite", "x.dewenati", "x.baalmaaq", "x.baalnaala"],
  },
  {
    id: "independence",
    emoji: "🇸🇳",
    kind: "fixed",
    publicHoliday: true,
    fixed: [4, 4],
    title: tx(["Independence Day", "Fête de l'Indépendance", "Día de la Independencia", "Unabhängigkeitstag", "Festa dell'Indipendenza"]),
    about: tx([
      "Senegal became independent in 1960. There is a parade in Dakar and flags everywhere; some roads close in the city centre.",
      "Le Sénégal est indépendant depuis 1960. Défilé à Dakar et drapeaux partout ; certaines rues du centre-ville sont fermées.",
      "Senegal se independizó en 1960. Hay un desfile en Dakar y banderas por todas partes; algunas calles del centro se cortan.",
      "Senegal wurde 1960 unabhängig. In Dakar gibt es eine Parade und überall Fahnen; im Zentrum sind manche Straßen gesperrt.",
      "Il Senegal è indipendente dal 1960. C'è una parata a Dakar e bandiere ovunque; alcune strade del centro sono chiuse.",
    ]),
    words: [],
  },
  {
    id: "easter-monday",
    emoji: "🥚",
    kind: "easter",
    publicHoliday: true,
    easterOffset: 1,
    title: tx(["Easter Monday", "Lundi de Pâques", "Lunes de Pascua", "Ostermontag", "Lunedì dell'Angelo"]),
    about: tx([
      "Public holiday. Christian families often share a millet dish called ngalax with their Muslim neighbours.",
      "Jour férié. Les familles chrétiennes partagent souvent le ngalax, un plat de mil, avec leurs voisins musulmans.",
      "Día festivo. Las familias cristianas suelen compartir el ngalax, un plato de mijo, con sus vecinos musulmanes.",
      "Feiertag. Christliche Familien teilen oft ein Hirsegericht namens Ngalax mit ihren muslimischen Nachbarn.",
      "Giorno festivo. Le famiglie cristiane condividono spesso il ngalax, un piatto di miglio, con i vicini musulmani.",
    ]),
    words: [],
  },
  {
    id: "labour-day",
    emoji: "🛠️",
    kind: "fixed",
    publicHoliday: true,
    fixed: [5, 1],
    title: tx(["Labour Day", "Fête du Travail", "Día del Trabajo", "Tag der Arbeit", "Festa dei Lavoratori"]),
    about: tx([
      "Public holiday. Unions march in Dakar.",
      "Jour férié. Les syndicats défilent à Dakar.",
      "Día festivo. Los sindicatos desfilan en Dakar.",
      "Feiertag. Gewerkschaften demonstrieren in Dakar.",
      "Giorno festivo. I sindacati sfilano a Dakar.",
    ]),
    words: [],
  },
  {
    id: "ascension",
    emoji: "⛪",
    kind: "easter",
    publicHoliday: true,
    easterOffset: 39,
    title: tx(["Ascension Day", "Ascension", "Ascensión", "Christi Himmelfahrt", "Ascensione"]),
    about: tx([
      "Public holiday, 39 days after Easter.",
      "Jour férié, 39 jours après Pâques.",
      "Día festivo, 39 días después de Pascua.",
      "Feiertag, 39 Tage nach Ostern.",
      "Giorno festivo, 39 giorni dopo Pasqua.",
    ]),
    words: [],
  },
  {
    id: "whit-monday",
    emoji: "🕊️",
    kind: "easter",
    publicHoliday: true,
    easterOffset: 50,
    title: tx(["Whit Monday", "Lundi de Pentecôte", "Lunes de Pentecostés", "Pfingstmontag", "Lunedì di Pentecoste"]),
    about: tx([
      "Public holiday. That weekend many Catholics go on pilgrimage to Popenguine.",
      "Jour férié. Ce week-end-là, de nombreux catholiques se rendent en pèlerinage à Popenguine.",
      "Día festivo. Ese fin de semana muchos católicos peregrinan a Popenguine.",
      "Feiertag. An diesem Wochenende pilgern viele Katholiken nach Popenguine.",
      "Giorno festivo. Quel fine settimana molti cattolici vanno in pellegrinaggio a Popenguine.",
    ]),
    words: [],
  },
  {
    id: "tabaski",
    emoji: "🐏",
    kind: "lunar",
    publicHoliday: true,
    expected: ["2026-05-28", "2027-05-17", "2028-05-06", "2029-04-25", "2030-04-14"],
    title: tx(["Tabaski (Eid al-Adha)", "Tabaski (Aïd el-Kébir)", "Tabaski (Eid al-Adha)", "Tabaski (Opferfest)", "Tabaski (Eid al-Adha)"]),
    about: tx([
      "The biggest festival of the year. Families sacrifice a ram and share the meat. Many people travel to their home town, so buses and roads are packed in the days before, and many shops close for several days.",
      "La plus grande fête de l'année. Les familles sacrifient un mouton et partagent la viande. Beaucoup rentrent dans leur ville d'origine : cars et routes sont bondés les jours d'avant, et de nombreux commerces ferment plusieurs jours.",
      "La mayor fiesta del año. Las familias sacrifican un carnero y comparten la carne. Mucha gente viaja a su pueblo, así que autobuses y carreteras van llenos los días antes, y muchas tiendas cierran varios días.",
      "Das größte Fest des Jahres. Familien schlachten einen Hammel und teilen das Fleisch. Viele fahren in ihren Heimatort, daher sind Busse und Straßen in den Tagen davor überfüllt, und viele Geschäfte schließen für mehrere Tage.",
      "La festa più grande dell'anno. Le famiglie sacrificano un montone e ne condividono la carne. Molti tornano al paese d'origine: nei giorni prima autobus e strade sono pieni, e molti negozi chiudono per diversi giorni.",
    ]),
    words: ["x.tabaski", "a.xar", "x.dewenati", "x.baalmaaq"],
  },
  {
    id: "tamxarit",
    emoji: "🥣",
    kind: "lunar",
    publicHoliday: true,
    expected: ["2026-06-26", "2027-06-16", "2028-06-04", "2029-05-24", "2030-05-14"],
    title: tx(["Tamxarit (Islamic New Year)", "Tamkharit (Nouvel An musulman)", "Tamxarit (Año Nuevo islámico)", "Tamxarit (islamisches Neujahr)", "Tamxarit (Capodanno islamico)"]),
    about: tx([
      "Ten days into the Islamic new year. Families share a big couscous dinner, and in the evening children dress up and go from door to door singing.",
      "Dix jours après le Nouvel An musulman. Les familles partagent un grand couscous, et le soir les enfants se déguisent et vont chanter de porte en porte.",
      "Diez días después del Año Nuevo islámico. Las familias comparten un gran cuscús y, por la noche, los niños se disfrazan y van cantando de puerta en puerta.",
      "Zehn Tage nach dem islamischen Neujahr. Familien essen gemeinsam ein großes Couscous, und abends verkleiden sich Kinder und ziehen singend von Tür zu Tür.",
      "Dieci giorni dopo il Capodanno islamico. Le famiglie condividono un grande cuscus e la sera i bambini si travestono e vanno a cantare di porta in porta.",
    ]),
    words: [],
  },
  {
    id: "magal",
    emoji: "🕌",
    kind: "lunar",
    publicHoliday: true,
    expected: ["2026-08-02", "2027-07-23", "2028-07-12", "2029-07-01", "2030-06-21"],
    title: tx(["Grand Magal of Touba", "Grand Magal de Touba", "Gran Magal de Touba", "Großer Magal von Touba", "Grande Magal di Touba"]),
    about: tx([
      "Millions of Mourides travel to Touba to remember the exile of Cheikh Ahmadou Bamba. Roads to Touba are extremely busy for several days; plan travel around it.",
      "Des millions de mourides se rendent à Touba pour commémorer l'exil de Cheikh Ahmadou Bamba. Les routes vers Touba sont saturées pendant plusieurs jours : prévoyez vos déplacements.",
      "Millones de muridas viajan a Touba para recordar el exilio de Cheikh Ahmadou Bamba. Las carreteras hacia Touba están colapsadas varios días; planifica tus viajes.",
      "Millionen Muriden reisen nach Touba, um an das Exil von Scheich Ahmadou Bamba zu erinnern. Die Straßen nach Touba sind mehrere Tage lang völlig überlastet; plane Reisen entsprechend.",
      "Milioni di muridi si recano a Touba per ricordare l'esilio di Cheikh Ahmadou Bamba. Le strade verso Touba sono intasate per giorni: organizza gli spostamenti di conseguenza.",
    ]),
    words: [],
  },
  {
    id: "assumption",
    emoji: "⛪",
    kind: "fixed",
    publicHoliday: true,
    fixed: [8, 15],
    title: tx(["Assumption Day", "Assomption", "Asunción", "Mariä Himmelfahrt", "Ferragosto (Assunzione)"]),
    about: tx([
      "Public holiday.",
      "Jour férié.",
      "Día festivo.",
      "Feiertag.",
      "Giorno festivo.",
    ]),
    words: [],
  },
  {
    id: "gamou",
    emoji: "✨",
    kind: "lunar",
    publicHoliday: true,
    expected: ["2026-08-26", "2027-08-15", "2028-08-04", "2029-07-25", "2030-07-14"],
    title: tx(["Gamou (the Prophet's birthday)", "Gamou (Maouloud)", "Gamou (nacimiento del Profeta)", "Gamou (Geburtstag des Propheten)", "Gamou (nascita del Profeta)"]),
    about: tx([
      "The Prophet's birthday. Large night-long gatherings take place, above all in Tivaouane, and traffic towards it is heavy.",
      "La naissance du Prophète. De grands rassemblements ont lieu toute la nuit, surtout à Tivaouane, et la circulation y est dense.",
      "El nacimiento del Profeta. Hay grandes reuniones durante toda la noche, sobre todo en Tivaouane, y mucho tráfico hacia allí.",
      "Der Geburtstag des Propheten. Es gibt große nächtliche Versammlungen, vor allem in Tivaouane, mit viel Verkehr dorthin.",
      "La nascita del Profeta. Si tengono grandi raduni per tutta la notte, soprattutto a Tivaouane, con molto traffico.",
    ]),
    words: [],
  },
  {
    id: "all-saints",
    emoji: "🕯️",
    kind: "fixed",
    publicHoliday: true,
    fixed: [11, 1],
    title: tx(["All Saints' Day", "Toussaint", "Todos los Santos", "Allerheiligen", "Ognissanti"]),
    about: tx([
      "Public holiday.",
      "Jour férié.",
      "Día festivo.",
      "Feiertag.",
      "Giorno festivo.",
    ]),
    words: [],
  },
  {
    id: "christmas",
    emoji: "🎄",
    kind: "fixed",
    publicHoliday: true,
    fixed: [12, 25],
    title: tx(["Christmas", "Noël", "Navidad", "Weihnachten", "Natale"]),
    about: tx([
      "Public holiday. Christians and Muslims often celebrate together, and Dakar's streets are decorated.",
      "Jour férié. Chrétiens et musulmans fêtent souvent ensemble, et les rues de Dakar sont décorées.",
      "Día festivo. Cristianos y musulmanes suelen celebrarlo juntos, y las calles de Dakar se decoran.",
      "Feiertag. Christen und Muslime feiern oft gemeinsam, und Dakars Straßen sind geschmückt.",
      "Giorno festivo. Cristiani e musulmani festeggiano spesso insieme e le strade di Dakar sono addobbate.",
    ]),
    words: [],
  },
];

export const HOLIDAY_BY_ID: Record<string, Holiday> = Object.fromEntries(HOLIDAYS.map((h) => [h.id, h]));

/** Date confirmed (or corrected) online by the owner, keyed by `${holidayId}:${year}`. */
export type DateOverrides = Record<string, { date: string; confirmed: boolean }>;

export interface Occurrence {
  holiday: Holiday;
  /** YYYY-MM-DD */
  date: string;
  status: DateStatus;
  /** Whole days from today; negative while an event that lasts (Ramadan) is under way. */
  daysAway: number;
  ongoing: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");
export const ymd = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const dayNumber = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!) / 864e5;
};

/** Western Easter Sunday (anonymous Gregorian algorithm). */
export function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return ymd(year, month, day);
}

function addDays(iso: string, n: number): string {
  const d = new Date((dayNumber(iso) + n) * 864e5);
  return ymd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/** The holiday's date in a given year, or null when no estimate exists for that year. */
export function dateIn(holiday: Holiday, year: number, overrides: DateOverrides = {}): { date: string; status: DateStatus } | null {
  const o = overrides[`${holiday.id}:${year}`];
  if (o && o.date.startsWith(`${year}-`)) return { date: o.date, status: o.confirmed ? "confirmed" : "expected" };
  if (holiday.kind === "fixed" && holiday.fixed) return { date: ymd(year, holiday.fixed[0], holiday.fixed[1]), status: "fixed" };
  if (holiday.kind === "easter") return { date: addDays(easterSunday(year), holiday.easterOffset ?? 0), status: "fixed" };
  const est = holiday.expected?.find((d) => d.startsWith(`${year}-`));
  return est ? { date: est, status: "expected" } : null;
}

/** Local calendar date of `now` as YYYY-MM-DD. */
export function localToday(now: Date): string {
  return ymd(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** Upcoming dates (and anything under way) within `horizonDays`, soonest first. */
export function upcoming(now: Date, overrides: DateOverrides = {}, horizonDays = 364): Occurrence[] {
  const today = localToday(now);
  const t = dayNumber(today);
  const year = now.getFullYear();
  const out: Occurrence[] = [];
  for (const holiday of HOLIDAYS) {
    for (const y of [year - 1, year, year + 1]) {
      const hit = dateIn(holiday, y, overrides);
      if (!hit) continue;
      const daysAway = dayNumber(hit.date) - t;
      const ongoing = daysAway < 0 && daysAway > -(holiday.lengthDays ?? 1);
      if ((daysAway >= 0 || ongoing) && daysAway <= horizonDays) out.push({ holiday, ...hit, daysAway, ongoing });
    }
  }
  return out.sort((a, b) => a.daysAway - b.daysAway || a.holiday.id.localeCompare(b.holiday.id));
}
