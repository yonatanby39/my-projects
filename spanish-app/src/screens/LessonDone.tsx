import { Es } from '../components/Es'
import { displaySpanish } from '../lib/content'
import type { QuizQuestion, QuizResult } from '../lib/quiz'

interface Props {
  questions: QuizQuestion[]
  results: QuizResult[]
  onHome: () => void
}

export function LessonDone({ questions, results, onHome }: Props) {
  const score = results.filter((r) => r.correct).length
  const missed = questions.filter((_, i) => !results[i]?.correct)
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      <div className="pt-10 text-center">
        <p className="text-6xl">{score >= questions.length * 0.8 ? '🎉' : '💪'}</p>
        <h1 className="mt-4 text-3xl font-bold">סיימת את השיעור!</h1>
        <p className="mt-2 text-xl text-slate-600">
          {score} מתוך {questions.length} נכונות
        </p>
        <p className="mt-2 text-slate-500">המילים יחזרו לחזרה מחר.</p>
      </div>

      {missed.length > 0 && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">כדאי לחזור על:</h2>
          <ul className="grid gap-2">
            {missed.map((q) => (
              <li key={q.word.id} className="flex justify-between gap-3">
                <Es className="font-semibold">{displaySpanish(q.word)}</Es>
                <span className="text-slate-600">{q.word.he}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button
        type="button"
        onClick={onHome}
        className="mt-auto mb-4 min-h-14 rounded-2xl bg-orange-500 text-lg font-semibold text-white shadow active:scale-[0.98]"
      >
        חזרה למסך הבית
      </button>
    </main>
  )
}
