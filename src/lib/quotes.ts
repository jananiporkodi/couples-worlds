import { dayOfYearIndex } from "./dates";

export const QUOTES: string[] = [
  "Home is wherever I'm with you.",
  "You are my favorite place to go when my mind searches for peace.",
  "In all the world, there is no heart for me like yours.",
  "I'd choose you in a hundred lifetimes, in a hundred worlds.",
  "You're my today and all of my tomorrows.",
  "Every love story is beautiful, but ours is my favorite.",
  "You are my sun, my moon, and all my stars.",
  "Together is a wonderful place to be.",
  "I love you more than yesterday, less than tomorrow.",
  "With you, I am home.",
];

export function getQuoteOfTheDay(date: Date = new Date()): string {
  return QUOTES[dayOfYearIndex(QUOTES.length, date)];
}

export const DAILY_QUESTIONS: string[] = [
  "What made you smile today?",
  "What should we do this weekend?",
  "What's a small thing I did recently that made you happy?",
  "If we could teleport anywhere right now, where would we go?",
  "What's your favorite memory of us this year?",
  "What's something you're looking forward to?",
  "What's a tiny thing about me you love?",
];

export function getQuestionOfTheDay(date: Date = new Date()): string {
  return DAILY_QUESTIONS[dayOfYearIndex(DAILY_QUESTIONS.length, date)];
}
