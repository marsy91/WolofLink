// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { LessonPlayer } from "@/components/LessonPlayer";
import { SURVIVAL_IDS } from "@/content/survival";

/** A quick drill of 12 random items from the Survival 100 (no drops spent, like reviews). */
export default function SurvivalPage() {
  return <LessonPlayer mode="review" drill={SURVIVAL_IDS} />;
}
