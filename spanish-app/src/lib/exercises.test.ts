import { describe, expect, it } from 'vitest'
import { displaySpanish, sentences, words } from './content'
import {
  OPTION_COUNT,
  buildLesson,
  buildReview,
  distractors,
  expectedAnswer,
  findInSentence,
  gradeBuild,
  gradeOption,
  gradeTyped,
  makeBuild,
  makeChoice,
  makeFill,
  makeListen,
  makeSentenceBuild,
  tokenize,
} from './exercises'
import { seededRng } from './random'

const byEs = (es: string) => words.find((w) => w.es === es)!
const rng = () => seededRng(42)

describe('helpers', () => {
  it('tokenizes sentences without punctuation', () => {
    expect(tokenize('¡Hola! ¿Cómo andás?')).toEqual(['Hola', 'Cómo', 'andás'])
    expect(tokenize('—¿Vamos? —¡Dale!')).toEqual(['Vamos', 'Dale'])
  })

  it('finds a word inside a sentence as a whole word', () => {
    expect(findInSentence('Nos vemos mañana.', 'mañana')).toEqual({ before: 'Nos vemos ', match: 'mañana', after: '.' })
    expect(findInSentence('Buen día, ¿todo bien?', 'buen día')?.match).toBe('Buen día')
    expect(findInSentence('Las manzanas', 'manzana')).toBeNull()
    expect(findInSentence('Hola, ¿cómo te llamás?', '¿cómo te llamás?')?.match).toBe('cómo te llamás')
  })

  it('picks distinct distractors, same topic first', () => {
    const manzana = byEs('manzana')
    const d = distractors(manzana, words, 3, rng(), (w) => w.he)
    expect(d).toHaveLength(3)
    expect(new Set(d).size).toBe(3)
    expect(d).not.toContain(manzana.he)
    const foodHe = new Set(words.filter((w) => w.topic === 'food').map((w) => w.he))
    for (const x of d) expect(foodHe).toContain(x)
  })
})

describe('exercise builders', () => {
  it('choice and listen include the answer among 4 distinct options', () => {
    const w = byEs('colectivo')
    for (const ex of [makeChoice(w, words, 'es-he', rng()), makeChoice(w, words, 'he-es', rng()), makeListen(w, words, rng())]) {
      if (ex.type !== 'choice' && ex.type !== 'listen') throw new Error()
      expect(ex.options).toHaveLength(OPTION_COUNT)
      expect(new Set(ex.options).size).toBe(OPTION_COUNT)
      expect(ex.options).toContain(expectedAnswer(ex))
    }
  })

  it('build has the sentence tokens plus decoys', () => {
    const ex = makeBuild(byEs('colectivo'), words, rng())!
    if (ex.type !== 'build') throw new Error()
    expect(ex.answer).toEqual(['Tomo', 'el', 'colectivo', '60'])
    expect(ex.tiles.length).toBeGreaterThan(ex.answer.length)
    for (const t of ex.answer) expect(ex.tiles).toContain(t)
  })

  it('fill blanks the word and offers it among options', () => {
    const ex = makeFill(byEs('mañana'), words, rng())!
    if (ex.type !== 'fill') throw new Error()
    expect(ex.before + '___' + ex.after).toBe('Nos vemos ___.')
    expect(ex.options).toContain('mañana')
    expect(ex.options).toHaveLength(OPTION_COUNT)
  })

  it('fill is possible for most words', () => {
    const possible = words.filter((w) => makeFill(w, words, rng()) !== null).length
    expect(possible / words.length).toBeGreaterThan(0.7)
  })
})

describe('grading', () => {
  it('grades options', () => {
    const ex = makeChoice(byEs('manzana'), words, 'es-he', rng())
    expect(gradeOption(ex, 'תפוח').correct).toBe(true)
    expect(gradeOption(ex, 'משהו').correct).toBe(false)
  })

  it('grades typed answers leniently on accents and articles', () => {
    expect(gradeTyped({ type: 'typing', word: byEs('mañana') }, 'manana')).toMatchObject({ correct: true, status: 'accents' })
    expect(gradeTyped({ type: 'dictation', word: byEs('manzana') }, 'manzana').correct).toBe(true)
    expect(gradeTyped({ type: 'typing', word: byEs('manzana') }, 'pera').correct).toBe(false)
  })

  it('grades built sentences ignoring case and accents but not order', () => {
    const ex = makeBuild(byEs('colectivo'), words, rng())!
    if (ex.type !== 'build') throw new Error()
    expect(gradeBuild(ex, ['tomo', 'el', 'colectivo', '60']).correct).toBe(true)
    expect(gradeBuild(ex, ['el', 'Tomo', 'colectivo', '60']).correct).toBe(false)
  })
})

describe('lesson builder', () => {
  const six = words.filter((w) => w.topic === 'food').slice(0, 6)

  it('introduces every word before practicing it', () => {
    const lesson = buildLesson(six, words, { audio: true, rng: rng() })
    for (const w of six) {
      const intro = lesson.findIndex((e) => e.type === 'intro' && e.word.id === w.id)
      const firstPractice = lesson.findIndex((e) => e.type !== 'intro' && e.type !== 'match' && e.word?.id === w.id)
      expect(intro).toBeGreaterThanOrEqual(0)
      expect(intro).toBeLessThan(firstPractice)
    }
  })

  it('mixes several exercise types including match', () => {
    const lesson = buildLesson(six, words, { audio: true, rng: rng() })
    const types = new Set(lesson.map((e) => e.type))
    expect(types).toContain('match')
    expect(types).toContain('listen')
    expect(types.size).toBeGreaterThanOrEqual(5)
    expect(lesson.length).toBeGreaterThanOrEqual(18)
    expect(lesson.length).toBeLessThanOrEqual(30)
  })

  it('skips audio exercises without speech', () => {
    const lesson = buildLesson(six, words, { audio: false, rng: rng() })
    expect(lesson.some((e) => e.type === 'listen' || e.type === 'dictation')).toBe(false)
  })
})

describe('review builder', () => {
  it('has one exercise per due word plus matching games, capped', () => {
    const due = words.slice(0, 12)
    const review = buildReview(due, words, { audio: true, rng: rng() })
    const graded = review.filter((e) => e.type !== 'match')
    expect(graded.map((e) => ('word' in e ? e.word?.id : ''))).toEqual(due.map((w) => w.id))
    expect(review.filter((e) => e.type === 'match')).toHaveLength(2)
    expect(buildReview(words.slice(0, 40), words, { audio: true, rng: rng() }).filter((e) => e.type !== 'match')).toHaveLength(15)
  })

  it('rotates exercise types', () => {
    const review = buildReview(words.slice(30, 40), words, { audio: true, rng: rng() })
    expect(new Set(review.map((e) => e.type)).size).toBeGreaterThanOrEqual(5)
  })

  it('shows Spanish with article as the answer for typing', () => {
    expect(expectedAnswer({ type: 'typing', word: byEs('manzana') })).toBe(displaySpanish(byEs('manzana')))
  })
})

describe('topic sentences', () => {
  it('every topic has sentences that can be built', () => {
    const topics = new Set(words.map((w) => w.topic))
    for (const t of topics) {
      const built = sentences.filter((s) => s.topic === t).map((s) => makeSentenceBuild(s, words, rng()))
      expect(built.filter(Boolean).length, t).toBeGreaterThanOrEqual(3)
    }
  })

  it('lessons and reviews include topic sentences when given', () => {
    const six = words.filter((w) => w.topic === 'food').slice(0, 6)
    const lesson = buildLesson(six, words, { audio: true, rng: rng(), sentences })
    const foodEs = new Set(sentences.filter((s) => s.topic === 'food').map((s) => s.es))
    expect(lesson.some((e) => e.type === 'build' && !e.word && foodEs.has(e.sentence.es))).toBe(true)
    const review = buildReview(six, words, { audio: true, rng: rng(), sentences })
    expect(review.some((e) => e.type === 'build' && !e.word)).toBe(true)
  })
})
