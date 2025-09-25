## PWA

This app is installable as a PWA. We include a web app manifest (`public/manifest.json`) and register a service worker (`public/sw.js`).

- The layout injects `<link rel="manifest">` and `theme-color` meta.
- Use the `SiteBanner` component to surface an install button (uses `react-use-pwa-install`).

Example usage:

```jsx
import SiteBanner from "@/components/SiteBanner";

export default function Home() {
  return (
    <>
      <SiteBanner />
      {/* ...rest of page... */}
    </>
  );
}
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Blog (Markdown) Usage

Markdown posts live in `src/posts` as `*.md` files with a YAML frontmatter block:

```md
---
slug: example-post
locale: en
title: "My Example Post"
excerpt: "Short summary for listing pages"
coverImage: "/logo-with-name.png"
createdAt: 2025-09-25
updatedAt: 2025-09-25
published: true
tags: [nepali, panchang]
author: SriPatro Team
---

# My Example Post

Content goes here...
```

Routing:

- List: `/{locale}/blog` (pulls all posts matching `locale`)
- Detail: `/{locale}/blog/{slug}`

Utilities:

- `getAllPosts({ locale })` returns array of `{ meta, content }`.
- `getPostBySlug(slug)` returns a single parsed post.

Rendering:

- Listing page: `src/app/[locale]/blog/page.js`
- Post page: `src/app/[locale]/blog/[slug]/page.js` (uses `markdown-to-jsx`).

Add a new post:

1. Create `src/posts/<file>.md` with frontmatter including a unique `slug`.
2. Ensure `published: true` (omit or set false to hide).
3. Optional: add `tags` array for labeling.

Tables and inline code are automatically styled; customize overrides in the Markdown component if needed.

## RSS Feed

Generated at `/rss.xml` aggregating all published posts. Set `NEXT_PUBLIC_SITE_URL` in `.env.local` for absolute URLs.

```env
NEXT_PUBLIC_SITE_URL=https://example.com
```

Add autodiscovery tag in a layout head:

```html
<link
  rel="alternate"
  type="application/rss+xml"
  title="SriPatro Blog RSS"
  href="/rss.xml"
/>
```

## Newsletter (Double Opt-In)

Flow:

1. User submits email via `BlogSubscribeForm`.
2. `/api/blog/subscribe` issues `verifyToken` & `unsubscribeToken`, sends verification email.
3. User visits `/{locale}/blog/confirm/{token}` -> subscriber marked verified.
4. Weekly digest cron calls `POST /api/blog/send-weekly-digest` (Authorization Bearer `CRON_SECRET`).
5. Unsubscribe via one-click `GET /api/blog/unsubscribe?token=...` or POST with email.

Model fields: `email, locale, verified, verifyToken, verifyTokenExpires, unsubscribeToken, createdAt`.

Environment (example):

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_pass
EMAIL_FROM="SriPatro <no-reply@sripatro.com>"
CRON_SECRET=some-long-secret
```

Trigger weekly digest manually:

```bash
curl -X POST https://your-domain.com/api/blog/send-weekly-digest \
  -H "Authorization: Bearer $CRON_SECRET"
```

Unsubscribe link placed in emails: `/api/blog/unsubscribe?token=<unsubscribeToken>`.

Future ideas: rate limiting, locale-specific batches, HTML templates, analytics, bounce handling.
