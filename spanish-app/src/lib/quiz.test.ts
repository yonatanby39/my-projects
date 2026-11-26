import { describe, expect, it } from 'vitest'
import { words } from './content'
import { CHOICE_COUNT, buildQuiz, distractors, gradeChoice, gradeTyping, srsGrade } from './quiz'
import { seededRng, shuffle } from './random'

const lesson = words.slice(0, 10)

describe('shuffle', () => {
  it('keeps all items and is deterministic with a seed', () => {
    const a = shuffle([1, 2, 3, 4, 5], seededRng(1))
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5])
    expect(shuffle([1, 2, 3, 4, 5], seededRng(1))).toEqual(a)
  })
})

describe('buildQuiz', () => {
  const quiz = buildQuiz(lesson, words, seededRng(42))

  it('asks about every lesson word exactly once', () => {
    expect(quiz.map((q) => q.word.id).sort()).toEqual(lesson.map((w) => w.id).sort())
  })

  it('has half multiple choice first, then half typing', () => {
    expect(quiz.map((q) => q.kind)).toEqual([...Array(5).fill('choice'), ...Array(5).fill('typing')])
  })

  it('gives each choice question 4 distinct options including the answer', () => {
    for (const q of quiz) {
      if (q.kind !== 'choice') continue
      expect(q.options).toHaveLength(CHOICE_COUNT)
      expect(new Set(q.options).size).toBe(CHOICE_COUNT)
      expect(q.options).toContain(q.word.he)
    }
  })

  it('prefers distractors from the same topic', () => {
    const word = words.find((w) => w.es === 'manzana')!
    const sameTopicHe = new Set(words.filter((w) => w.topic === 'food').map((w) => w.he))
    for (const d of distractors(word, words, 3, seededRng(7))) expect(sameTopicHe).toContain(d)
  })
})

describe('grading', () => {
  const manzana = words.find((w) => w.es === 'manzana')!

  it('grades multiple choice', () => {
    const q = { kind: 'choice' as const, word: manzana, options: [] }
    expect(gradeChoice(q, 'תפוח').correct).toBe(true)
    expect(gradeChoice(q, 'בננה')).toEqual({ correct: false, status: 'wrong', expected: 'תפוח' })
  })

  it('grades typing with or without the article and accents', () => {
    const q = { kind: 'typing' as const, word: manzana }
    expect(gradeTyping(q, 'la manzana')).toMatchObject({ correct: true, status: 'exact' })
    expect(gradeTyping(q, 'Manzana')).toMatchObject({ correct: true, status: 'exact' })
    const mañana = { kind: 'typing' as const, word: words.find((w) => w.es === 'mañana')! }
    expect(gradeTyping(mañana, 'manana')).toMatchObject({ correct: true, status: 'accents', expected: 'mañana' })
    expect(gradeTyping(q, 'pera')).toMatchObject({ correct: false, expected: 'la manzana' })
  })

  it('maps results to spaced-repetition grades', () => {
    expect(srsGrade({ correct: true, status: 'exact', expected: '' })).toBe('good')
    expect(srsGrade({ correct: true, status: 'accents', expected: '' })).toBe('good')
    expect(srsGrade({ correct: false, status: 'wrong', expected: '' })).toBe('again')
  })
})
