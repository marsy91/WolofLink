// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Data for "WolofLink World": the countries a learner can pick, and a small dot map.
 * Learners pick a country from a list; the app never reads or stores a location.
 * The country codes must match private.valid_country() in
 * supabase/migrations/*_world.sql (world.test.ts checks).
 *
 * The land dots and country centres were generated from Natural Earth (public domain)
 * by rasterising the 1:50m land outline onto a 96×40 grid (longitude −180…180,
 * latitude 84…−56). Each row is hex: 4 dots per character, left to right.
 */

export const MAP_COLS = 96;
export const MAP_ROWS = 40;
const LAT_TOP = 84;
const LAT_BOTTOM = -56;

export const LAND_ROWS: readonly string[] = [
  "0000007f6f80000000000000",
  "00002977ffc01c0000100000",
  "000037e0ffc0000100fc0700",
  "0001f4f07fc000022fffe700",
  "8fff814c3e000fc7ffffffff",
  "4fffffde18301d9fffffffff",
  "0ffffe1818007bffffffffcc",
  "020ffe1e000213fffffff830",
  "0007ffdf00053ffffffff020",
  "0003ffff0001fffffffff800",
  "0001ffff0000fffffffff800",
  "0001fffa0000df1bfffff200",
  "0001fff0000325fbffff4400",
  "0000fff0000261ffffff2c00",
  "00007fe00003e07fffff1000",
  "00007e000007ffffffff0000",
  "00001c20000fffb9ffff0000",
  "00000c20000fffff1ffe0000",
  "02000c84000fffde1e700000",
  "00000140000ffffc08380000",
  "00000040000ffff008380000",
  "0000002f000ffff80c204000",
  "0000001fc0077ff800510000",
  "0000001fe0001ff000320000",
  "0000003fd0003fe000161000",
  "0000003ffe001fc000008680",
  "0000001ffe000fe00001c500",
  "0000001ffc000fe000001800",
  "0000000ffc001fe800007200",
  "00000007f8001f880000fe00",
  "00000007f0000f880003ff00",
  "00000007e0000f800003ff80",
  "00000007e00007000001ff80",
  "00000007c000060000018f00",
  "0000000f8000000000000700",
  "0000000e0000000000000100",
  "000000060000000000000004",
  "0000000c0000000000000000",
  "0000000c0000000000000000",
  "000000040000000000000000",
];

/** ISO 3166-1 alpha-2 codes a learner can choose. */
export const COUNTRY_CODES: readonly string[] = (
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ " +
  "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO " +
  "FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE " +
  "JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO " +
  "MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW " +
  "PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM " +
  "TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW"
).split(" ");

/** Centre of each country's largest land area, [longitude, latitude]. Tiny territories have none. */
const CENTRES_RAW =
  "AD:1.6,42.5 AE:54.3,23.9 AF:65.9,33.8 AG:-61.8,17.1 AI:-63.1,18.2 AL:20.1,41.1 AM:44.9,40.3 AO:17.6,-12.3 " +
  "AQ:83,-84.7 AR:-64.7,-34.5 AS:-170.7,-14.3 AT:14.1,47.6 AU:123.6,-12.4 AW:-70,12.5 AX:19.9,60.2 AZ:47.7,40.3 " +
  "BA:17.8,44.2 BB:-59.6,13.2 BD:90.2,23.9 BE:4.6,50.6 BF:-1.8,12.3 BG:25.2,42.8 BH:50.5,26 BI:29.9,-3.4 " +
  "BJ:2.3,9.6 BL:-62.8,17.9 BM:-64.8,32.3 BN:114.6,4.5 BO:-64.7,-16.7 BR:-53.2,-10.7 BS:-78,24.7 BT:90.4,27.4 " +
  "BW:23.8,-22.2 BY:28,53.5 BZ:-88.7,17.2 CA:-99,58.6 CD:23.6,-2.9 CF:20.5,6.6 CG:15.2,-0.8 CH:8.2,46.8 " +
  "CI:-5.6,7.6 CK:-159.8,-21.2 CL:-70.9,-34.4 CM:12.7,5.7 CN:103.3,36.8 CO:-73.1,3.9 CR:-84.2,10 CU:-78.9,21.6 " +
  "CV:-23.6,15.1 CW:-69,12.2 CY:33,34.9 CZ:15.3,49.7 DE:10.4,51 DJ:42.6,11.7 DK:9.3,56.2 DM:-61.4,15.4 " +
  "DO:-70.5,18.9 DZ:2.6,28.1 EC:-78.4,-1.4 EE:25.8,58.7 EG:29.9,26.5 EH:-12.3,24.2 ER:38.8,15.4 ES:-3.6,40.4 " +
  "ET:39.6,8.6 FI:26.2,64.3 FJ:178,-17.8 FK:-58.8,-51.7 FM:158.2,6.9 FO:-6.9,62.2 FR:2.5,46.6 GA:11.8,-0.6 " +
  "GB:-2.4,53.8 GD:-61.7,12.1 GE:43.5,42.2 GG:-2.6,49.5 GH:-1.2,7.9 GL:-41.8,73.1 GM:-15.4,13.5 GN:-10.9,10.4 " +
  "GQ:10.5,1.6 GR:22.6,39.5 GS:-36.7,-54.4 GT:-90.4,15.7 GU:144.8,13.4 GW:-14.9,12.1 GY:-59,4.8 HK:114.1,22.4 " +
  "HM:73.5,-53.1 HN:-86.6,14.8 HR:16.4,45.2 HT:-72.7,18.9 HU:19.4,47.2 ID:114,-0.2 IE:-8.1,53.2 IL:35,31.5 " +
  "IM:-4.5,54.2 IN:79.5,22.8 IO:72.4,-7.3 IQ:43.8,33 IR:54.4,32.5 IS:-18.6,65 IT:12.3,43.5 JE:-2.1,49.2 " +
  "JM:-77.3,18.2 JO:36.8,31.2 JP:137.9,36.6 KE:37.8,0.6 KG:74.5,41.5 KH:104.9,12.7 KI:-157.4,1.9 KM:43.3,-11.7 " +
  "KN:-62.7,17.3 KP:127.2,40.1 KR:127.9,36.5 KW:47.6,29.3 KY:-81.3,19.3 KZ:67.2,48.4 LA:103.8,18.5 LB:35.9,33.9 " +
  "LC:-61,13.9 LI:9.5,47.1 LK:80.7,7.6 LR:-9.3,6.5 LS:28.2,-29.6 LT:23.9,55.3 LU:6.1,49.8 LV:24.9,56.9 LY:18.1,27 " +
  "MA:-8.7,29.8 MC:7.4,43.8 MD:28.5,47.2 ME:19.2,42.8 MF:-63.1,18.1 MG:46.7,-19.3 MH:171.2,7.1 MK:21.7,41.6 " +
  "ML:-3.6,17.3 MM:96.5,21.1 MN:103.1,47 MO:113.5,22.2 MP:145.7,15.2 MR:-10.4,20.2 MS:-62.2,16.7 MT:14.4,35.9 " +
  "MU:57.6,-20.3 MV:73.5,4.2 MW:34.3,-13.2 MX:-102.2,23.9 MY:114.7,3.6 MZ:35.6,-17.2 NA:17.2,-22.1 NC:165.5,-21.3 " +
  "NE:9.3,17.4 NF:167.9,-29.1 NG:8.1,9.6 NI:-85,12.8 NL:5.6,52.3 NO:12.2,63.8 NP:83.9,28.3 NR:166.9,-0.5 " +
  "NU:-169.9,-19 NZ:170.6,-43.9 OM:56.1,20.6 PA:-80.1,8.5 PE:-74.4,-9.1 PF:-149.4,-17.7 PG:144.2,-6.6 " +
  "PH:121.4,15.9 PK:69.2,29.9 PL:19.4,52.1 PM:-56.3,46.9 PN:-128.3,-24.4 PR:-66.5,18.2 PS:35.2,31.9 PT:-8,39.7 " +
  "PW:134.6,7.5 PY:-58.4,-23.2 QA:51.2,25.3 RO:25,45.8 RS:20.8,44.2 RU:95.5,65.9 RW:29.9,-2 SA:44.7,24.1 " +
  "SB:160.2,-9.6 SC:55.5,-4.7 SD:29.9,16 SE:16.2,62.4 SG:103.8,1.4 SH:-5.7,-16 SI:14.8,46.1 SK:19.5,48.7 " +
  "SL:-11.8,8.6 SM:12.5,43.9 SN:-14.5,14.4 SO:45.7,4.7 SR:-55.9,4.1 SS:30.3,7.3 ST:6.6,0.2 SV:-88.9,13.7 " +
  "SX:-63.1,18.1 SY:38.5,35 SZ:31.5,-26.6 TC:-71.7,21.8 TD:18.6,15.3 TF:69.5,-49.3 TG:1,8.5 TH:101,15.1 " +
  "TJ:71,38.5 TL:125.9,-8.8 TM:59.4,39.1 TN:9.6,34.1 TO:-175.2,-21.2 TR:35.4,39.1 TT:-61.3,10.4 TW:121,23.7 " +
  "TZ:34.8,-6.3 UA:31.3,49.2 UG:32.4,1.3 US:-98.8,39.9 UY:-56,-32.8 UZ:63.3,41.8 VA:12.4,41.9 VC:-61.2,13.3 " +
  "VE:-66.2,7.1 VG:-64.6,18.4 VI:-64.8,17.7 VN:106.3,16.5 VU:166.8,-15.2 WF:-178.1,-14.3 WS:-172.4,-13.6 " +
  "YE:47.5,15.9 ZA:25.2,-29 ZM:27.8,-13.5 ZW:29.9,-19";

export const COUNTRY_CENTRES: ReadonlyMap<string, [number, number]> = new Map(
  CENTRES_RAW.split(" ").map((item) => {
    const [code, xy] = item.split(":") as [string, string];
    const [lon, lat] = xy.split(",").map(Number) as [number, number];
    return [code, [lon, lat]];
  }),
);

/** Is the dot at this column and row on land? */
export function isLand(col: number, row: number): boolean {
  const hex = LAND_ROWS[row];
  if (!hex || col < 0 || col >= MAP_COLS) return false;
  const nibble = parseInt(hex[col >> 2] ?? "0", 16);
  return ((nibble >> (3 - (col & 3))) & 1) === 1;
}

/** Map position (in dot units, 0…MAP_COLS and 0…MAP_ROWS) of a longitude and latitude. */
export function project(lon: number, lat: number): { x: number; y: number } {
  const x = ((lon + 180) / 360) * MAP_COLS;
  const y = ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * MAP_ROWS;
  return { x: Math.min(MAP_COLS, Math.max(0, x)), y: Math.min(MAP_ROWS, Math.max(0, y)) };
}

/** The flag emoji of a country code ("SN" → 🇸🇳). */
export function flag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "🌍";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

const names = new Map<string, Intl.DisplayNames | null>();

/** The country's name in the interface language, from the phone's own list of names. */
export function countryName(code: string, lang: string): string {
  if (!names.has(lang)) {
    try {
      names.set(lang, new Intl.DisplayNames([lang], { type: "region" }));
    } catch {
      names.set(lang, null);
    }
  }
  try {
    return names.get(lang)?.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Every country code, sorted by its name in the interface language. */
export function countriesByName(lang: string): string[] {
  return [...COUNTRY_CODES].sort((a, b) => countryName(a, lang).localeCompare(countryName(b, lang), lang));
}
