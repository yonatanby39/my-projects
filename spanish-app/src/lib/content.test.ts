import { describe, expect, it } from 'vitest'
import {
  acceptedAnswers,
  articleFor,
  displaySpanish,
  persons,
  topics,
  verbs,
  wordFileTopics,
  words,
} from './content'

const PERSON_KEYS = ['yo', 'vos', 'el', 'nosotros', 'ellos']

describe('content: words', () => {
  it('has around 200 words', () => {
    expect(words.length).toBeGreaterThanOrEqual(200)
  })

  it('every topic has a word file and every word file has a topic', () => {
    expect([...wordFileTopics].sort()).toEqual(topics.map((t) => t.id).sort())
  })

  it('has unique word ids', () => {
    const ids = words.map((w) => w.id)
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect(dupes).toEqual([])
  })

  it('every word has Spanish, Hebrew and a full example', () => {
    for (const w of words) {
      expect(w.es.trim(), w.id).not.toBe('')
      expect(w.he.trim(), w.id).not.toBe('')
      expect(w.example?.es?.trim(), w.id).toBeTruthy()
      expect(w.example?.he?.trim(), w.id).toBeTruthy()
      if (w.gender) expect(['m', 'f'], w.id).toContain(w.gender)
    }
  })

  it('every topic has at least 15 words', () => {
    for (const t of topics) {
      expect(words.filter((w) => w.topic === t.id).length, t.id).toBeGreaterThanOrEqual(15)
    }
  })

  it('uses Argentine vocabulary', () => {
    const es = new Set(words.map((w) => w.es))
    for (const w of ['colectivo', 'frutilla', 'palta', 'celular', 'heladera']) expect(es).toContain(w)
    for (const w of ['autobús', 'fresa', 'aguacate', 'móvil', 'nevera']) expect(es).not.toContain(w)
  })
})

describe('articles and accepted answers', () => {
  it('derives articles from gender, plural and overrides', () => {
    expect(articleFor({ es: 'manzana', he: '', gender: 'f', example: { es: '', he: '' } })).toBe('la')
    expect(articleFor({ es: 'padres', he: '', gender: 'm', plural: true, example: { es: '', he: '' } })).toBe('los')
    expect(articleFor({ es: 'agua', he: '', gender: 'f', article: 'el', example: { es: '', he: '' } })).toBe('el')
    expect(articleFor({ es: 'hola', he: '', example: { es: '', he: '' } })).toBeUndefined()
  })

  it('accepts nouns with or without the article', () => {
    const manzana = words.find((w) => w.es === 'manzana')!
    expect(displaySpanish(manzana)).toBe('la manzana')
    expect(acceptedAnswers(manzana)).toEqual(['la manzana', 'manzana'])
    const hola = words.find((w) => w.es === 'hola')!
    expect(acceptedAnswers(hola)).toEqual(['hola'])
  })
})

describe('content: verbs', () => {
  it('defines the five Rioplatense persons (vos, ustedes; no tú or vosotros)', () => {
    expect(persons.map((p) => p.key)).toEqual(PERSON_KEYS)
    expect(persons.some((p) => /vosotros|tú/.test(p.es))).toBe(false)
  })

  it('has around 30 verbs with every present-tense form', () => {
    expect(verbs.length).toBeGreaterThanOrEqual(25)
    for (const v of verbs) {
      expect(Object.keys(v.present).sort(), v.infinitive).toEqual([...PERSON_KEYS].sort())
      for (const form of Object.values(v.present)) expect(form.trim(), v.infinitive).not.toBe('')
    }
  })

  it('has unique infinitives', () => {
    const inf = verbs.map((v) => v.infinitive)
    expect(new Set(inf).size).toBe(inf.length)
  })

  it('uses voseo forms', () => {
    const vos = Object.fromEntries(verbs.map((v) => [v.infinitive, v.present.vos]))
    expect(vos).toMatchObject({ ser: 'sos', tener: 'tenés', hablar: 'hablás', vivir: 'vivís', querer: 'querés' })
  })

  it('regular verbs follow the regular pattern', () => {
    const endings = {
      ar: ['o', 'ás', 'a', 'amos', 'an'],
      er: ['o', 'és', 'e', 'emos', 'en'],
      ir: ['o', 'ís', 'e', 'imos', 'en'],
    } as const
    for (const v of verbs.filter((x) => x.type === 'regular')) {
      const stem = v.infinitive.slice(0, -2)
      const ending = endings[v.infinitive.slice(-2) as keyof typeof endings]
      expect(PERSON_KEYS.map((k) => v.present[k as keyof typeof v.present]), v.infinitive).toEqual(
        ending.map((e) => stem + e),
      )
    }
  })
})
