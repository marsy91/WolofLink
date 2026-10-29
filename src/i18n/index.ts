import type { Translations, UiLang } from "@/content/types";
import { de } from "./de";
import { en, type Dictionary, type UiKey } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";

export type { UiKey };

const dictionaries: Record<UiLang, Dictionary> = { en, fr, es, de, it };

/** Native names, so each option is readable before the UI language is chosen. */
export const LANG_NAMES: Record<UiLang, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
};

export const LANG_FLAGS: Record<UiLang, string> = { en: "EN", fr: "FR", es: "ES", de: "DE", it: "IT" };

/** Look up a UI string and fill `{name}` placeholders. */
export function t(lang: UiLang, key: UiKey, vars?: Record<string, string | number>): string {
  const raw = dictionaries[lang][key] ?? en[key];
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m));
}

/** Pick a content translation, falling back to English. */
export function translate(tr: Translations, lang: UiLang): string {
  return tr[lang] ?? tr.en;
}

/** Best guess at the device language for the first onboarding screen. */
export function detectLang(): UiLang {
  if (typeof navigator === "undefined") return "en";
  const code = navigator.language.slice(0, 2).toLowerCase();
  return code in dictionaries ? (code as UiLang) : "en";
}
