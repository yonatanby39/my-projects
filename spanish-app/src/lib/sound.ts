/** Short feedback sounds made with the Web Audio API (no audio files). */
let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + start
  const osc = a.createOscillator()
  const gain = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(volume, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.connect(gain).connect(a.destination)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

export function playCorrect() {
  tone(660, 0, 0.12)
  tone(990, 0.1, 0.2)
}

export function playWrong() {
  tone(200, 0, 0.25, 'triangle', 0.2)
  tone(150, 0.12, 0.3, 'triangle', 0.2)
}

export function playComplete() {
  ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.25))
}
