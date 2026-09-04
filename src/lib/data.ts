import "server-only";
import { getSupabaseServerClient } from "./supabase/server";
import { dayOfYearIndex, daysUntil, nextAnniversary, ordinal } from "./dates";
import type {
  BucketItem,
  Memory,
  GalleryMedia,
  Note,
  TimelineEvent,
  LoveJarEntry,
  Setting,
  Countdown,
  Plan,
  Todo,
  Place,
} from "./types";

export async function getSettingsMap(): Promise<Record<string, unknown>> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) throw error;
  const map: Record<string, unknown> = {};
  for (const row of (data as Setting[]) ?? []) {
    map[row.key] = row.value;
  }
  return map;
}

export async function getBucketItems(): Promise<BucketItem[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bucket_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as BucketItem[];
}

export async function getRecentlyCompletedBucketItems(limit = 3): Promise<BucketItem[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bucket_items")
    .select("*")
    .eq("status", "done")
    .order("completed_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as BucketItem[];
}

export async function getMemories(): Promise<Memory[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .order("memory_date", { ascending: false });
  if (error) throw error;
  return data as Memory[];
}

export async function getMemoryOfTheDay(): Promise<Memory | null> {
  const memories = await getMemories();
  if (memories.length === 0) return null;
  const idx = dayOfYearIndex(memories.length);
  return memories[idx];
}

export async function getGalleryMedia(): Promise<GalleryMedia[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as GalleryMedia[];
}

export async function getRandomFavoritePhoto(): Promise<GalleryMedia | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .eq("is_favorite", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data as GalleryMedia[];
  if (!rows || rows.length === 0) return null;
  return rows[dayOfYearIndex(rows.length)];
}

export async function getNotes(): Promise<Note[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Note[];
}

export async function getRandomOldNote(): Promise<Note | null> {
  const notes = await getNotes();
  if (notes.length === 0) return null;
  return notes[dayOfYearIndex(notes.length)];
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .order("event_date", { ascending: true });
  if (error) throw error;
  return data as TimelineEvent[];
}

export async function getLoveJarEntries(): Promise<LoveJarEntry[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("love_jar")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as LoveJarEntry[];
}

export async function getRandomLoveJarEntry(): Promise<LoveJarEntry | null> {
  const entries = await getLoveJarEntries();
  if (entries.length === 0) return null;
  return entries[dayOfYearIndex(entries.length)];
}

export async function getCountdowns(): Promise<Countdown[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("countdowns")
    .select("*")
    .order("target_date", { ascending: true });
  if (error) throw error;
  return data as Countdown[];
}

export interface AutoCountdown {
  key: string;
  emoji: string;
  title: string;
  daysRemaining: number;
}

/**
 * Auto-computed countdowns to the next anniversary and each partner's next birthday, derived entirely
 * from Settings (no manual entry needed). Replaces the old manual countdowns list. Sorted soonest-first.
 */
export function getAutoCountdowns(settings: Record<string, unknown>): AutoCountdown[] {
  const items: AutoCountdown[] = [];
  const partnerAName = (settings.partner_a_name as string) || "Partner A";
  const partnerBName = (settings.partner_b_name as string) || "Partner B";

  const anniversarySource = (settings.anniversary_date as string) || (settings.relationship_start_date as string);
  if (anniversarySource) {
    const { daysRemaining, occurrence } = nextAnniversary(anniversarySource);
    items.push({
      key: "anniversary",
      emoji: "💍",
      title: occurrence > 0 ? `${ordinal(occurrence)} anniversary` : "anniversary",
      daysRemaining,
    });
  }

  const partnerABirthday = settings.partner_a_birthday as string | undefined;
  if (partnerABirthday) {
    const { daysRemaining, occurrence } = nextAnniversary(partnerABirthday);
    items.push({ key: "birthday_a", emoji: "🎂", title: `${partnerAName} turns ${occurrence}`, daysRemaining });
  }

  const partnerBBirthday = settings.partner_b_birthday as string | undefined;
  if (partnerBBirthday) {
    const { daysRemaining, occurrence } = nextAnniversary(partnerBBirthday);
    items.push({ key: "birthday_b", emoji: "🎂", title: `${partnerBName} turns ${occurrence}`, daysRemaining });
  }

  return items.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export type { ActivityItem } from "./activity-meta";
export { activityMeta } from "./activity-meta";
import type { ActivityItem } from "./activity-meta";

/** Latest activity across memories, plans, bucket list, and notes - powers the notifications bell. Best-effort: a failed sub-query just yields fewer items rather than breaking the whole feed. */
export async function getRecentActivity(limit = 5): Promise<ActivityItem[]> {
  const supabase = getSupabaseServerClient();

  const [memoriesRes, plansRes, bucketRes, notesRes] = await Promise.all([
    supabase.from("memories").select("id,title,created_at").order("created_at", { ascending: false }).limit(limit),
    supabase.from("plans").select("id,title,created_at").order("created_at", { ascending: false }).limit(limit),
    supabase.from("bucket_items").select("id,title,created_at").order("created_at", { ascending: false }).limit(limit),
    supabase.from("notes").select("id,body,created_at").order("created_at", { ascending: false }).limit(limit),
  ]);

  const items: ActivityItem[] = [];
  for (const m of memoriesRes.data ?? []) {
    items.push({ id: `memory-${m.id}`, kind: "memory", title: m.title || "A new memory", createdAt: m.created_at, href: `/memories?open=${m.id}` });
  }
  for (const p of plansRes.data ?? []) {
    items.push({ id: `plan-${p.id}`, kind: "plan", title: p.title, createdAt: p.created_at, href: "/plans" });
  }
  for (const b of bucketRes.data ?? []) {
    items.push({ id: `bucket-${b.id}`, kind: "bucket", title: b.title, createdAt: b.created_at, href: "/bucket-list" });
  }
  for (const n of notesRes.data ?? []) {
    items.push({ id: `note-${n.id}`, kind: "note", title: n.body.slice(0, 60), createdAt: n.created_at, href: "/notes" });
  }

  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return items.slice(0, limit);
}

/** The single most relevant countdown to surface on the home page: nearest upcoming one, or the most recently passed if none are upcoming. */
export async function getUpcomingCountdown(): Promise<(Countdown & { daysRemaining: number }) | null> {
  const countdowns = await getCountdowns();
  if (!countdowns || countdowns.length === 0) return null;

  const withDays = countdowns.map((c) => ({ ...c, daysRemaining: daysUntil(c.target_date) }));
  const upcoming = withDays.filter((c) => c.daysRemaining >= 0).sort((a, b) => a.daysRemaining - b.daysRemaining);
  if (upcoming.length > 0) return upcoming[0];

  return withDays.sort((a, b) => b.daysRemaining - a.daysRemaining)[0];
}

export interface ThisDayEntry {
  id: string;
  kind: "memory" | "timeline";
  title: string;
  photo: string | null;
  yearsAgo: number;
  dateStr: string;
}

/** Memories and timeline events that happened on this same month/day in a previous year — the home page's "on this day" flagship card. */
export async function getThisDayEntries(referenceDate: Date = new Date()): Promise<ThisDayEntry[]> {
  const supabase = getSupabaseServerClient();
  const month = referenceDate.getUTCMonth() + 1;
  const day = referenceDate.getUTCDate();
  const currentYear = referenceDate.getUTCFullYear();

  const [memoriesRes, timelineRes] = await Promise.all([
    supabase.from("memories").select("id, title, story, memory_date, photos"),
    supabase.from("timeline_events").select("id, title, event_date, photos"),
  ]);
  if (memoriesRes.error) throw memoriesRes.error;
  if (timelineRes.error) throw timelineRes.error;

  const entries: ThisDayEntry[] = [];

  for (const m of (memoriesRes.data ?? []) as {
    id: string;
    title: string | null;
    story: string | null;
    memory_date: string;
    photos: string[] | null;
  }[]) {
    const [y, mo, d] = m.memory_date.split("-").map(Number);
    if (mo === month && d === day && y < currentYear) {
      entries.push({
        id: m.id,
        kind: "memory",
        title: m.title || m.story || "a memory",
        photo: m.photos?.[0] ?? null,
        yearsAgo: currentYear - y,
        dateStr: m.memory_date,
      });
    }
  }

  for (const t of (timelineRes.data ?? []) as {
    id: string;
    title: string;
    event_date: string;
    photos: string[] | null;
  }[]) {
    const [y, mo, d] = t.event_date.split("-").map(Number);
    if (mo === month && d === day && y < currentYear) {
      entries.push({
        id: t.id,
        kind: "timeline",
        title: t.title,
        photo: t.photos?.[0] ?? null,
        yearsAgo: currentYear - y,
        dateStr: t.event_date,
      });
    }
  }

  entries.sort((a, b) => a.yearsAgo - b.yearsAgo);
  return entries;
}

export async function getPlans(): Promise<Plan[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("plan_date", { ascending: true });
  if (error) throw error;
  return data as Plan[];
}

/** Nearest upcoming plan, for surfacing on the home page. */
export async function getNextPlan(): Promise<Plan | null> {
  const plans = await getPlans();
  const upcoming = plans
    .filter((p) => p.status === "planned" && !p.memory_id && daysUntil(p.plan_date) >= 0)
    .sort((a, b) => (a.plan_date < b.plan_date ? -1 : 1));
  return upcoming.length > 0 ? upcoming[0] : null;
}

export async function getStats() {
  const supabase = getSupabaseServerClient();
  const [bucket, memories, gallery, notes, places] = await Promise.all([
    supabase.from("bucket_items").select("id, status", { count: "exact" }),
    supabase.from("memories").select("id, tags", { count: "exact" }),
    supabase.from("gallery").select("id", { count: "exact" }),
    supabase.from("notes").select("id", { count: "exact" }),
    supabase.from("places").select("id", { count: "exact" }),
  ]);

  const bucketRows = (bucket.data ?? []) as { status: string }[];
  const completed = bucketRows.filter((b) => b.status === "done").length;

  const memoryRows = (memories.data ?? []) as { tags: string[] }[];
  const countries = new Set<string>();
  for (const m of memoryRows) {
    for (const t of m.tags ?? []) {
      if (t.startsWith("country:")) countries.add(t.slice(8));
    }
  }

  return {
    bucketTotal: bucketRows.length,
    bucketCompleted: completed,
    memoriesCount: memories.count ?? memoryRows.length,
    photosCount: gallery.count ?? 0,
    notesCount: notes.count ?? 0,
    countriesCount: countries.size,
    placesCount: places.count ?? 0,
  };
}

export async function getPartnerNames(): Promise<{ a: string; b: string }> {
  const settings = await getSettingsMap();
  return {
    a: (settings.partner_a_name as string) || "Partner A",
    b: (settings.partner_b_name as string) || "Partner B",
  };
}

export async function getTodos(): Promise<Todo[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("status", { ascending: true })
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Todo[];
}

export async function getActiveTodos(limit = 4): Promise<Todo[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("status", "active")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Todo[];
}

export async function getPlaces(): Promise<Place[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("places").select("*").order("name", { ascending: true });
  if (error) throw error;
  return data as Place[];
}

export interface TimelineFeedItem {
  id: string;
  kind: "memory" | "milestone";
  title: string;
  description: string | null;
  date: string;
  photo: string | null;
  mood: string | null;
}

/** The relationship's full chronological history: manual milestones plus every Memory (which already captures completed bucket-list items and converted calendar plans, so those aren't listed a second time). */
export async function getTimelineFeed(): Promise<TimelineFeedItem[]> {
  const [events, memories] = await Promise.all([getTimelineEvents(), getMemories()]);

  const feed: TimelineFeedItem[] = [];

  for (const e of events) {
    feed.push({
      id: `milestone-${e.id}`,
      kind: "milestone",
      title: e.title,
      description: e.description,
      date: e.event_date,
      photo: e.photos?.[0] ?? null,
      mood: e.mood,
    });
  }

  for (const m of memories) {
    feed.push({
      id: `memory-${m.id}`,
      kind: "memory",
      title: m.title || "A memory",
      description: m.story,
      date: m.memory_date,
      photo: m.photos?.[0] ?? null,
      mood: m.mood,
    });
  }

  feed.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return feed;
}
