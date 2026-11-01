// Prints expected Senegal dates for the Islamic holidays in src/content/calendar.ts.
// Method: the Umm al-Qura date (Intl calendar) + 1 day, because Senegal usually
// celebrates a day after Saudi Arabia. Usage: node scripts/calendar/lunar-estimates.mjs 2026 2031
const [from = 2026, to = 2031] = process.argv.slice(2).map(Number);
const fmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" });
const hijri = (d) => {
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return [Number(p.month), Number(p.day)];
};
const events = { ramadan: [9, 1], korite: [10, 1], tabaski: [12, 10], tamxarit: [1, 10], magal: [2, 18], gamou: [3, 12] };
const out = {};
for (let t = Date.UTC(from, 0, 1); t < Date.UTC(to, 0, 1); t += 864e5) {
  const [m, d] = hijri(new Date(t));
  for (const [id, [mm, dd]] of Object.entries(events))
    if (m === mm && d === dd) (out[id] ??= []).push(new Date(t + 864e5).toISOString().slice(0, 10));
}
for (const [id, dates] of Object.entries(out)) console.log(`${id}: ${JSON.stringify(dates)}`);
