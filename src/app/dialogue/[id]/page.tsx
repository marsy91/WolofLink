// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { StoryPlayer } from "@/components/StoryPlayer";
import { allStories } from "@/content/course";

export function generateStaticParams() {
  return allStories.map(({ story }) => ({ id: story.id }));
}

export const dynamicParams = false;

export default async function DialoguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StoryPlayer storyId={id} />;
}
