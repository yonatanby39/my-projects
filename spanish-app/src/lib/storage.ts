/**
 * All learner data lives in one versioned localStorage entry.
 * Bump SCHEMA_VERSION and add a migration in `migrate` when the shape changes.
 */
import type { CardState } from './srs'

export const STORAGE_KEY = 'spanish-app:state'
export const SCHEMA_VERSION = 1

export interface DailyLog {
  newWords: number
  reviews: number
}

export interface Streak {
  current: number
  longest: number
  /** Date key of the last day with any activity, or null. */
  lastActiveDate: string | null
}

export interface Settings {
  newWordsPerDay: number
  /** Chosen speech voice (SpeechSynthesisVoice.voiceURI), or null for automatic. */
  voiceURI: string | null
}

export interface AppState {
  version: number
  /** Card state per word id. A word has a card once it was learned in a lesson. */
  cards: Record<string, CardState>
  streak: Streak
  /** Activity per date key. */
  daily: Record<string, DailyLog>
  settings: Settings
}

export function defaultState(): AppState {
  return {
    version: SCHEMA_VERSION,
    cards: {},
    streak: { current: 0, longest: 0, lastActiveDate: null },
    daily: {},
    settings: { newWordsPerDay: 10, voiceURI: null },
  }
}

/** The subset of the Storage API we use, so tests can pass an in-memory fake. */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>

function migrate(raw: unknown): AppState {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base
  const data = raw as Partial<AppState>
  // Version 1 is the first schema; fill any missing fields with defaults.
  return {
    version: SCHEMA_VERSION,
    cards: data.cards ?? base.cards,
    streak: { ...base.streak, ...data.streak },
    daily: data.daily ?? base.daily,
    settings: { ...base.settings, ...data.settings },
  }
}

export function loadState(store: KeyValueStore | undefined = globalThis.localStorage): AppState {
  if (!store) return defaultState()
  try {
    const text = store.getItem(STORAGE_KEY)
    return text ? migrate(JSON.parse(text)) : defaultState()
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState, store: KeyValueStore | undefined = globalThis.localStorage): void {
  store?.setItem(STORAGE_KEY, JSON.stringify(state))
}

/** In-memory store for tests. */
export function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value)
    },
  }
}
