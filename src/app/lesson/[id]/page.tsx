// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { LessonPlayer } from "@/components/LessonPlayer";
import { allLessons } from "@/content/course";
import { allReverseLessonIds } from "@/content/reverse";

// Every lesson is pre-rendered so the static export works offline in the app shell.
export function generateStaticParams() {
  // Includes the reversed lessons for Wolof speakers learning English or French.
  return [...allLessons.map((l) => l.id), ...allReverseLessonIds()].map((id) => ({ id }));
}

export const dynamicParams = false;

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonPlayer mode="lesson" lessonId={id} />;
}
