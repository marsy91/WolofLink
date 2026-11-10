// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Cities and neighbourhoods for city leagues and "learners near you".
 * Learners pick from this list; the app never reads or stores coordinates.
 * City ids must match private.valid_city() in supabase/migrations/*_community.sql
 * (places.test.ts checks). Area ids are "<city>/<area>".
 */

export interface City {
  id: string;
  /** Proper name, the same in every language. */
  name: string;
  country: string;
  /** Neighbourhood ids (after the "/") with their proper names; empty = use the five compass areas. */
  areas: [id: string, name: string][];
}

/** Areas for cities without a named list: translated in the UI (community.area.*). */
export const COMPASS_AREAS = ["centre", "north", "south", "east", "west"] as const;

export const CITIES: City[] = [
  {
    id: "dakar",
    name: "Dakar",
    country: "SN",
    areas: [
      ["plateau", "Plateau"],
      ["medina", "Médina"],
      ["fann-point-e", "Fann – Point E – Amitié"],
      ["mermoz-sacre-coeur", "Mermoz – Sacré-Cœur"],
      ["ouakam", "Ouakam"],
      ["ngor", "Ngor"],
      ["yoff", "Yoff"],
      ["grand-yoff", "Grand Yoff"],
      ["parcelles-assainies", "Parcelles Assainies"],
      ["hlm", "HLM"],
      ["sicap-liberte", "Sicap Liberté"],
      ["grand-dakar", "Grand Dakar"],
      ["hann-bel-air", "Hann Bel-Air"],
      ["pikine", "Pikine"],
      ["guediawaye", "Guédiawaye"],
      ["keur-massar", "Keur Massar"],
      ["rufisque", "Rufisque"],
    ],
  },
  { id: "thies", name: "Thiès", country: "SN", areas: [] },
  { id: "saint-louis", name: "Saint-Louis", country: "SN", areas: [] },
  { id: "touba", name: "Touba", country: "SN", areas: [] },
  { id: "ziguinchor", name: "Ziguinchor", country: "SN", areas: [] },
  { id: "kaolack", name: "Kaolack", country: "SN", areas: [] },
  { id: "mbour", name: "Mbour – Saly", country: "SN", areas: [] },
  { id: "banjul", name: "Banjul – Serrekunda", country: "GM", areas: [] },
  { id: "nouakchott", name: "Nouakchott", country: "MR", areas: [] },
  {
    id: "london",
    name: "London",
    country: "GB",
    areas: [
      ["camden", "Camden"],
      ["hackney", "Hackney"],
      ["islington", "Islington"],
      ["lambeth", "Lambeth"],
      ["lewisham", "Lewisham"],
      ["southwark", "Southwark"],
      ["tower-hamlets", "Tower Hamlets"],
      ["newham", "Newham"],
      ["croydon", "Croydon"],
      ["brent", "Brent"],
      ["ealing", "Ealing"],
      ["haringey", "Haringey"],
      ["westminster", "Westminster"],
      ["greenwich", "Greenwich"],
      ["wandsworth", "Wandsworth"],
      ["waltham-forest", "Waltham Forest"],
      ["enfield", "Enfield"],
      ["barking-dagenham", "Barking and Dagenham"],
    ],
  },
  {
    id: "paris",
    name: "Paris",
    country: "FR",
    areas: [
      ...Array.from({ length: 20 }, (_, i): [string, string] => [`arr-${i + 1}`, `Paris ${i + 1}${i === 0 ? "er" : "e"}`]),
      ["saint-denis", "Saint-Denis (93)"],
      ["montreuil", "Montreuil (93)"],
      ["val-de-marne", "Val-de-Marne (94)"],
      ["hauts-de-seine", "Hauts-de-Seine (92)"],
    ],
  },
  {
    id: "new-york",
    name: "New York",
    country: "US",
    areas: [
      ["manhattan", "Manhattan"],
      ["harlem", "Harlem"],
      ["brooklyn", "Brooklyn"],
      ["bronx", "The Bronx"],
      ["queens", "Queens"],
      ["staten-island", "Staten Island"],
    ],
  },
  { id: "washington", name: "Washington DC", country: "US", areas: [] },
  { id: "montreal", name: "Montréal", country: "CA", areas: [] },
  { id: "milan", name: "Milano", country: "IT", areas: [] },
  { id: "rome", name: "Roma", country: "IT", areas: [] },
  { id: "madrid", name: "Madrid", country: "ES", areas: [] },
  { id: "barcelona", name: "Barcelona", country: "ES", areas: [] },
  { id: "brussels", name: "Bruxelles – Brussel", country: "BE", areas: [] },
  { id: "berlin", name: "Berlin", country: "DE", areas: [] },
];

export const cityById = new Map(CITIES.map((c) => [c.id, c]));

/** All area ids of a city, "<city>/<area>". */
export function areasOf(cityId: string): string[] {
  const city = cityById.get(cityId);
  if (!city) return [];
  const ids = city.areas.length ? city.areas.map(([id]) => id) : [...COMPASS_AREAS];
  return ids.map((a) => `${cityId}/${a}`);
}

/** The proper name of a named area, or null for a compass area (translate community.area.<id>). */
export function areaName(areaId: string): string | null {
  const [cityId, area] = areaId.split("/");
  const city = cityId ? cityById.get(cityId) : undefined;
  return city?.areas.find(([id]) => id === area)?.[1] ?? null;
}
