# Couples Worlds

A multi-tenant version of "Our Little World" — the private, warm little
scrapbook app for two (bucket list, memories, notes, gallery, timeline, and
a shared "Us" dashboard) — rebuilt to host many independent couples
("worlds") from one shared codebase and one shared database. Built with
Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Neon
(Postgres), and Vercel Blob for file storage.

No accounts, no usernames — just one shared passcode per world that unlocks
that world for 30 days at a time.

## 1. Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — you'll land on the lock screen.

This project ships with a **live Neon database** wired up in `.env.local`
(`DATABASE_URL`), so `npm run dev` works immediately with real data. The
passcode is currently `change-me` — **change it** before sharing the app:

```
# .env.local
APP_PASSCODE=pick-something-only-the-two-of-you-know
```

If you ever want to point the app at a different Neon project instead, copy
`.env.local.example` to `.env.local` and fill in your own project's pooled
connection string (Neon console → your project → Connect), then re-apply the
schema (see `db/` or ask Claude — it was applied directly via SQL when this
project was set up, not checked in as migration files yet).

For file uploads (photos/videos), create a Blob store in the Vercel
dashboard (Project → Storage → Create Database → Blob) and connect it to
this project — Vercel injects `BLOB_READ_WRITE_TOKEN` automatically for
deployed environments. For local dev, run `vercel env pull .env.local`
after connecting it, or paste the token into `.env.local` yourself.

## 2. How the passcode gate works

- `src/middleware.ts` checks for a session cookie on every request. If it's
  missing, you're redirected to `/lock`.
- `src/app/lock/actions.ts` is a Server Action that compares the submitted
  passcode to `APP_PASSCODE` and, if correct, sets an httpOnly cookie that's
  valid for 30 days.
- There are no user accounts, sessions table, or third-party auth — just
  that one shared secret, matching the brief.
- "Lock this world" in the sidebar clears the cookie via `/api/logout`.

## 3. Data model

Tables: `bucket_items`, `memories`, `gallery`, `notes`, `timeline_events`,
`moods`, `daily_questions`, `love_jar`, `playlists`, `countdowns`,
`wishlist`, `settings`, and `plans`, plus a new `worlds` table (one row per
couple: name, slug, status, theme, partner names/birthdays/emails, access
code). Every content table carries a `world_id` column so each couple's
data is fully isolated — every query must filter by it.

**Security note:** access control lives entirely at the app layer (the
passcode gate in `src/middleware.ts`), not in the database — there's no
Postgres Row Level Security keyed off a logged-in user, since there's no
per-user login at all, just one shared code per world. Don't expose the
`DATABASE_URL` to the browser bundle; it's only ever read in server-side
code (`src/lib/supabase/server.ts` — the name is a holdover from the
original Supabase build, see below — imported by Server Components and
Server Actions).

File uploads (bucket-list completion photos, memory photos, timeline
photos) go through Server Actions too (`src/lib/storage.ts`), which upload
straight to Vercel Blob server-side — so the browser never touches storage
credentials directly.

**Migration note:** this project started as a straight copy of "Our Little
World," which ran on Supabase. `src/lib/supabase/server.ts` is now a small
compatibility shim that implements the same `.from(table)...` /
`.storage.from(bucket)...` API the rest of the app already used, but backed
by a real Postgres connection (Neon, via `@neondatabase/serverless`) and
Vercel Blob instead. Every other file in the app — `src/lib/data.ts` and all
the `actions.ts` files — is unchanged from the original. Renaming that file
out of the `supabase/` folder is a nice future cleanup, not a functional
requirement.

## 4. Illustration generation

Every bucket list item gets an auto-built prompt (`src/lib/illustration.ts`)
in the app's warm, Ghibli/Tangled-inspired style, e.g.:

> "A cute Studio Ghibli-inspired illustration of the same couple shown in
> the two reference photos... camping beside a lake with fairy lights..."

Click the 🎨 icon on a bucket list card to see the prompt and copy it.
**Actually generating the image is a plug-in point** — this starter doesn't
call a paid image API for you, so you choose your own (OpenAI Images,
Stability, Replicate, fal.ai, Midjourney, etc.) and wire it into
`buildIllustrationPrompt`'s caller in
`src/app/(app)/bucket-list/actions.ts`. Once you have a generated image URL,
paste it into the small form under the prompt and it's saved to
`bucket_items.illustration_url` — no code changes needed for that part.

**Where to upload your reference photos:** once the Blob store is
connected, reference photos uploaded through the app land in the
`reference-photos` "bucket" (a path prefix within your Blob store — see
`src/lib/storage.ts`). Use those photo URLs as image references when you
call whichever image-generation API you choose, so illustrations stay
visually consistent with "you."

## 5. Project structure

```
src/
  app/
    lock/               passcode screen (public)
    (app)/               everything behind the passcode gate
      page.tsx            Home
      bucket-list/
      memories/
      notes/
      gallery/
      timeline/
      us/
  components/            UI, grouped by feature
  lib/
    supabase/server.ts   Neon + Vercel Blob compatibility shim (see §3)
    data.ts              read queries
    storage.ts           server-side file uploads
    auth.ts               passcode/session helpers
    illustration.ts       prompt builder
    quotes.ts, dates.ts   small helpers
```

## 6. Deploying to Vercel

1. Push this project to a GitHub repo (already done — see `jananiporkodi/couples-worlds`).
2. Import it in Vercel (already done, connected via git integration).
3. Environment variables in Vercel project settings:
   - `APP_PASSCODE`
   - `DATABASE_URL` (Neon pooled connection string)
   - `BLOB_READ_WRITE_TOKEN` (auto-added once a Blob store is connected)
4. Deploy. Since this is the multi-tenant version, one Neon project serves
   every couple ("world") — new couples are just new rows, not new
   infrastructure.

## 7. What's fully wired vs. scaffolded

Fully working end-to-end (Server Actions + Neon + UI): lock screen, Home,
Bucket List (add / filter / complete-with-photo-and-note), Memories (add +
react), Notes, Gallery (tabs + masonry + lightbox), Timeline, and the Us
dashboard (stats, countdowns, love jar, mood tracker, wishlist, playlist
embeds).

Schema-ready but with lighter UI: `daily_questions` (table + prompt picker
in `src/lib/quotes.ts` exist; answering UI isn't built yet — a good first
thing to extend). Weather on Home is a static placeholder chip; swap in a
real weather API call whenever you're ready.

**Not yet built:** the actual multi-tenant plumbing — routing under
`/w/{world-slug}/...`, the public landing page + self-serve onboarding
wizard, and the `/admin` area. Right now this behaves like a single-world
app pointed at the new schema; see the project plan doc for the phased
build-out.

Have fun building this out together — it's meant to keep growing.
