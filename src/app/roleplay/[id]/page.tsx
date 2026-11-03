// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { RolePlayer } from "@/components/RolePlayer";
import { allStories } from "@/content/course";

export function generateStaticParams() {
  return allStories.map(({ story }) => ({ id: story.id }));
}

export const dynamicParams = false;

export default async function RoleplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RolePlayer storyId={id} />;
}
