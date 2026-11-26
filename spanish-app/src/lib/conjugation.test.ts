import { describe, expect, it } from 'vitest'
import { buildDrill, checkConjugation, expectedForm } from './conjugation'
import { persons, verbs } from './content'
import { seededRng } from './random'

const tener = verbs.find((v) => v.infinitive === 'tener')!
const person = (key: string) => persons.find((p) => p.key === key)!

describe('buildDrill', () => {
  it('builds the requested number of questions with distinct verbs', () => {
    const drill = buildDrill(verbs, persons, 10, seededRng(3))
    expect(drill).toHaveLength(10)
    expect(new Set(drill.map((q) => q.verb.infinitive)).size).toBe(10)
    for (const q of drill) expect(persons).toContain(q.person)
  })

  it('reuses verbs when asking for more questions than verbs', () => {
    expect(buildDrill(verbs.slice(0, 3), persons, 5, seededRng(1))).toHaveLength(5)
  })
})

describe('checkConjugation', () => {
  it('expects the vos form for vos', () => {
    const q = { verb: tener, person: person('vos') }
    expect(expectedForm(q)).toBe('tenés')
    expect(checkConjugation(q, 'tenés').status).toBe('exact')
    expect(checkConjugation(q, 'tenes').status).toBe('accents')
    expect(checkConjugation(q, 'tienes').correct).toBe(false)
  })

  it('accepts the form with its pronoun', () => {
    expect(checkConjugation({ verb: tener, person: person('vos') }, 'vos tenés').correct).toBe(true)
    expect(checkConjugation({ verb: tener, person: person('el') }, 'usted tiene').correct).toBe(true)
    expect(checkConjugation({ verb: tener, person: person('ellos') }, 'ustedes tienen').correct).toBe(true)
    expect(checkConjugation({ verb: tener, person: person('yo') }, 'vos tengo').correct).toBe(false)
  })

  it('shows the bare form as the expected answer', () => {
    expect(checkConjugation({ verb: tener, person: person('nosotros') }, 'x').expected).toBe('tenemos')
  })
})
