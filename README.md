# Amplience × Live Story (Next.js example)

Example [Next.js](https://nextjs.org) App Router app that:

1. Fetches a Live Story entry from an **Amplience content item** (Delivery API)
2. Loads SSR HTML from the Live Story Content API (`/content/layout` or `/content/destination`)
3. Renders and hydrates it with the **[`ls-client-sdk`](https://www.npmjs.com/package/ls-client-sdk)** npm package (`LiveStory` from `ls-client-sdk/client`)

Amplience holds the content item (`id`, `type`, title). This app does **not** use the Amplience `ssc` field for HTML. SSR comes from [Live Story enhanced client-side integration](https://livestory.io/documentation/articles/enhanced-client-side-integration):

```
GET https://api.livestory.io/content/{layout|destination}/{id}?store_code=…&lang_code=…
```

`wall` / `layout` map to `/content/layout`. `destination` / `wallgroup` map to `/content/destination`. The SDK still receives `type: "wall"` or `"wallgroup"`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it is wired

| File | Role |
|---|---|
| `src/lib/amplience.ts` | Fetch Amplience item + Live Story SSR HTML |
| `src/app/page.tsx` | Server Component: load entry, pass it to the client |
| `src/components/LiveStoryClient.tsx` | Client Component wrapping `<LiveStory />` |
| `src/app/layout.tsx` | jQuery 3.6.0 + brand Live Story script (`window.LiveStory`) |

Default Amplience item:

`https://livestorydemo.cdn.content.amplience.net/content/id/fc2bf7a2-0571-4cc4-a837-b90c8e18523c?depth=all&format=inlined`

## Optional env

| Variable | Default |
|---|---|
| `AMPLIENCE_CONTENT_URL` | The Amplience content URL above |
| `NEXT_PUBLIC_LS_LANGUAGE` | `en_US` |
| `NEXT_PUBLIC_LS_STORE` | `default` |
| `NEXT_PUBLIC_LS_SCRIPT_SRC` | `https://assets.livestory.io/dist/livestory-demo.min.js` |

Replace `NEXT_PUBLIC_LS_SCRIPT_SRC` with the brand script, e.g. `https://assets.livestory.io/dist/livestory-brand.min.js`.

If Live Story returns **202**, SSR HTML is not ready yet; the client SDK still hydrates the wall. When SSR is published, the same request returns **200** and HTML is injected into `entry.ssr`.
