// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { LessonPlayer } from "@/components/LessonPlayer";
import { allLessons } from "@/content/course";

// Every lesson is pre-rendered so the static export works offline in the app shell.
export function generateStaticParams() {
  return allLessons.map((l) => ({ id: l.id }));
}

export const dynamicParams = false;

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonPlayer mode="lesson" lessonId={id} />;
}
