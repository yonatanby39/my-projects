import { addDays } from './date'

/**
 * Simple SM-2 spaced repetition.
 * https://super-memory.com/english/ol/sm2.htm
 *
 * The learner rates each review with one of four grades, mapped to SM-2 quality (0–5):
 *   again = 1 (forgot), hard = 3, good = 4, easy = 5
 */
export type Grade = 'again' | 'hard' | 'good' | 'easy'

export const GRADE_QUALITY: Record<Grade, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
}

export const DEFAULT_EASE = 2.5
export const MIN_EASE = 1.3

export interface CardState {
  cardId: string
  /** SM-2 easiness factor, never below MIN_EASE. */
  ease: number
  /** Current interval in days. 0 for a card that was never reviewed. */
  interval: number
  /** Successful reviews in a row. Reset to 0 on a lapse. */
  repetitions: number
  /** Date key (YYYY-MM-DD) when the card is next due. */
  due: string
  /** Number of times the card was forgotten after being learned. */
  lapses: number
  /** Date key of the last review, or null if never reviewed. */
  lastReviewed: string | null
}

/** A freshly learned card, due today. */
export function newCard(cardId: string, today: string): CardState {
  return {
    cardId,
    ease: DEFAULT_EASE,
    interval: 0,
    repetitions: 0,
    due: today,
    lapses: 0,
    lastReviewed: null,
  }
}

/** SM-2 easiness update for a quality 0–5. */
export function nextEase(ease: number, quality: number): number {
  const updated = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  return Math.max(MIN_EASE, Math.round(updated * 100) / 100)
}

/** Returns the new card state after a review. Pure: does not mutate `card`. */
export function review(card: CardState, grade: Grade, today: string): CardState {
  const quality = GRADE_QUALITY[grade]
  const ease = nextEase(card.ease, quality)

  if (quality < 3) {
    // Forgotten: start the repetition sequence again, see it tomorrow.
    return {
      ...card,
      ease,
      interval: 1,
      repetitions: 0,
      due: addDays(today, 1),
      lapses: card.repetitions > 0 ? card.lapses + 1 : card.lapses,
      lastReviewed: today,
    }
  }

  const repetitions = card.repetitions + 1
  let interval: number
  if (repetitions === 1) interval = 1
  else if (repetitions === 2) interval = 6
  else interval = Math.max(1, Math.round(card.interval * ease))

  return {
    ...card,
    ease,
    interval,
    repetitions,
    due: addDays(today, interval),
    lastReviewed: today,
  }
}

/** True if the card should be reviewed on `today` (due today or overdue). */
export function isDue(card: CardState, today: string): boolean {
  return card.due <= today
}

/** Cards due on `today`, most overdue first. */
export function dueCards(cards: CardState[], today: string): CardState[] {
  return cards.filter((c) => isDue(c, today)).sort((a, b) => a.due.localeCompare(b.due))
}
