import { describe, expect, it } from 'vitest'
import {
  currentStreak,
  dueWordIds,
  learnWords,
  newWordsLeftToday,
  nextNewWordIds,
  recordPractice,
  reviewWord,
  stats,
} from './progress'
import { defaultState } from './storage'

const D1 = '2026-11-26'
const D2 = '2026-11-27'
const D3 = '2026-11-28'
const D5 = '2026-11-30'

describe('learning words', () => {
  it('creates cards and counts them for today', () => {
    const s = learnWords(defaultState(), ['a', 'b'], D1)
    expect(Object.keys(s.cards)).toEqual(['a', 'b'])
    expect(s.daily[D1]).toEqual({ newWords: 2, reviews: 0 })
  })

  it('ignores words that are already learned', () => {
    let s = learnWords(defaultState(), ['a'], D1)
    s = learnWords(s, ['a', 'b'], D1)
    expect(s.daily[D1].newWords).toBe(2)
  })

  it('picks the next unlearned words in order and respects the daily limit', () => {
    let s = learnWords(defaultState(), ['a', 'b'], D1)
    expect(nextNewWordIds(s, ['a', 'b', 'c', 'd', 'e'], 2)).toEqual(['c', 'd'])
    expect(newWordsLeftToday(s, D1)).toBe(8)
    s = learnWords(s, ['c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'], D1)
    expect(newWordsLeftToday(s, D1)).toBe(0)
    expect(newWordsLeftToday(s, D2)).toBe(10)
  })
})

describe('due today (Definition of Done scenario)', () => {
  it('learn 10 words and review them today; they are due tomorrow', () => {
    const ids = Array.from({ length: 10 }, (_, i) => `w${i}`)
    let s = learnWords(defaultState(), ids, D1)
    expect(dueWordIds(s, D1)).toHaveLength(10)

    for (const id of ids) s = reviewWord(s, id, id === 'w0' ? 'again' : 'good', D1)
    expect(dueWordIds(s, D1)).toEqual([])
    expect(dueWordIds(s, D2)).toHaveLength(10)

    // Next day: all good -> w1..w9 move to 6 days, w0 (first success) to 1 day.
    for (const id of ids) s = reviewWord(s, id, 'good', D2)
    expect(dueWordIds(s, D3)).toEqual(['w0'])
    expect(stats(s, D2)).toMatchObject({ wordsLearned: 10, dueToday: 0, streak: 2, practicedToday: true })
  })
})

describe('streak', () => {
  it('starts at 1 and grows on consecutive days', () => {
    let s = learnWords(defaultState(), ['a'], D1)
    expect(s.streak).toEqual({ current: 1, longest: 1, lastActiveDate: D1 })
    s = reviewWord(s, 'a', 'good', D1)
    expect(s.streak.current).toBe(1)
    s = reviewWord(s, 'a', 'good', D2)
    expect(s.streak).toEqual({ current: 2, longest: 2, lastActiveDate: D2 })
  })

  it('resets after a missed day but keeps the longest', () => {
    let s = learnWords(defaultState(), ['a'], D1)
    s = reviewWord(s, 'a', 'good', D2)
    s = reviewWord(s, 'a', 'good', D5)
    expect(s.streak).toEqual({ current: 1, longest: 2, lastActiveDate: D5 })
  })

  it('displays the streak until the end of the next day, then 0', () => {
    const s = learnWords(defaultState(), ['a'], D1)
    expect(currentStreak(s, D1)).toBe(1)
    expect(currentStreak(s, D2)).toBe(1)
    expect(currentStreak(s, D3)).toBe(0)
    expect(currentStreak(defaultState(), D1)).toBe(0)
  })
})

describe('recordPractice', () => {
  it('counts for the streak without changing cards', () => {
    let s = recordPractice(defaultState(), D1)
    s = recordPractice(s, D2)
    expect(s.streak.current).toBe(2)
    expect(s.cards).toEqual({})
  })
})
