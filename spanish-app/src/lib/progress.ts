/**
 * Pure functions over AppState: learning words, reviewing, streaks and stats.
 * Each returns a new state; the caller saves it.
 */
import { daysBetween } from './date'
import { type Grade, dueCards, newCard, review } from './srs'
import type { AppState, DailyLog } from './storage'

function withActivity(state: AppState, today: string, delta: Partial<DailyLog>): AppState {
  const log = state.daily[today] ?? { newWords: 0, reviews: 0 }
  const daily = {
    ...state.daily,
    [today]: { newWords: log.newWords + (delta.newWords ?? 0), reviews: log.reviews + (delta.reviews ?? 0) },
  }

  const { lastActiveDate, current, longest } = state.streak
  let next = current
  if (lastActiveDate === null) next = 1
  else {
    const gap = daysBetween(lastActiveDate, today)
    if (gap === 1) next = current + 1
    else if (gap > 1) next = 1
    // gap <= 0: same day (or clock went back), streak unchanged
  }
  const streak = {
    current: next,
    longest: Math.max(longest, next),
    lastActiveDate: lastActiveDate && lastActiveDate > today ? lastActiveDate : today,
  }

  return { ...state, daily, streak }
}

/** Adds newly learned words as cards (due today, so they show up for review tomorrow after a first pass). */
export function learnWords(state: AppState, wordIds: string[], today: string): AppState {
  const fresh = wordIds.filter((id) => !state.cards[id])
  if (fresh.length === 0) return state
  const cards = { ...state.cards }
  for (const id of fresh) cards[id] = newCard(id, today)
  return withActivity({ ...state, cards }, today, { newWords: fresh.length })
}

/** Records a review of one card. */
export function reviewWord(state: AppState, wordId: string, grade: Grade, today: string): AppState {
  const card = state.cards[wordId] ?? newCard(wordId, today)
  const cards = { ...state.cards, [wordId]: review(card, grade, today) }
  return withActivity({ ...state, cards }, today, { reviews: 1 })
}

/** Streak to display: it stays alive until the end of the day after the last activity. */
export function currentStreak(state: AppState, today: string): number {
  const { lastActiveDate, current } = state.streak
  if (!lastActiveDate) return 0
  return daysBetween(lastActiveDate, today) <= 1 ? current : 0
}

/** True if the learner did anything today. */
export function practicedToday(state: AppState, today: string): boolean {
  return state.streak.lastActiveDate === today
}

/** Word ids due for review today, most overdue first. */
export function dueWordIds(state: AppState, today: string): string[] {
  return dueCards(Object.values(state.cards), today).map((c) => c.cardId)
}

/** The next `count` word ids that were never learned, in content order. */
export function nextNewWordIds(state: AppState, allWordIds: string[], count: number): string[] {
  return allWordIds.filter((id) => !state.cards[id]).slice(0, count)
}

/** New words still allowed today under the daily limit. */
export function newWordsLeftToday(state: AppState, today: string): number {
  const learned = state.daily[today]?.newWords ?? 0
  return Math.max(0, state.settings.newWordsPerDay - learned)
}

export interface Stats {
  streak: number
  longestStreak: number
  wordsLearned: number
  dueToday: number
  practicedToday: boolean
}

export function stats(state: AppState, today: string): Stats {
  return {
    streak: currentStreak(state, today),
    longestStreak: state.streak.longest,
    wordsLearned: Object.keys(state.cards).length,
    dueToday: dueWordIds(state, today).length,
    practicedToday: practicedToday(state, today),
  }
}
