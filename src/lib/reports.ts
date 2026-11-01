// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** Learners flag a word or phrase; the owner reads reports in the owner console. */
import type { UiLang } from "@/content/types";
import { getCloud } from "./cloud";
import { APP_VERSION } from "./version";

export const PROBLEMS = ["spelling", "translation", "audio", "other"] as const;
export type Problem = (typeof PROBLEMS)[number];

export function reportsAvailable(): boolean {
  return getCloud() !== null;
}

export async function sendReport(entryId: string, problem: Problem, note: string, lang: UiLang): Promise<void> {
  const cloud = getCloud();
  if (!cloud) throw new Error("reports need the online service");
  await cloud.rpc("report_problem", {
    entry: entryId,
    problem,
    note: note.trim().slice(0, 500) || null,
    lang,
    version: APP_VERSION,
  });
}
