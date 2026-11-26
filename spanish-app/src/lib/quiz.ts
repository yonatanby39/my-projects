/**
 * End-of-lesson quiz: half multiple choice (Spanish → pick Hebrew), half typing (Hebrew → type Spanish).
 */
import { type AnswerStatus, checkAnswer } from './answer'
import { type Word, acceptedAnswers } from './content'
import { type Rng, shuffle } from './random'
import type { Grade } from './srs'

export interface ChoiceQuestion {
  kind: 'choice'
  word: Word
  /** Hebrew options, one of which is word.he. */
  options: string[]
}

export interface TypingQuestion {
  kind: 'typing'
  word: Word
}

export type QuizQuestion = ChoiceQuestion | TypingQuestion

export const CHOICE_COUNT = 4

/** Picks distractor translations: same topic first, then any topic; no duplicates of the answer. */
export function distractors(word: Word, pool: readonly Word[], count: number, rng: Rng): string[] {
  const usable = (w: Word) => w.id !== word.id && w.he !== word.he
  const sameTopic = shuffle(pool.filter((w) => usable(w) && w.topic === word.topic), rng)
  const other = shuffle(pool.filter((w) => usable(w) && w.topic !== word.topic), rng)
  const picked: string[] = []
  for (const w of [...sameTopic, ...other]) {
    if (picked.length === count) break
    if (!picked.includes(w.he)) picked.push(w.he)
  }
  return picked
}

/** Builds a quiz with one question per lesson word, in random order. */
export function buildQuiz(lessonWords: readonly Word[], pool: readonly Word[], rng: Rng = Math.random): QuizQuestion[] {
  const ordered = shuffle(lessonWords, rng)
  const typingCount = Math.floor(ordered.length / 2)
  const questions: QuizQuestion[] = ordered.map((word, i) => {
    if (i < typingCount) return { kind: 'typing', word }
    const options = shuffle([word.he, ...distractors(word, pool, CHOICE_COUNT - 1, rng)], rng)
    return { kind: 'choice', word, options }
  })
  // Start with multiple choice (easier), then typing.
  return [...questions.filter((q) => q.kind === 'choice'), ...questions.filter((q) => q.kind === 'typing')]
}

export interface QuizResult {
  correct: boolean
  /** For typing: whether accents were right. */
  status: AnswerStatus
  /** Correct answer to show the learner. */
  expected: string
}

export function gradeChoice(question: ChoiceQuestion, chosen: string): QuizResult {
  const correct = chosen === question.word.he
  return { correct, status: correct ? 'exact' : 'wrong', expected: question.word.he }
}

export function gradeTyping(question: TypingQuestion, input: string): QuizResult {
  const r = checkAnswer(input, acceptedAnswers(question.word))
  return { correct: r.correct, status: r.status, expected: r.expected }
}

/** Spaced-repetition grade for a quiz answer. Missing accents still count as a full success. */
export function srsGrade(result: QuizResult): Grade {
  return result.correct ? 'good' : 'again'
}
