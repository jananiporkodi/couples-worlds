import Image from "next/image";
import Link from "@/components/AppLink";
import { cookies } from "next/headers";
import {
  getSettingsMap,
  getMemoryOfTheDay,
  getRandomFavoritePhoto,
  getRandomOldNote,
  getStats,
  getThisDayEntries,
  getAutoCountdowns,
  getRecentlyCompletedBucketItems,
  getNextPlan,
  getActiveTodos,
  getTodaysMoods,
  getWeeklyRecap,
  getPartnerNames,
} from "@/lib/data";
import { daysBetween, dayOfYearIndex, formatFriendlyDate, toISTDateStr } from "@/lib/dates";
import { getQuoteOfTheDay } from "@/lib/quotes";
import { getAffirmationOfTheDay } from "@/lib/affirmations";
import { BUCKET_CATEGORIES } from "@/lib/types";
import { PARTNER_COOKIE_NAME, isValidPartnerId } from "@/lib/auth";
import HomeReveal from "@/components/home/HomeReveal";
import MoodCheckIn from "@/components/home/MoodCheckIn";
import MilestoneCelebration from "@/components/home/MilestoneCelebration";
import SurpriseButton from "@/components/home/SurpriseButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    settings,
    memoryOfDay,
    favoritePhoto,
    randomNote,
    stats,
    thisDay,
    recentlyCompleted,
    nextPlan,
    activeTodos,
    todayMoods,
    partnerNames,
  ] = await Promise.all([
    getSettingsMap(),
    getMemoryOfTheDay(),
    getRandomFavoritePhoto(),
    getRandomOldNote(),
    getStats(),
    getThisDayEntries(),
    getRecentlyCompletedBucketItems(3),
    getNextPlan(),
    getActiveTodos(4),
    getTodaysMoods(),
    getPartnerNames(),
  ]);

  const istWeekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Asia/Kolkata" }).format(new Date());
  const isFriday = istWeekday === "Friday";
  const weeklyRecap = isFriday ? await getWeeklyRecap(7) : [];

  const autoCountdowns = getAutoCountdowns(settings);
  const upcomingCountdown = autoCountdowns[0] ?? null;
  const missingBirthdays = !settings.partner_a_birthday || !settings.partner_b_birthday;

  const facts = [
    stats.bucketTotal > 0
      ? `you've completed ${stats.bucketCompleted} of ${stats.bucketTotal} bucket list items 🪣`
      : "add your first bucket list item to start tracking progress 🪣",
    `you've saved ${stats.photosCount} photos together so far 📸`,
    `you've written ${stats.notesCount} little notes to each other 💌`,
    stats.countriesCount > 0
      ? `you've made memories in ${stats.countriesCount} countries so far 🌍`
      : "tag a memory with a country to start tracking your travels 🌍",
  ];
  const dailyFact = facts[dayOfYearIndex(facts.length)];

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
      <MilestoneCelebration days={days} />
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">{greeting}</p>
      <p className="text-sm text-ink-soft mb-1">
        {days !== null ? `day ${days.toLocaleString()} together, and counting` : "add your start date in settings to see your day count"}
      </p>
      <p className="text-xs text-ink-soft italic mb-4">{affirmation}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {days !== null && <span className="chip bg-peach text-accent">💕 {days.toLocaleString()} days</span>}
        {upcomingCountdown && (
          <span className="chip bg-lavender text-bezel">
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
          <Link href="/places" className="chip bg-sage text-bezel">
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
          ) : (
            <p className="text-sm text-ink-soft">Write your first note in the Love Jar.</p>
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
        </div>
      </div>

      <div className="mt-5">
        <MoodCheckIn names={partnerNames} todayMoods={todayMoods} currentPartner={currentPartner} />
      </div>

      {isFriday && weeklyRecap.length > 0 && (
        <div className="card-panel p-5 mt-5 border-l-4 border-accent/50">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-3">This week in us 🗞️</p>
          <ul className="space-y-1.5">
            {weeklyRecap.slice(0, 8).map((item, i) => (
              <li key={i} className="text-sm flex items-center gap-2">
                <span>{item.kind === "memory" ? "📸" : item.kind === "note" ? "💌" : "🖼"}</span>
                <span className="truncate">{item.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card-panel p-4 mt-5">
        <p className="text-xs italic text-ink-soft">
          <span className="font-bold not-italic text-ink">Did you know? </span>
          {dailyFact}
        </p>
      </div>

      <div className="card-panel p-5 mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-3">Countdowns ⏳</p>
        <ul className="space-y-2">
          {autoCountdowns.length === 0 && (
            <li className="text-sm text-ink-soft">
              Add your relationship start date and birthdays in{" "}
              <Link href="/settings" className="text-accent underline">
                Settings
              </Link>{" "}
              to see countdowns here.
            </li>
          )}
          {autoCountdowns.map((c) => (
            <li key={c.key} className="flex justify-between text-sm">
              <span>
                {c.emoji} {c.title}
              </span>
              <span className="font-bold text-ink-soft">{c.daysRemaining === 0 ? "today!" : `${c.daysRemaining}d`}</span>
            </li>
          ))}
        </ul>
        {missingBirthdays && autoCountdowns.length > 0 && (
          <p className="text-[11px] text-ink-soft mt-2">
            Add both birthdays in{" "}
            <Link href="/settings" className="text-accent underline">
              Settings
            </Link>{" "}
            to see them here too.
          </p>
        )}
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
                        <p className="text-[11px] text-ink-soft">{formatFriendlyDate(toISTDateStr(item.completed_at))}</p>
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
          <span className="text-2xl">🫙</span>
          <div>
            <p className="font-bold text-sm">Write a note</p>
            <p className="text-xs text-ink-soft">tell them something small and true</p>
          </div>
        </Link>
        <Link href="/expenses" className="card-panel p-4 flex items-center gap-3 hover:-translate-y-0.5 transition">
          <span className="text-2xl">💰</span>
          <div>
            <p className="font-bold text-sm">Log an expense</p>
            <p className="text-xs text-ink-soft">keep track of what you&apos;ve spent together</p>
          </div>
        </Link>
        <SurpriseButton />
      </div>
    </HomeReveal>
  );
}
