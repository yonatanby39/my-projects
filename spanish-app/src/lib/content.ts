/**
 * Loads learning content from src/content/*.json.
 * To add a topic: add a file in src/content/words/<topic>.json and an entry in topics.json.
 */
import topicsJson from '../content/topics.json'
import verbsJson from '../content/verbs.json'
import { normalize } from './answer'

export type Gender = 'm' | 'f'

/** A word as written in a topic JSON file. */
export interface WordEntry {
  es: string
  he: string
  gender?: Gender
  /** Plural noun (los/las). */
  plural?: boolean
  /** Overrides the article from gender, e.g. "el agua" although agua is feminine. */
  article?: string
  example: { es: string; he: string }
}

/** A word with its topic and stable id (`<topic>:<spanish without accents>`). */
export interface Word extends WordEntry {
  id: string
  topic: string
}

export interface Topic {
  id: string
  he: string
  es: string
  order: number
}

export type PersonKey = 'yo' | 'vos' | 'el' | 'nosotros' | 'ellos'

export interface Person {
  key: PersonKey
  es: string
  he: string
}

export interface Verb {
  infinitive: string
  he: string
  type: 'regular' | 'stem' | 'irregular'
  present: Record<PersonKey, string>
}

export function wordId(topic: string, es: string): string {
  return `${topic}:${normalize(es).replace(/ /g, '-')}`
}

/** The definite article for a noun (el, la, los, las), or undefined for non-nouns. */
export function articleFor(word: WordEntry): string | undefined {
  if (word.article) return word.article
  if (!word.gender) return undefined
  if (word.plural) return word.gender === 'm' ? 'los' : 'las'
  return word.gender === 'm' ? 'el' : 'la'
}

/** Spanish shown to the learner, with article for nouns: "la manzana". */
export function displaySpanish(word: WordEntry): string {
  const article = articleFor(word)
  return article ? `${article} ${word.es}` : word.es
}

/** Typed answers accepted for a word: with or without its article. */
export function acceptedAnswers(word: WordEntry): string[] {
  const withArticle = displaySpanish(word)
  return withArticle === word.es ? [word.es] : [withArticle, word.es]
}

const wordFiles = import.meta.glob<WordEntry[]>('../content/words/*.json', {
  eager: true,
  import: 'default',
})

export const topics: Topic[] = [...(topicsJson as Topic[])].sort((a, b) => a.order - b.order)

export const words: Word[] = topics.flatMap((topic) => {
  const entries = wordFiles[`../content/words/${topic.id}.json`] ?? []
  return entries.map((entry) => ({ ...entry, topic: topic.id, id: wordId(topic.id, entry.es) }))
})

export const wordsById: ReadonlyMap<string, Word> = new Map(words.map((w) => [w.id, w]))

/** Topic ids that have a word file, for validation. */
export const wordFileTopics: string[] = Object.keys(wordFiles).map((path) =>
  path.replace('../content/words/', '').replace('.json', ''),
)

export const persons: Person[] = verbsJson.persons as Person[]
export const verbs: Verb[] = verbsJson.verbs as Verb[]
