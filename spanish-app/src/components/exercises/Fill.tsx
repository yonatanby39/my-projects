import { gradeOption } from '../../lib/exercises'
import { Options } from './Options'
import { Prompt } from './Prompt'
import type { ExerciseProps } from './types'

export function Fill({ exercise, result, onAnswer }: ExerciseProps<'fill'>) {
  return (
    <Prompt title="השלם את המשפט">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <p dir="ltr" lang="es" className="text-left text-2xl leading-relaxed">
          <span>
            {exercise.before}
            <span
              className={`mx-1 inline-block min-w-20 border-b-4 px-1 text-center font-bold ${
                result ? (result.correct ? 'border-green-500 text-green-700' : 'border-red-400 text-red-700') : 'border-orange-400'
              }`}
            >
              {result ? exercise.answer : ' '}
            </span>
            {exercise.after}
          </span>
        </p>
        <p className="mt-2 text-slate-500">{exercise.sentence.he}</p>
      </div>
      <Options
        options={exercise.options}
        answer={exercise.answer}
        spanish
        locked={!!result}
        onPick={(opt) => onAnswer(gradeOption(exercise, opt))}
      />
    </Prompt>
  )
}
