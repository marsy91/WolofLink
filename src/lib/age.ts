// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Date of birth, asked when someone creates an account. It decides two things only:
 * under 13s cannot create an account (the app still works fully without one), and
 * under 18s cannot turn on the adult-only community features. Pure, tested in age.test.ts.
 */

/** Youngest age that can create an account. */
export const MIN_ACCOUNT_AGE = 13;
/** Age for the adult-only community features (city leagues, requests, handles). */
export const ADULT_AGE = 18;

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real calendar date in YYYY-MM-DD, not in the future and not before 1900. */
export function isBirthDate(value: unknown, today = new Date()): value is string {
  if (typeof value !== "string") return false;
  const m = DATE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return false;
  return y >= 1900 && value <= todayIso(today);
}

/** Today's date in YYYY-MM-DD (local time), for the date field's upper limit. */
export function todayIso(today = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${today.getFullYear()}-${p(today.getMonth() + 1)}-${p(today.getDate())}`;
}

/** Age in whole years on `today`. */
export function ageOn(birthDate: string, today = new Date()): number {
  const [y, m, d] = birthDate.split("-").map(Number) as [number, number, number];
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  return age;
}

export const canCreateAccount = (birthDate: string, today = new Date()) => ageOn(birthDate, today) >= MIN_ACCOUNT_AGE;
export const isAdult = (birthDate: string | undefined, today = new Date()) => !!birthDate && ageOn(birthDate, today) >= ADULT_AGE;
