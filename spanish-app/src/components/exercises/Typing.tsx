import { useEffect, useState } from 'react'
import { displaySpanish } from '../../lib/content'
import { gradeTyped } from '../../lib/exercises'
import { speak } from '../../lib/speech'
import { SpanishInput } from '../SpanishInput'
import { BigSpeaker } from './Listen'
import { Prompt } from './Prompt'
import type { ExerciseProps } from './types'

export function CheckButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="min-h-14 rounded-2xl border-b-4 border-orange-600 bg-orange-500 text-lg font-bold text-white disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-400 active:translate-y-0.5 active:border-b-2"
    >
      בדיקה
    </button>
  )
}

/** Typing (Hebrew → Spanish) and dictation (hear → type). */
export function Typing({ exercise, voiceURI, result, onAnswer }: ExerciseProps<'typing' | 'dictation'>) {
  const [text, setText] = useState('')
  const dictation = exercise.type === 'dictation'
  const spanish = displaySpanish(exercise.word)
  useEffect(() => {
    if (dictation) void speak(spanish, voiceURI)
  }, [dictation, spanish, voiceURI])
  const check = () => text.trim() && onAnswer(gradeTyped(exercise, text))

  return (
    <Prompt title={dictation ? 'הקלד את מה שאתה שומע' : 'תרגם לספרדית'}>
      {dictation ? (
        <BigSpeaker text={spanish} voiceURI={voiceURI} />
      ) : (
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-3xl font-bold">{exercise.word.he}</p>
        </div>
      )}
      <SpanishInput value={text} onChange={setText} onSubmit={() => !result && check()} disabled={!!result} />
      {!result && <CheckButton disabled={!text.trim()} onClick={check} />}
    </Prompt>
  )
}
