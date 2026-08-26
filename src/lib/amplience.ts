import type { LiveStoryEntry } from "ls-client-sdk/client";

const DEFAULT_CONTENT_URL =
  "https://livestorydemo.cdn.content.amplience.net/content/id/fc2bf7a2-0571-4cc4-a837-b90c8e18523c?depth=all&format=inlined";

export const AMPLIENCE_CONTENT_URL =
  process.env.AMPLIENCE_CONTENT_URL ?? DEFAULT_CONTENT_URL;

export const LS_LANGUAGE = process.env.NEXT_PUBLIC_LS_LANGUAGE ?? "en_US";
export const LS_STORE = process.env.NEXT_PUBLIC_LS_STORE ?? "default";
export const LS_SCRIPT_SRC =
  process.env.NEXT_PUBLIC_LS_SCRIPT_SRC ??
  "https://assets.livestory.io/dist/livestory-demo.min.js"; // replace with the brand's Live Story script URL eg. https://assets.livestory.io/dist/livestory-brand.min.js

const LIVE_STORY_CONTENT_API = "https://api.livestory.io/content";

type AmplienceMeta = {
  name?: string;
  schema?: string;
  deliveryKey?: string;
  deliveryId?: string;
};

type LocalizedString = {
  values?: Array<{ locale?: string; value?: string }>;
};

type AmplienceContent = {
  _meta?: AmplienceMeta;
  title?: string | LocalizedString | null;
  id?: string;
  type?: string;
  coverImg?: string;
};

type AmplienceResponse = {
  content: AmplienceContent;
};

type LiveStoryContentApiType = "layout" | "destination";

function unwrapLocalizedString(
  value: string | LocalizedString | null | undefined,
  locale?: string,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  const values = value.values ?? [];
  if (locale) {
    const localeLower = locale.toLowerCase();
    const match = values.find((item) =>
      item.locale?.toLowerCase().startsWith(localeLower),
    );
    if (match?.value) return match.value;
  }

  return values[0]?.value ?? "";
}

function toContentApiType(type: string): LiveStoryContentApiType {
  const normalized = type.toLowerCase();

  if (normalized === "destination" || normalized === "wallgroup") {
    return "destination";
  }

  if (normalized === "layout" || normalized === "wall") {
    return "layout";
  }

  throw new Error(`Unsupported Live Story type: ${type}`);
}

function toSdkType(type: string): string {
  return toContentApiType(type) === "destination" ? "wallgroup" : "wall";
}

function toLiveStoryEntry(content: AmplienceContent): LiveStoryEntry {
  const id = content.id ?? content._meta?.deliveryId;

  if (!id) {
    throw new Error("Amplience content is missing a Live Story id");
  }

  if (!content.type) {
    throw new Error("Amplience content is missing a Live Story type");
  }

  return {
    id,
    type: toSdkType(content.type),
    title:
      unwrapLocalizedString(content.title, LS_LANGUAGE) ||
      content._meta?.name ||
      "",
    coverImg: content.coverImg,
    sys: content._meta?.deliveryId
      ? { id: content._meta.deliveryId }
      : undefined,
  };
}

async function fetchLiveStorySsrHtml(
  contentType: LiveStoryContentApiType,
  contentId: string,
  storeCode: string,
  langCode: string,
): Promise<string> {
  const url = new URL(`${LIVE_STORY_CONTENT_API}/${contentType}/${contentId}`);
  url.searchParams.set("store_code", storeCode);
  url.searchParams.set("lang_code", langCode);

  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  // 202 = Live Story accepted the request but SSR HTML is not ready yet.
  if (response.status === 202) {
    return "";
  }

  if (!response.ok) {
    throw new Error(
      `Live Story SSR request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}

export async function fetchAmplienceLiveStoryEntry(
  contentUrl: string = AMPLIENCE_CONTENT_URL,
): Promise<LiveStoryEntry> {
  const response = await fetch(contentUrl, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(
      `Amplience request failed: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as AmplienceResponse;
  const entry = toLiveStoryEntry(payload.content);

  try {
    entry.ssr = await fetchLiveStorySsrHtml(
      toContentApiType(entry.type),
      entry.id,
      LS_STORE,
      LS_LANGUAGE,
    );
  } catch (error) {
    console.error("Failed to fetch Live Story SSR HTML", error);
  }

  return entry;
}
