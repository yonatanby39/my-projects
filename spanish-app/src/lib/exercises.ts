/**
 * Interactive exercises and the builders that mix them into lessons and reviews.
 * Everything here is pure; the screens in src/components/exercises render and grade them.
 */
import { type AnswerResult, checkAnswer, normalize } from './answer'
import { type Sentence, type Word, acceptedAnswers, displaySpanish } from './content'
import { type Rng, shuffle } from './random'

export type Direction = 'es-he' | 'he-es'

export type Exercise =
  /** Teach a new word (flashcard). */
  | { type: 'intro'; word: Word }
  /** See a word, pick its translation. es-he: options are Hebrew; he-es: options are Spanish. */
  | { type: 'choice'; word: Word; direction: Direction; options: string[] }
  /** Hear a word, pick the Spanish you heard. */
  | { type: 'listen'; word: Word; options: string[] }
  /** See Hebrew, type the Spanish. */
  | { type: 'typing'; word: Word }
  /** Hear Spanish, type it. */
  | { type: 'dictation'; word: Word }
  /** Match Spanish and Hebrew pairs. */
  | { type: 'match'; words: Word[] }
  /** Translate a Hebrew sentence by tapping Spanish word tiles in order. `word` is absent for topic sentences. */
  | { type: 'build'; word?: Word; sentence: { es: string; he: string }; answer: string[]; tiles: string[] }
  /** Pick the missing word in a Spanish sentence. */
  | { type: 'fill'; word: Word; sentence: { es: string; he: string }; before: string; after: string; answer: string; options: string[] }

export type ExerciseType = Exercise['type']

export const OPTION_COUNT = 4
export const MATCH_MAX = 5

// ---------- helpers ----------

/** Up to `count` distinct values for other words, same topic first. */
export function distractors(
  word: Word,
  pool: readonly Word[],
  count: number,
  rng: Rng,
  value: (w: Word) => string,
): string[] {
  const own = normalize(value(word))
  const usable = (w: Word) => w.id !== word.id && normalize(value(w)) !== own
  const sameTopic = shuffle(pool.filter((w) => usable(w) && w.topic === word.topic), rng)
  const other = shuffle(pool.filter((w) => usable(w) && w.topic !== word.topic), rng)
  const picked: string[] = []
  for (const w of [...sameTopic, ...other]) {
    if (picked.length === count) break
    const v = value(w)
    if (!picked.some((p) => normalize(p) === normalize(v))) picked.push(v)
  }
  return picked
}

const TOKEN_PUNCT = /[¿?¡!.,;:"«»—()]/g

/** Splits a Spanish sentence into word tiles without punctuation. */
export function tokenize(sentence: string): string[] {
  return sentence
    .split(/\s+/)
    .map((t) => t.replace(TOKEN_PUNCT, ''))
    .filter((t) => t.length > 0)
}

/** Finds `word.es` inside its example sentence (case-insensitive, whole words). */
export function findInSentence(sentence: string, target: string): { before: string; match: string; after: string } | null {
  const needle = target.replace(/[¿?¡!]/g, '').trim()
  if (!needle) return null
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(?<![\\p{L}])${escaped}(?![\\p{L}])`, 'iu')
  const m = re.exec(sentence)
  if (!m) return null
  return { before: sentence.slice(0, m.index), match: m[0], after: sentence.slice(m.index + m[0].length) }
}

// ---------- single exercise builders (return null when not possible) ----------

export function makeChoice(word: Word, pool: readonly Word[], direction: Direction, rng: Rng): Exercise {
  const value = direction === 'es-he' ? (w: Word) => w.he : displaySpanish
  const options = shuffle([value(word), ...distractors(word, pool, OPTION_COUNT - 1, rng, value)], rng)
  return { type: 'choice', word, direction, options }
}

export function makeListen(word: Word, pool: readonly Word[], rng: Rng): Exercise {
  const options = shuffle([displaySpanish(word), ...distractors(word, pool, OPTION_COUNT - 1, rng, displaySpanish)], rng)
  return { type: 'listen', word, options }
}

export function makeBuild(word: Word, pool: readonly Word[], rng: Rng): Exercise | null {
  return makeSentenceBuild({ topic: word.topic, ...word.example }, pool, rng, word)
}

/** Sentence building from any sentence; decoy tiles come from example sentences of the same topic. */
export function makeSentenceBuild(sentence: Sentence, pool: readonly Word[], rng: Rng, word?: Word): Exercise | null {
  const answer = tokenize(sentence.es)
  if (answer.length < 2 || answer.length > 9) return null
  const inSentence = new Set(answer.map((t) => normalize(t)))
  const extra = shuffle(
    pool.filter((w) => w.id !== word?.id && w.topic === sentence.topic).flatMap((w) => tokenize(w.example.es)),
    rng,
  )
  const decoys: string[] = []
  for (const t of extra) {
    if (decoys.length === 3) break
    const n = normalize(t)
    if (!inSentence.has(n) && !decoys.some((d) => normalize(d) === n)) decoys.push(t.toLowerCase())
  }
  return { type: 'build', word, sentence: { es: sentence.es, he: sentence.he }, answer, tiles: shuffle([...answer, ...decoys], rng) }
}

export function makeFill(word: Word, pool: readonly Word[], rng: Rng): Exercise | null {
  const found = findInSentence(word.example.es, word.es)
  if (!found) return null
  const answer = found.match
  const others = distractors(word, pool, OPTION_COUNT - 1, rng, (w) => w.es.replace(/[¿?¡!]/g, '').trim())
  if (others.length < OPTION_COUNT - 1) return null
  const lower = (s: string) => (answer[0] === answer[0].toLowerCase() ? s : s[0].toUpperCase() + s.slice(1))
  return {
    type: 'fill',
    word,
    sentence: word.example,
    before: found.before,
    after: found.after,
    answer,
    options: shuffle([answer, ...others.map(lower)], rng),
  }
}

// ---------- grading ----------

export interface ExerciseResult {
  correct: boolean
  /** 'accents' when a typed answer was accepted without the right accents. */
  status: AnswerResult['status']
  /** The correct answer to show. */
  expected: string
}

const ok = (expected: string): ExerciseResult => ({ correct: true, status: 'exact', expected })
const wrong = (expected: string): ExerciseResult => ({ correct: false, status: 'wrong', expected })

/** The correct answer text for an exercise, as shown to the learner. */
export function expectedAnswer(ex: Exercise): string {
  switch (ex.type) {
    case 'intro':
    case 'typing':
    case 'dictation':
    case 'listen':
      return displaySpanish(ex.word)
    case 'choice':
      return ex.direction === 'es-he' ? ex.word.he : displaySpanish(ex.word)
    case 'match':
      return ''
    case 'build':
      return ex.sentence.es
    case 'fill':
      return ex.answer
  }
}

/** Grades a picked option (choice, listen, fill). */
export function gradeOption(ex: Exercise, picked: string): ExerciseResult {
  const expected = expectedAnswer(ex)
  return picked === expected ? ok(expected) : wrong(expected)
}

/** Grades typed Spanish (typing, dictation). */
export function gradeTyped(ex: Exercise & { word: Word }, input: string): ExerciseResult {
  const r = checkAnswer(input, acceptedAnswers(ex.word))
  return { correct: r.correct, status: r.status, expected: r.expected }
}

/** Grades a tile sentence (build). Accents and punctuation are ignored. */
export function gradeBuild(ex: Extract<Exercise, { type: 'build' }>, tiles: string[]): ExerciseResult {
  const r = checkAnswer(tiles.join(' '), ex.answer.join(' '))
  return r.correct ? ok(ex.sentence.es) : wrong(ex.sentence.es)
}

// ---------- lesson and review builders ----------

export interface BuildOptions {
  /** Whether speech is available; without it no listen or dictation exercises. */
  audio: boolean
  rng?: Rng
  /** Topic sentences for extra sentence-building practice. */
  sentences?: readonly Sentence[]
}

/** Up to `count` sentence-building exercises from topic sentences of the given words' topics. */
function topicSentenceBuilds(words: readonly Word[], pool: readonly Word[], opts: BuildOptions, count: number, rng: Rng): Exercise[] {
  const topics = new Set(words.map((w) => w.topic))
  const candidates = shuffle((opts.sentences ?? []).filter((s) => topics.has(s.topic)), rng)
  return candidates
    .map((s) => makeSentenceBuild(s, pool, rng))
    .filter((e): e is Exercise => e !== null)
    .slice(0, count)
}

/** Practice types used to consolidate or review a word, in rotation. */
function practiceFor(word: Word, pool: readonly Word[], type: string, rng: Rng, audio: boolean): Exercise | null {
  switch (type) {
    case 'choice-es-he':
      return makeChoice(word, pool, 'es-he', rng)
    case 'choice-he-es':
      return makeChoice(word, pool, 'he-es', rng)
    case 'listen':
      return audio ? makeListen(word, pool, rng) : null
    case 'typing':
      return { type: 'typing', word }
    case 'dictation':
      return audio ? { type: 'dictation', word } : null
    case 'build':
      return makeBuild(word, pool, rng)
    case 'fill':
      return makeFill(word, pool, rng)
    default:
      return null
  }
}

/** Tries `types` starting at `start`, returning the first exercise that can be built. */
function rotate(word: Word, pool: readonly Word[], types: string[], start: number, rng: Rng, audio: boolean): Exercise {
  for (let i = 0; i < types.length; i++) {
    const ex = practiceFor(word, pool, types[(start + i) % types.length], rng, audio)
    if (ex) return ex
  }
  return { type: 'typing', word }
}

export const LESSON_GROUP_SIZE = 3

const CONSOLIDATE = ['build', 'fill', 'typing', 'dictation', 'choice-he-es']

/**
 * A lesson teaches words in small groups: each word is introduced and checked right away,
 * the group gets a listening check and a matching game, and the lesson ends with
 * one varied exercise per word and a final matching game.
 */
export function buildLesson(newWords: readonly Word[], pool: readonly Word[], opts: BuildOptions): Exercise[] {
  const rng = opts.rng ?? Math.random
  const out: Exercise[] = []
  const seen: Word[] = []
  for (let g = 0; g < newWords.length; g += LESSON_GROUP_SIZE) {
    const group = newWords.slice(g, g + LESSON_GROUP_SIZE)
    for (const word of group) {
      out.push({ type: 'intro', word })
      out.push(makeChoice(word, pool, 'es-he', rng))
      seen.push(word)
    }
    const listenWord = group[Math.floor(rng() * group.length)]
    out.push(opts.audio ? makeListen(listenWord, pool, rng) : makeChoice(listenWord, pool, 'he-es', rng))
    if (seen.length >= 3) out.push({ type: 'match', words: shuffle(seen, rng).slice(0, MATCH_MAX) })
  }
  shuffle(newWords, rng).forEach((word, i) => out.push(rotate(word, pool, CONSOLIDATE, i, rng, opts.audio)))
  out.push(...topicSentenceBuilds(newWords, pool, opts, 2, rng))
  if (newWords.length >= 3) out.push({ type: 'match', words: shuffle(newWords, rng).slice(0, MATCH_MAX) })
  return out
}

const REVIEW = ['choice-es-he', 'listen', 'typing', 'fill', 'build', 'choice-he-es', 'dictation']
export const REVIEW_MAX_WORDS = 15

/** A review session: one varied exercise per due word, with a matching game after every 5 words. */
export function buildReview(dueWords: readonly Word[], pool: readonly Word[], opts: BuildOptions): Exercise[] {
  const rng = opts.rng ?? Math.random
  const words = dueWords.slice(0, REVIEW_MAX_WORDS)
  const offset = Math.floor(rng() * REVIEW.length)
  const out: Exercise[] = []
  words.forEach((word, i) => {
    out.push(rotate(word, pool, REVIEW, offset + i, rng, opts.audio))
    if ((i + 1) % MATCH_MAX === 0) out.push({ type: 'match', words: shuffle(words.slice(i + 1 - MATCH_MAX, i + 1), rng) })
  })
  const rest = words.length % MATCH_MAX
  if (rest >= 3) out.push({ type: 'match', words: shuffle(words.slice(-rest), rng) })
  out.push(...topicSentenceBuilds(words, pool, opts, Math.ceil(words.length / MATCH_MAX), rng))
  return out
}

/** Word ids an exercise practices (for tracking mistakes per word). */
export function wordsOf(ex: Exercise): string[] {
  if (ex.type === 'match') return ex.words.map((w) => w.id)
  return ex.word ? [ex.word.id] : []
}

/** Whether the exercise is graded (intro and match never send a word to the end of the queue). */
export function isGraded(ex: Exercise): boolean {
  return ex.type !== 'intro' && ex.type !== 'match'
}

/** Normalized form exposed for UI comparisons. */
export { normalize }
