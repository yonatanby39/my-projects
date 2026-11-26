import { describe, expect, it } from 'vitest'
import { checkAnswer, clean, normalize } from './answer'

describe('clean / normalize', () => {
  it('lowercases, trims, collapses spaces and drops punctuation', () => {
    expect(clean('  ¿Cómo   ESTÁS?  ')).toBe('cómo estás')
  })

  it('normalize also removes accents and ñ tilde', () => {
    expect(normalize('¡Mañana, pingüino!')).toBe('manana pinguino')
    expect(normalize('Él está aquí')).toBe('el esta aqui')
  })

  it('treats decomposed and composed accents the same', () => {
    expect(clean('á')).toBe(clean('á'))
  })
})

describe('checkAnswer', () => {
  it('accepts an exact answer regardless of case and punctuation', () => {
    expect(checkAnswer('hola', '¡Hola!')).toEqual({ status: 'exact', correct: true, expected: '¡Hola!' })
    expect(checkAnswer('  Mañana ', 'mañana').status).toBe('exact')
  })

  it('accepts a missing accent or ñ but flags it', () => {
    expect(checkAnswer('manana', 'mañana')).toEqual({ status: 'accents', correct: true, expected: 'mañana' })
    expect(checkAnswer('vos tenes', 'vos tenés').status).toBe('accents')
    expect(checkAnswer('cafe', 'café').status).toBe('accents')
  })

  it('flags a wrong accent too, but still accepts it', () => {
    expect(checkAnswer('cáfe', 'café').status).toBe('accents')
  })

  it('rejects a wrong answer and shows the first accepted answer', () => {
    expect(checkAnswer('manzanas', ['manzana', 'la manzana'])).toEqual({
      status: 'wrong',
      correct: false,
      expected: 'manzana',
    })
  })

  it('matches any accepted alternative and returns that spelling', () => {
    expect(checkAnswer('la manzana', ['manzana', 'la manzana'])).toMatchObject({
      status: 'exact',
      expected: 'la manzana',
    })
    expect(checkAnswer('la frutilla', ['frutilla', 'la frutilla']).correct).toBe(true)
  })

  it('rejects empty input', () => {
    expect(checkAnswer('   ', 'hola').status).toBe('wrong')
    expect(checkAnswer('¿?', '¿?').status).toBe('wrong')
  })

  it('throws without any accepted answer', () => {
    expect(() => checkAnswer('x', [])).toThrow()
  })
})
