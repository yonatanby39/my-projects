import { useEffect } from 'react'
import { displaySpanish } from '../../lib/content'
import { gradeOption } from '../../lib/exercises'
import { speak } from '../../lib/speech'
import { Options } from './Options'
import { Prompt } from './Prompt'
import type { ExerciseProps } from './types'

export function BigSpeaker({ text, voiceURI }: { text: string; voiceURI: string | null }) {
  return (
    <div className="flex justify-center gap-4 py-2">
      <button
        type="button"
        aria-label="השמע"
        onClick={() => void speak(text, voiceURI)}
        className="h-24 w-24 rounded-3xl border-b-4 border-sky-600 bg-sky-500 text-5xl text-white shadow active:translate-y-0.5 active:border-b-2"
      >
        🔊
      </button>
      <button
        type="button"
        aria-label="השמע לאט"
        onClick={() => void speak(text, voiceURI, 0.55)}
        className="h-24 w-16 self-end rounded-2xl border-b-4 border-sky-300 bg-sky-100 text-2xl active:translate-y-0.5 active:border-b-2"
      >
        🐢
      </button>
    </div>
  )
}

export function Listen({ exercise, voiceURI, result, onAnswer }: ExerciseProps<'listen'>) {
  const text = displaySpanish(exercise.word)
  useEffect(() => {
    void speak(text, voiceURI)
  }, [text, voiceURI])
  return (
    <Prompt title="מה שמעת?">
      <BigSpeaker text={text} voiceURI={voiceURI} />
      <Options
        options={exercise.options}
        answer={text}
        spanish
        locked={!!result}
        onPick={(opt) => onAnswer(gradeOption(exercise, opt))}
      />
    </Prompt>
  )
}
