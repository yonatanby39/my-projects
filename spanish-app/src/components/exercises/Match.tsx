import { useMemo, useState } from 'react'
import { displaySpanish } from '../../lib/content'
import { shuffle } from '../../lib/random'
import { playCorrect, playWrong } from '../../lib/sound'
import { speak } from '../../lib/speech'
import { Es } from '../Es'
import { Prompt } from './Prompt'
import type { ExerciseProps } from './types'

interface MatchProps extends ExerciseProps<'match'> {
  soundOn: boolean
}

/** Tap a Spanish word and its Hebrew translation to match them. */
export function Match({ exercise, voiceURI, result, onAnswer, soundOn }: MatchProps) {
  const words = exercise.words
  const spanishOrder = useMemo(() => shuffle(words), [words])
  const hebrewOrder = useMemo(() => shuffle(words), [words])
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [selEs, setSelEs] = useState<string | null>(null)
  const [selHe, setSelHe] = useState<string | null>(null)
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null)
  const [mistakes, setMistakes] = useState(0)

  const tryPair = (es: string | null, he: string | null) => {
    if (!es || !he) return
    if (es === he) {
      const next = new Set(matched).add(es)
      setMatched(next)
      setSelEs(null)
      setSelHe(null)
      if (soundOn) playCorrect()
      if (next.size === words.length) onAnswer({ correct: mistakes === 0, status: 'exact', expected: '' })
    } else {
      setWrongPair([es, he])
      setMistakes((m) => m + 1)
      if (soundOn) playWrong()
      setTimeout(() => {
        setWrongPair(null)
        setSelEs(null)
        setSelHe(null)
      }, 450)
    }
  }

  const cell = (id: string, side: 'es' | 'he', label: React.ReactNode) => {
    const done = matched.has(id)
    const selected = side === 'es' ? selEs === id : selHe === id
    const isWrong = wrongPair && (side === 'es' ? wrongPair[0] === id : wrongPair[1] === id)
    const style = done
      ? 'border-slate-100 bg-slate-100 text-slate-300'
      : isWrong
        ? 'border-red-400 bg-red-100 animate-shake'
        : selected
          ? 'border-sky-500 bg-sky-100'
          : 'border-slate-200 bg-white'
    return (
      <button
        key={`${side}-${id}`}
        type="button"
        disabled={done || !!result || !!wrongPair}
        onClick={() => {
          if (side === 'es') {
            const w = words.find((x) => x.id === id)!
            void speak(displaySpanish(w), voiceURI)
            setSelEs(id)
            tryPair(id, selHe)
          } else {
            setSelHe(id)
            tryPair(selEs, id)
          }
        }}
        className={`min-h-14 rounded-2xl border-2 border-b-4 px-2 text-lg transition-colors ${style}`}
      >
        {label}
      </button>
    )
  }

  return (
    <Prompt title="התאם את הזוגות">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">{hebrewOrder.map((w) => cell(w.id, 'he', w.he))}</div>
        <div className="flex flex-col gap-3">
          {spanishOrder.map((w) => cell(w.id, 'es', <Es>{displaySpanish(w)}</Es>))}
        </div>
      </div>
    </Prompt>
  )
}
