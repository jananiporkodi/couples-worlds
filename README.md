# Our Little World

A private, warm little scrapbook app for two — bucket list, memories, notes,
gallery, timeline, and a shared "Us" dashboard. Built with Next.js 14 (App
Router), TypeScript, Tailwind CSS, Framer Motion, and Supabase.

No accounts, no usernames — just one shared passcode that unlocks the whole
app for 30 days at a time.

## 1. Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — you'll land on the lock screen.

This project already ships with a **live Supabase project** wired up in
`.env.local` (URL + anon key), so `npm run dev` works immediately with real
data. The passcode is currently `ourworld` — **change it** before sharing the
app:

```
# .env.local
APP_PASSCODE=pick-something-only-the-two-of-you-know
```

If you ever want to point the app at a different Supabase project instead,
copy `.env.local.example` to `.env.local` and fill in your own project's URL
and anon key (Project Settings → API in Supabase Studio), then apply the SQL
files in `supabase/migrations/` in order (via the SQL Editor, or the
Supabase CLI: `supabase db push`).

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

All tables live in `supabase/migrations/0001_init_schema.sql`:
`bucket_items`, `memories`, `gallery`, `notes`, `timeline_events`, `moods`,
`daily_questions`, `love_jar`, `playlists`, `countdowns`, `wishlist`, and
`settings`. Row Level Security is enabled on every table (see
`0002_rls_policies.sql`).

**Security note:** the Supabase anon key in `.env.local` is intentionally
*not* prefixed with `NEXT_PUBLIC_`. It's only ever read in server-side code
(`src/lib/supabase/server.ts`, imported by Server Components and Server
Actions), so it never ships to the browser bundle. That's what makes the
permissive RLS policies (`using (true)`) safe here — combine this with the
passcode gate and nobody can reach your data without both the app URL *and*
the passcode. Don't add a `NEXT_PUBLIC_SUPABASE_*` variable without also
tightening the RLS policies.

File uploads (bucket-list completion photos, memory photos, timeline photos)
go through Server Actions too (`src/lib/storage.ts`), which upload straight
to Supabase Storage server-side — so the browser never touches Supabase
credentials directly.

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

**Where to upload your reference photos:** open your Supabase project →
Storage → the `reference-photos` bucket (already created by the migrations)
and upload the two of you there. Use those photo URLs as image references
when you call whichever image-generation API you choose, so illustrations
stay visually consistent with "you."

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
    supabase/server.ts   server-only Supabase client
    data.ts              read queries
    storage.ts           server-side file uploads
    auth.ts               passcode/session helpers
    illustration.ts       prompt builder
    quotes.ts, dates.ts   small helpers
supabase/migrations/      SQL schema, RLS, storage buckets, seed data
```

## 6. Deploying to Vercel

1. Push this project to a GitHub repo (private, since it's just for you two).
2. Import it in Vercel.
3. Add environment variables in Vercel project settings:
   - `APP_PASSCODE`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Deploy. The same Supabase project can be used in both local dev and
   production — or create a separate one for production if you'd rather keep
   them isolated (repeat the steps in `supabase/migrations/` on the new
   project).

## 7. What's fully wired vs. scaffolded

Fully working end-to-end (Server Actions + Supabase + UI): lock screen,
Home, Bucket List (add / filter / complete-with-photo-and-note), Memories
(add + react), Notes, Gallery (tabs + masonry + lightbox), Timeline, and the
Us dashboard (stats, countdowns, love jar, mood tracker, wishlist, playlist
embeds).

Schema-ready but with lighter UI: `daily_questions` (table + prompt picker
in `src/lib/quotes.ts` exist; answering UI isn't built yet — a good first
thing to extend). Weather on Home is a static placeholder chip; swap in a
real weather API call whenever you're ready.

Have fun building this out together — it's meant to keep growing.
