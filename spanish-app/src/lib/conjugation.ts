/**
 * Present-tense conjugation drill (Rioplatense persons: yo, vos, él/ella/usted, nosotros, ellos/ustedes).
 */
import { type AnswerResult, checkAnswer } from './answer'
import type { Person, PersonKey, Verb } from './content'
import { type Rng, shuffle } from './random'

export interface ConjugationQuestion {
  verb: Verb
  person: Person
}

/** Pronouns that may be typed before the form ("vos tenés"). */
const OPTIONAL_PRONOUNS: Record<PersonKey, string[]> = {
  yo: ['yo'],
  vos: ['vos'],
  el: ['él', 'ella', 'usted'],
  nosotros: ['nosotros', 'nosotras'],
  ellos: ['ellos', 'ellas', 'ustedes'],
}

/** `count` questions using distinct verbs where possible, each with a random person. */
export function buildDrill(verbs: readonly Verb[], persons: readonly Person[], count: number, rng: Rng = Math.random) {
  const pool = shuffle(verbs, rng)
  const questions: ConjugationQuestion[] = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    const verb = pool[i % pool.length]
    const person = persons[Math.floor(rng() * persons.length)]
    questions.push({ verb, person })
  }
  return questions
}

export function expectedForm(q: ConjugationQuestion): string {
  return q.verb.present[q.person.key]
}

export function checkConjugation(q: ConjugationQuestion, input: string): AnswerResult {
  const form = expectedForm(q)
  const withPronoun = OPTIONAL_PRONOUNS[q.person.key].map((p) => `${p} ${form}`)
  return checkAnswer(input, [form, ...withPronoun])
}
