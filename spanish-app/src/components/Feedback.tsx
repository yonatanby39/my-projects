import type { QuizResult } from '../lib/quiz'
import { Es } from './Es'

/** Correct / incorrect banner shown after answering. */
export function Feedback({ result, spanish }: { result: QuizResult; spanish: boolean }) {
  const answer = spanish ? <Es className="font-bold">{result.expected}</Es> : <b>{result.expected}</b>
  if (result.correct && result.status === 'exact') {
    return <div className="rounded-2xl bg-green-100 p-4 text-lg text-green-800">✓ נכון!</div>
  }
  if (result.correct) {
    return (
      <div className="rounded-2xl bg-green-100 p-4 text-lg text-green-800">
        ✓ נכון! שים לב לכתיב: {answer}
      </div>
    )
  }
  return <div className="rounded-2xl bg-red-100 p-4 text-lg text-red-800">✗ התשובה הנכונה: {answer}</div>
}
