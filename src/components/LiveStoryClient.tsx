"use client";

import { LiveStory } from "ls-client-sdk/client";
import type { LiveStoryEntry } from "ls-client-sdk/client";

type LiveStoryClientProps = {
  entry: LiveStoryEntry;
  language?: string;
  store?: string;
};

export default function LiveStoryClient({
  entry,
  language = "en_US",
  store = "default",
}: LiveStoryClientProps) {
  if (!entry) return null;

  return <LiveStory entry={entry} language={language} store={store} />;
}
