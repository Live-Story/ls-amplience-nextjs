import LiveStoryClient from "@/components/LiveStoryClient";
import {
  AMPLIENCE_CONTENT_URL,
  fetchAmplienceLiveStoryEntry,
  LS_LANGUAGE,
  LS_STORE,
} from "@/lib/amplience";

export default async function Home() {
  const entry = await fetchAmplienceLiveStoryEntry();

  return (
    <main className="min-h-full w-full">
      <LiveStoryClient
        entry={entry}
        language={LS_LANGUAGE}
        store={LS_STORE}
      />
    </main>
  );
}

export const metadata = {
  title: "Amplience × Live Story",
  description: `Renders Amplience content from ${AMPLIENCE_CONTENT_URL} with ls-client-sdk`,
};
