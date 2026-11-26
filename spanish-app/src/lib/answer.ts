/**
 * Answer checking for typed Spanish.
 * Case, extra spaces, punctuation (¿ ? ¡ ! . ,) and accents (á é í ó ú ü ñ) are ignored,
 * but the result tells the UI whether the accents were right so it can show the correct spelling.
 */

export type AnswerStatus = 'exact' | 'accents' | 'wrong'

export interface AnswerResult {
  status: AnswerStatus
  /** True for 'exact' and 'accents'. */
  correct: boolean
  /** The canonical correct spelling to show the learner (the closest accepted answer). */
  expected: string
}

const PUNCTUATION = /[¿?¡!.,;:"'«»()]/g

/** Lowercase, drop punctuation, collapse whitespace. Keeps accents. */
export function clean(text: string): string {
  return text.normalize('NFC').toLowerCase().replace(PUNCTUATION, ' ').replace(/\s+/g, ' ').trim()
}

/** clean() plus removing all accents and the tilde on ñ. */
export function normalize(text: string): string {
  return clean(text).normalize('NFD').replace(/\p{Diacritic}/gu, '').normalize('NFC')
}

/**
 * Checks `input` against one or more accepted answers.
 * The first accepted answer is the one shown when the input is wrong.
 */
export function checkAnswer(input: string, accepted: string | string[]): AnswerResult {
  const answers = Array.isArray(accepted) ? accepted : [accepted]
  if (answers.length === 0) throw new Error('checkAnswer needs at least one accepted answer')

  const cleaned = clean(input)
  const exact = answers.find((a) => clean(a) === cleaned)
  if (exact !== undefined && cleaned !== '') {
    return { status: 'exact', correct: true, expected: exact }
  }

  const normalized = normalize(input)
  const loose = answers.find((a) => normalize(a) === normalized)
  if (loose !== undefined && normalized !== '') {
    return { status: 'accents', correct: true, expected: loose }
  }

  return { status: 'wrong', correct: false, expected: answers[0] }
}

/** Characters offered as quick-insert buttons next to Spanish inputs. */
export const SPECIAL_CHARS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'] as const
