import { describe, expect, it } from 'vitest'
import { pickVoice, spanishVoices, type VoiceLike } from './speech'

const v = (voiceURI: string, lang: string, localService = true): VoiceLike => ({ voiceURI, name: voiceURI, lang, localService })

describe('voice picking', () => {
  const voices = [v('en', 'en-US'), v('spain', 'es-ES'), v('mexico', 'es-MX'), v('argentina', 'es-AR'), v('us', 'es_US')]

  it('prefers an Argentine voice', () => {
    expect(pickVoice(voices)?.voiceURI).toBe('argentina')
  })

  it('falls back to Latin American before Spain', () => {
    const noAr = voices.filter((x) => x.lang !== 'es-AR')
    expect(pickVoice(noAr)?.voiceURI).toBe('us')
    expect(pickVoice([v('spain', 'es-ES'), v('generic', 'es')])?.voiceURI).toBe('generic')
    expect(pickVoice([v('spain', 'es-ES'), v('en', 'en-US')])?.voiceURI).toBe('spain')
  })

  it('uses the chosen voice when it exists', () => {
    expect(pickVoice(voices, 'spain')?.voiceURI).toBe('spain')
    expect(pickVoice(voices, 'missing')?.voiceURI).toBe('argentina')
  })

  it('returns null without any Spanish voice', () => {
    expect(pickVoice([v('en', 'en-US')])).toBeNull()
  })

  it('lists only Spanish voices, local ones first within a language', () => {
    const list = spanishVoices([v('mx-online', 'es-MX', false), v('mx-local', 'es-MX'), v('en', 'en-GB')])
    expect(list.map((x) => x.voiceURI)).toEqual(['mx-local', 'mx-online'])
  })
})
