import type { Exercise, ExerciseResult } from '../../lib/exercises'

export interface ExerciseProps<T extends Exercise['type']> {
  exercise: Extract<Exercise, { type: T }>
  voiceURI: string | null
  /** Set once the learner answered; inputs lock and show the result. */
  result: ExerciseResult | null
  onAnswer: (result: ExerciseResult) => void
}
