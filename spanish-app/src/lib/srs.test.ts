import { describe, expect, it } from 'vitest'
import { DEFAULT_EASE, MIN_EASE, dueCards, isDue, newCard, nextEase, review } from './srs'

const TODAY = '2026-11-26'

describe('newCard', () => {
  it('starts with default ease and is due today', () => {
    const c = newCard('food-manzana', TODAY)
    expect(c).toMatchObject({ ease: DEFAULT_EASE, interval: 0, repetitions: 0, due: TODAY, lapses: 0 })
    expect(c.lastReviewed).toBeNull()
  })
})

describe('nextEase', () => {
  it('follows the SM-2 formula', () => {
    expect(nextEase(2.5, 5)).toBe(2.6)
    expect(nextEase(2.5, 4)).toBe(2.5)
    expect(nextEase(2.5, 3)).toBe(2.36)
    expect(nextEase(2.5, 1)).toBe(1.96)
  })

  it('never drops below the minimum', () => {
    expect(nextEase(1.3, 0)).toBe(MIN_EASE)
  })
})

describe('review', () => {
  it('uses intervals 1, 6, then interval × ease for good answers', () => {
    let c = newCard('w', TODAY)
    c = review(c, 'good', TODAY)
    expect(c).toMatchObject({ repetitions: 1, interval: 1, due: '2026-11-27', lastReviewed: TODAY })

    c = review(c, 'good', '2026-11-27')
    expect(c).toMatchObject({ repetitions: 2, interval: 6, due: '2026-12-03' })

    c = review(c, 'good', '2026-12-03')
    expect(c).toMatchObject({ repetitions: 3, interval: 15, due: '2026-12-18' })
  })

  it('grows faster with easy and slower with hard', () => {
    const base = { ...newCard('w', TODAY), repetitions: 2, interval: 6 }
    const easy = review(base, 'easy', TODAY)
    const hard = review(base, 'hard', TODAY)
    expect(easy.interval).toBeGreaterThan(hard.interval)
    expect(easy.ease).toBeGreaterThan(DEFAULT_EASE)
    expect(hard.ease).toBeLessThan(DEFAULT_EASE)
  })

  it('resets a forgotten card and counts a lapse', () => {
    const learned = { ...newCard('w', TODAY), repetitions: 3, interval: 15 }
    const c = review(learned, 'again', TODAY)
    expect(c).toMatchObject({ repetitions: 0, interval: 1, due: '2026-11-27', lapses: 1 })
    expect(c.ease).toBeLessThan(DEFAULT_EASE)
  })

  it('does not count a lapse for a card that was never learned', () => {
    const c = review(newCard('w', TODAY), 'again', TODAY)
    expect(c.lapses).toBe(0)
  })

  it('does not mutate the input card', () => {
    const c = newCard('w', TODAY)
    const copy = { ...c }
    review(c, 'good', TODAY)
    expect(c).toEqual(copy)
  })
})

describe('due cards', () => {
  it('includes cards due today or overdue, most overdue first', () => {
    const cards = [
      { ...newCard('a', TODAY), due: '2026-11-26' },
      { ...newCard('b', TODAY), due: '2026-11-27' },
      { ...newCard('c', TODAY), due: '2026-11-20' },
    ]
    expect(isDue(cards[1], TODAY)).toBe(false)
    expect(dueCards(cards, TODAY).map((c) => c.cardId)).toEqual(['c', 'a'])
  })
})
