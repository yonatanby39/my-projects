import { useState } from 'react'
import { gradeBuild } from '../../lib/exercises'
import { Prompt } from './Prompt'
import { CheckButton } from './Typing'
import type { ExerciseProps } from './types'

/** Tap Spanish word tiles in order to translate a Hebrew sentence. */
export function Build({ exercise, result, onAnswer }: ExerciseProps<'build'>) {
  // Indexes into exercise.tiles, in the order the learner placed them.
  const [placed, setPlaced] = useState<number[]>([])
  const locked = !!result

  const tile = (i: number, inAnswer: boolean) => (
    <button
      key={i}
      type="button"
      disabled={locked}
      onClick={() => setPlaced((p) => (inAnswer ? p.filter((x) => x !== i) : [...p, i]))}
      className="min-h-12 rounded-xl border-2 border-b-4 border-slate-200 bg-white px-3 text-lg active:translate-y-0.5 animate-fade-in"
    >
      {exercise.tiles[i]}
    </button>
  )

  return (
    <Prompt title="תרגם את המשפט">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-2xl font-semibold">{exercise.sentence.he}</p>
      </div>
      <div
        dir="ltr"
        className={`flex min-h-28 flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed p-3 ${
          result ? (result.correct ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50 animate-shake') : 'border-slate-300'
        }`}
      >
        {placed.map((i) => tile(i, true))}
      </div>
      <div dir="ltr" className="flex flex-wrap justify-center gap-2">
        {exercise.tiles.map((_, i) =>
          placed.includes(i) ? (
            <span key={i} className="min-h-12 rounded-xl bg-slate-200 px-3 text-lg text-transparent">
              {exercise.tiles[i]}
            </span>
          ) : (
            tile(i, false)
          ),
        )}
      </div>
      {!result && (
        <CheckButton
          disabled={placed.length === 0}
          onClick={() => onAnswer(gradeBuild(exercise, placed.map((i) => exercise.tiles[i])))}
        />
      )}
    </Prompt>
  )
}
