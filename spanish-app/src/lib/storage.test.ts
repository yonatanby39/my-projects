import { describe, expect, it } from 'vitest'
import { STORAGE_KEY, defaultState, loadState, memoryStore, saveState } from './storage'

describe('storage', () => {
  it('returns defaults when nothing is saved', () => {
    expect(loadState(memoryStore())).toEqual(defaultState())
  })

  it('round-trips saved state', () => {
    const store = memoryStore()
    const state = defaultState()
    state.streak = { current: 3, longest: 5, lastActiveDate: '2026-11-26' }
    saveState(state, store)
    expect(loadState(store)).toEqual(state)
  })

  it('falls back to defaults on corrupt data', () => {
    expect(loadState(memoryStore({ [STORAGE_KEY]: '{not json' }))).toEqual(defaultState())
  })

  it('fills missing fields from defaults', () => {
    const store = memoryStore({ [STORAGE_KEY]: JSON.stringify({ version: 1, settings: { newWordsPerDay: 5 } }) })
    const state = loadState(store)
    expect(state.settings).toEqual({ newWordsPerDay: 5, voiceURI: null, soundOn: true, dailyGoalXp: 50 })
    expect(state.cards).toEqual({})
  })

  it('works without localStorage', () => {
    expect(loadState(undefined)).toEqual(defaultState())
    expect(() => saveState(defaultState(), undefined)).not.toThrow()
  })
})
