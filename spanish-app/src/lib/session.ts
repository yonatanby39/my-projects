/**
 * Runs a list of exercises: wrong answers go to the end of the queue until answered right,
 * mistakes are counted per word, and points (XP) are collected.
 */
import { type Exercise, type ExerciseResult, isGraded, wordsOf } from './exercises'

export const XP_CORRECT = 2
export const XP_MATCH_PERFECT = 3
export const XP_LESSON_BONUS = 10
export const XP_REVIEW_BONUS = 5

export interface QueueItem {
  key: string
  exercise: Exercise
  /** True when this is a repeat of an exercise answered wrong earlier. */
  retry: boolean
}

export interface Session {
  queue: QueueItem[]
  index: number
  /** Mistakes per word id. */
  mistakes: Record<string, number>
  xp: number
  /** Graded exercises answered right the first time / all graded exercises. */
  firstTryCorrect: number
  gradedCount: number
}

export function startSession(exercises: Exercise[]): Session {
  const graded = exercises.filter(isGraded).length
  return {
    queue: exercises.map((exercise, i) => ({ key: String(i), exercise, retry: false })),
    index: 0,
    mistakes: {},
    xp: 0,
    firstTryCorrect: 0,
    gradedCount: graded,
  }
}

export function current(s: Session): QueueItem | undefined {
  return s.queue[s.index]
}

export function isDone(s: Session): boolean {
  return s.index >= s.queue.length
}

/** Fraction of the session finished, for the progress bar. */
export function progress(s: Session): number {
  return s.queue.length === 0 ? 1 : Math.min(1, s.index / s.queue.length)
}

/** Records the answer to the current exercise. For match, pass correct=false if any wrong pair was tapped. */
export function answer(s: Session, result: Pick<ExerciseResult, 'correct'>): Session {
  const item = current(s)
  if (!item) return s
  const ex = item.exercise
  if (ex.type === 'intro') return s
  if (ex.type === 'match') return { ...s, xp: s.xp + (result.correct ? XP_MATCH_PERFECT : 0) }

  if (result.correct) {
    return item.retry ? s : { ...s, xp: s.xp + XP_CORRECT, firstTryCorrect: s.firstTryCorrect + 1 }
  }
  const mistakes = { ...s.mistakes }
  for (const id of wordsOf(ex)) mistakes[id] = (mistakes[id] ?? 0) + 1
  const repeat: QueueItem = { key: `${item.key}r${s.queue.length}`, exercise: ex, retry: true }
  return { ...s, mistakes, queue: [...s.queue, repeat] }
}

export function next(s: Session): Session {
  return { ...s, index: s.index + 1 }
}
