import { displaySpanish } from '../../lib/content'
import { gradeOption } from '../../lib/exercises'
import { Es } from '../Es'
import { SpeakButton } from '../SpeakButton'
import { Options } from './Options'
import { Prompt } from './Prompt'
import type { ExerciseProps } from './types'

export function Choice({ exercise, voiceURI, result, onAnswer }: ExerciseProps<'choice'>) {
  const { word, direction } = exercise
  const esToHe = direction === 'es-he'
  const spanish = displaySpanish(word)
  return (
    <Prompt title={esToHe ? 'מה הפירוש?' : 'איך אומרים בספרדית?'}>
      <div className="flex items-center justify-between gap-3 rounded-3xl bg-white p-5 shadow-sm">
        {esToHe ? (
          <>
            <p className="text-4xl font-bold">
              <Es>{spanish}</Es>
            </p>
            <SpeakButton text={spanish} voiceURI={voiceURI} />
          </>
        ) : (
          <p className="text-3xl font-bold">{word.he}</p>
        )}
      </div>
      <Options
        options={exercise.options}
        answer={esToHe ? word.he : spanish}
        spanish={!esToHe}
        locked={!!result}
        onPick={(opt) => onAnswer(gradeOption(exercise, opt))}
      />
    </Prompt>
  )
}
