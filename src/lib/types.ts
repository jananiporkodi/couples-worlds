export type Priority = "low" | "medium" | "high";
export type BucketStatus = "not_done" | "done";

export interface BucketItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  is_custom_category: boolean;
  priority: Priority;
  status: BucketStatus;
  illustration_prompt: string | null;
  illustration_url: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Memory {
  id: string;
  bucket_item_id: string | null;
  title: string | null;
  story: string | null;
  memory_date: string;
  location: string | null;
  mood: string | null;
  tags: string[];
  photos: string[];
  videos: string[];
  reactions: Record<string, number>;
  place_id: string | null;
  is_favorite: boolean;
  note_a: string | null;
  note_b: string | null;
  created_at: string;
}

export interface GalleryMedia {
  id: string;
  memory_id: string | null;
  url: string;
  media_type: "photo" | "video";
  tags: string[];
  person: "us" | "him" | "her" | null;
  caption: string | null;
  is_favorite: boolean;
  created_at: string;
}

export interface Note {
  id: string;
  author: string | null;
  body: string;
  mood: string | null;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  photos: string[];
  mood: string | null;
  created_at: string;
}

export interface DailyQuestion {
  id: string;
  question: string;
  question_date: string;
  answer_a: string | null;
  answer_b: string | null;
  created_at: string;
}

export interface LoveJarEntry {
  id: string;
  body: string;
  author: string | null;
  created_at: string;
}

export interface Countdown {
  id: string;
  title: string;
  target_date: string;
  emoji: string | null;
  created_at: string;
}

export interface Setting {
  key: string;
  value: unknown;
  updated_at: string;
}

export type PlanStatus = "planned" | "done" | "cancelled";
export type PlanState = "upcoming" | "completed" | "missed" | "cancelled";
export type PartnerAssignee = "partner_a" | "partner_b" | "both";

export const PLAN_CATEGORIES = [
  { key: "dinner", label: "Dinner date", emoji: "🍽" },
  { key: "trip", label: "Trip", emoji: "🧳" },
  { key: "holiday", label: "Holiday", emoji: "🎄" },
  { key: "movie", label: "Movie", emoji: "🎬" },
  { key: "event", label: "Event", emoji: "🎫" },
  { key: "work_trip", label: "Work trip", emoji: "💼" },
  { key: "appointment", label: "Appointment", emoji: "🗒" },
  { key: "unavailability", label: "Unavailability", emoji: "🚫" },
  { key: "weekend", label: "Weekend together", emoji: "🌤" },
  { key: "other", label: "Other", emoji: "📌" },
] as const;

export interface Plan {
  id: string;
  title: string;
  description: string | null;
  plan_date: string;
  start_time: string | null;
  end_time: string | null;
  person: PartnerAssignee;
  category: string | null;
  reminder_minutes_before: number | null;
  location: string | null;
  status: PlanStatus;
  memory_id: string | null;
  created_at: string;
}

export type TodoPriority = "normal" | "important";
export type TodoStatus = "active" | "done";

export interface Todo {
  id: string;
  title: string;
  note: string | null;
  due_date: string | null;
  priority: TodoPriority;
  assignee: PartnerAssignee;
  status: TodoStatus;
  position: number;
  completed_at: string | null;
  created_at: string;
}

export interface Place {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export const BUCKET_CATEGORIES = [
  { key: "travel", label: "Travel", emoji: "✈️" },
  { key: "city", label: "Around the city", emoji: "🏙" },
  { key: "home", label: "At home", emoji: "🏠" },
  { key: "food", label: "Food", emoji: "🍜" },
  { key: "movies", label: "Movies", emoji: "🎬" },
  { key: "rainy_day", label: "Rainy day", emoji: "🌧" },
  { key: "friends", label: "Friends", emoji: "👫" },
  { key: "celebrations", label: "Celebrations", emoji: "🎉" },
  { key: "random", label: "Random adventures", emoji: "💡" },
  { key: "romantic", label: "Romantic", emoji: "❤️" },
] as const;

export const REACTION_EMOJIS = ["❤️", "🥹", "😂", "😍"] as const;
