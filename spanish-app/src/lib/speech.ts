/**
 * Pronunciation with the browser's built-in Web Speech API. No external service.
 * Voice preference: the learner's chosen voice, then Argentine, then other Latin American, then any Spanish.
 */

/** Minimal voice shape so the picker can be tested without a browser. */
export interface VoiceLike {
  voiceURI: string
  name: string
  lang: string
  localService?: boolean
}

const LANG_PREFERENCE = ['es-ar', 'es-uy', 'es-419', 'es-us', 'es-mx', 'es-co', 'es-cl']

function langRank(lang: string): number {
  const l = lang.toLowerCase().replace('_', '-')
  const i = LANG_PREFERENCE.indexOf(l)
  if (i >= 0) return i
  if (l.startsWith('es-es')) return LANG_PREFERENCE.length + 1
  if (l.startsWith('es')) return LANG_PREFERENCE.length
  return Infinity
}

export function spanishVoices<V extends VoiceLike>(voices: readonly V[]): V[] {
  return voices
    .filter((v) => langRank(v.lang) !== Infinity)
    .sort((a, b) => langRank(a.lang) - langRank(b.lang) || Number(!!b.localService) - Number(!!a.localService))
}

export function pickVoice<V extends VoiceLike>(voices: readonly V[], preferredURI: string | null = null): V | null {
  if (preferredURI) {
    const chosen = voices.find((v) => v.voiceURI === preferredURI)
    if (chosen) return chosen
  }
  return spanishVoices(voices)[0] ?? null
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** Voices load asynchronously in some browsers (Chrome); resolve once they are available. */
export function loadVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  if (!speechSupported()) return Promise.resolve([])
  const synth = window.speechSynthesis
  const now = synth.getVoices()
  if (now.length) return Promise.resolve(now)
  return new Promise((resolve) => {
    const done = () => resolve(synth.getVoices())
    synth.addEventListener('voiceschanged', done, { once: true })
    setTimeout(done, timeoutMs)
  })
}

export async function speak(text: string, preferredURI: string | null = null, rate = 0.9): Promise<void> {
  if (!speechSupported()) return
  const voices = await loadVoices()
  const voice = pickVoice(voices, preferredURI)
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = voice?.lang ?? 'es-AR'
  if (voice) utterance.voice = voice
  utterance.rate = rate
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}
