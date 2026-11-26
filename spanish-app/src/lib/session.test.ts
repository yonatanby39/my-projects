import { describe, expect, it } from 'vitest'
import { words } from './content'
import type { Exercise } from './exercises'
import { XP_CORRECT, XP_MATCH_PERFECT, answer, current, isDone, next, progress, startSession } from './session'

const [a, b, c] = words
const exercises: Exercise[] = [
  { type: 'intro', word: a },
  { type: 'typing', word: a },
  { type: 'typing', word: b },
  { type: 'match', words: [a, b, c] },
]

function run(results: boolean[]) {
  let s = startSession(exercises)
  for (const correct of results) s = next(answer(s, { correct }))
  return s
}

describe('session', () => {
  it('finishes when every exercise is answered right', () => {
    const s = run([true, true, true, true])
    expect(isDone(s)).toBe(true)
    expect(s.xp).toBe(2 * XP_CORRECT + XP_MATCH_PERFECT)
    expect(s.firstTryCorrect).toBe(2)
    expect(s.gradedCount).toBe(2)
    expect(s.mistakes).toEqual({})
  })

  it('repeats a wrong exercise at the end until it is right', () => {
    let s = run([true, false, true, true])
    expect(isDone(s)).toBe(false)
    expect(current(s)?.exercise).toBe(exercises[1])
    expect(current(s)?.retry).toBe(true)
    s = next(answer(s, { correct: false }))
    expect(isDone(s)).toBe(false)
    s = next(answer(s, { correct: true }))
    expect(isDone(s)).toBe(true)
    expect(s.mistakes).toEqual({ [a.id]: 2 })
    // A right answer on a retry earns no points.
    expect(s.xp).toBe(XP_CORRECT + XP_MATCH_PERFECT)
  })

  it('does not repeat match games and gives no bonus for mistakes in them', () => {
    const s = run([true, true, true, false])
    expect(isDone(s)).toBe(true)
    expect(s.xp).toBe(2 * XP_CORRECT)
  })

  it('reports progress', () => {
    let s = startSession(exercises)
    expect(progress(s)).toBe(0)
    s = next(answer(s, { correct: true }))
    expect(progress(s)).toBe(0.25)
  })
})
