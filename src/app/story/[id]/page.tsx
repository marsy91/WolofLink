import { StoryPlayer } from "@/components/StoryPlayer";
import { allStories } from "@/content/course";

export function generateStaticParams() {
  return allStories.map(({ story }) => ({ id: story.id }));
}

export const dynamicParams = false;

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StoryPlayer storyId={id} />;
}
