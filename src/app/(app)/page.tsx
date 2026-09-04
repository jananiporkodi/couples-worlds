import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  getSettingsMap,
  getMemoryOfTheDay,
  getRandomFavoritePhoto,
  getRandomLoveJarEntry,
  getRandomOldNote,
  getStats,
  getThisDayEntries,
  getAutoCountdowns,
  getRecentlyCompletedBucketItems,
  getNextPlan,
  getActiveTodos,
} from "@/lib/data";
import { daysBetween, formatFriendlyDate } from "@/lib/dates";
import { getQuoteOfTheDay } from "@/lib/quotes";
import { getAffirmationOfTheDay } from "@/lib/affirmations";
import { BUCKET_CATEGORIES } from "@/lib/types";
import { PARTNER_COOKIE_NAME, isValidPartnerId } from "@/lib/auth";
import HomeReveal from "@/components/home/HomeReveal";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    settings,
    memoryOfDay,
    favoritePhoto,
    loveJarEntry,
    randomNote,
    stats,
    thisDay,
    recentlyCompleted,
    nextPlan,
    activeTodos,
  ] = await Promise.all([
    getSettingsMap(),
    getMemoryOfTheDay(),
    getRandomFavoritePhoto(),
    getRandomLoveJarEntry(),
    getRandomOldNote(),
    getStats(),
    getThisDayEntries(),
    getRecentlyCompletedBucketItems(3),
    getNextPlan(),
    getActiveTodos(4),
  ]);

  const upcomingCountdown = getAutoCountdowns(settings)[0] ?? null;

  const startDate = (settings.relationship_start_date as string) || null;
  const days = startDate ? daysBetween(startDate) : null;
  const quote = getQuoteOfTheDay();
  const photo = memoryOfDay?.photos?.[0] || favoritePhoto?.url || null;
  const photoCaption = memoryOfDay?.title || memoryOfDay?.story || favoritePhoto?.caption || "a favorite of ours";

  const currentPartnerRaw = cookies().get(PARTNER_COOKIE_NAME)?.value;
  const currentPartner = isValidPartnerId(currentPartnerRaw) ? currentPartnerRaw : null;
  const partnerAName = (settings.partner_a_name as string) || null;
  const partnerBName = (settings.partner_b_name as string) || null;
  const myName = currentPartner === "partner_a" ? partnerAName : currentPartner === "partner_b" ? partnerBName : null;
  const otherName = currentPartner === "partner_a" ? partnerBName : currentPartner === "partner_b" ? partnerAName : null;
  const greeting = myName ? `Welcome back, ${myName} ❤️` : "Welcome home ❤️";
  const affirmation = getAffirmationOfTheDay(myName, otherName);

  return (
    <HomeReveal>
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">{greeting}</p>
      <p className="text-sm text-ink-soft mb-1">
        {days !== null ? `day ${days.toLocaleString()} together, and counting` : "add your start date in settings to see your day count"}
      </p>
      <p className="text-xs text-ink-soft italic mb-4">{affirmation}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {days !== null && <span className="chip bg-peach text-accent">💕 {days.toLocaleString()} days</span>}
        {upcomingCountdown && (
          <span className="chip bg-lavender text-ink">
            {upcomingCountdown.emoji ?? "⏳"} {upcomingCountdown.title}
            {" · "}
            {upcomingCountdown.daysRemaining > 0
              ? `${upcomingCountdown.daysRemaining}d`
              : upcomingCountdown.daysRemaining === 0
              ? "today!"
              : `${Math.abs(upcomingCountdown.daysRemaining)}d ago`}
          </span>
        )}
        {stats.placesCount > 0 && (
          <Link href="/places" className="chip bg-sage text-ink">
            📍 {stats.placesCount} {stats.placesCount === 1 ? "place" : "places"} visited
          </Link>
        )}
        {nextPlan && (
          <Link href="/plans" className="chip bg-blush text-accent">
            🗓 {nextPlan.title}
          </Link>
        )}
      </div>

      {thisDay.length > 0 && (
        <div className="card-panel p-5 mb-6 border-l-4 border-accent/50">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-3">On this day 🌙</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {thisDay.map((entry) => (
              <div key={`${entry.kind}-${entry.id}`} className="flex items-center gap-3">
                {entry.photo && (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={entry.photo} alt={entry.title} fill sizes="56px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink truncate">{entry.title}</p>
                  <p className="text-[11px] text-ink-soft">
                    {entry.yearsAgo} {entry.yearsAgo === 1 ? "year" : "years"} ago today
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <div className="card-panel p-5 md:col-span-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-3">Memory of the day</p>
          {photo ? (
            <div className="polaroid mx-auto w-44 -rotate-2">
              <div className="relative w-full h-36 rounded overflow-hidden">
                <Image src={photo} alt={photoCaption} fill sizes="176px" className="object-cover" />
              </div>
              <p className="font-hand text-center text-lg mt-1.5">{photoCaption}</p>
            </div>
          ) : (
            <p className="text-sm text-ink-soft">
              Once you upload some photos, a random favorite will show up here every day.
            </p>
          )}
          <Link href="/memories" className="btn-ghost mt-4 w-full justify-center text-xs">
            see all memories
          </Link>
        </div>

        <div className="card-panel p-5 md:col-span-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-3">Today&apos;s quote</p>
          <p className="text-sm italic text-ink-soft leading-relaxed">&ldquo;{quote}&rdquo;</p>

          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mt-6 mb-2">A note from the past</p>
          {randomNote ? (
            <p className="text-sm text-ink-soft italic">&ldquo;{randomNote.body}&rdquo;</p>
          ) : loveJarEntry ? (
            <p className="text-sm text-ink-soft italic">&ldquo;{loveJarEntry.body}&rdquo;</p>
          ) : (
            <p className="text-sm text-ink-soft">Write your first note, or add a tiny moment on the Us page.</p>
          )}
        </div>

        <div className="card-panel p-5 md:col-span-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-3">Us, in numbers</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-dashed border-black/10 dark:border-white/10 pb-2">
              <dt className="text-ink-soft">Bucket list done</dt>
              <dd className="font-bold">{stats.bucketCompleted} / {stats.bucketTotal}</dd>
            </div>
            <div className="flex justify-between border-b border-dashed border-black/10 dark:border-white/10 pb-2">
              <dt className="text-ink-soft">Memories saved</dt>
              <dd className="font-bold">{stats.memoriesCount}</dd>
            </div>
            <div className="flex justify-between border-b border-dashed border-black/10 dark:border-white/10 pb-2">
              <dt className="text-ink-soft">Photos uploaded</dt>
              <dd className="font-bold">{stats.photosCount}</dd>
            </div>
            <div className="flex justify-between border-b border-dashed border-black/10 dark:border-white/10 pb-2">
              <dt className="text-ink-soft">Places visited</dt>
              <dd className="font-bold">{stats.placesCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Notes written</dt>
              <dd className="font-bold">{stats.notesCount}</dd>
            </div>
          </dl>
          <Link href="/us" className="btn-ghost mt-4 w-full justify-center text-xs">
            see full dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 mt-5">
        <div className="card-panel p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-3">Things to do ☑</p>
          {activeTodos.length === 0 ? (
            <p className="text-sm text-ink-soft">Nothing on the list right now.</p>
          ) : (
            <ul className="space-y-1.5">
              {activeTodos.map((t) => (
                <li key={t.id} className="text-sm text-ink flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-ink/30 flex-shrink-0" />
                  <span className="truncate">{t.title}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/todos" className="btn-ghost mt-4 w-full justify-center text-xs">
            view all
          </Link>
        </div>

        {recentlyCompleted.length > 0 && (
          <div className="card-panel p-5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-3">Recently completed 🎉</p>
            <div className="grid gap-2">
              {recentlyCompleted.map((item) => {
                const categoryMeta = BUCKET_CATEGORIES.find((c) => c.key === item.category);
                return (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-xl">{categoryMeta?.emoji ?? "✏️"}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink truncate">{item.title}</p>
                      {item.completed_at && (
                        <p className="text-[11px] text-ink-soft">{formatFriendlyDate(item.completed_at.slice(0, 10))}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Link href="/bucket-list" className="btn-ghost mt-3 w-full justify-center text-xs">
              see the whole list
            </Link>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link href="/bucket-list" className="card-panel p-4 flex items-center gap-3 hover:-translate-y-0.5 transition">
          <span className="text-2xl">🪣</span>
          <div>
            <p className="font-bold text-sm">Add to the bucket list</p>
            <p className="text-xs text-ink-soft">plan your next adventure together</p>
          </div>
        </Link>
        <Link href="/notes" className="card-panel p-4 flex items-center gap-3 hover:-translate-y-0.5 transition">
          <span className="text-2xl">💌</span>
          <div>
            <p className="font-bold text-sm">Write a note</p>
            <p className="text-xs text-ink-soft">tell them something small and true</p>
          </div>
        </Link>
      </div>
    </HomeReveal>
  );
}
