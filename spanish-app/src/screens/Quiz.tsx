import { useState } from 'react'
import { Es } from '../components/Es'
import { Feedback } from '../components/Feedback'
import { SpanishInput } from '../components/SpanishInput'
import { SpeakButton } from '../components/SpeakButton'
import { displaySpanish } from '../lib/content'
import { type QuizQuestion, type QuizResult, gradeChoice, gradeTyping } from '../lib/quiz'
import { speak } from '../lib/speech'

interface Props {
  questions: QuizQuestion[]
  voiceURI: string | null
  onFinish: (results: QuizResult[]) => void
  onExit: () => void
}

export function Quiz({ questions, voiceURI, onFinish, onExit }: Props) {
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<QuizResult[]>([])
  const [typed, setTyped] = useState('')
  const [chosen, setChosen] = useState<string | null>(null)

  const q = questions[index]
  const result = results[index] as QuizResult | undefined
  const spanish = displaySpanish(q.word)

  const answer = (r: QuizResult) => {
    setResults((prev) => [...prev, r])
    if (r.correct) void speak(spanish, voiceURI)
  }

  const next = () => {
    if (index === questions.length - 1) return onFinish(results)
    setIndex((i) => i + 1)
    setTyped('')
    setChosen(null)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-6">
      <header className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onExit}
          aria-label="יציאה"
          className="h-12 w-12 shrink-0 rounded-full bg-white text-xl shadow-sm active:scale-95"
        >
          ✕
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${(results.length / questions.length) * 100}%` }}
          />
        </div>
        <span className="w-12 text-center text-sm text-slate-500">
          {index + 1}/{questions.length}
        </span>
      </header>

      <p className="text-lg font-semibold text-slate-500">בוחן</p>

      {q.kind === 'choice' ? (
        <>
          <div className="flex items-center justify-between gap-3 rounded-3xl bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm text-slate-500">מה התרגום?</p>
              <p className="mt-1 text-4xl font-bold">
                <Es>{spanish}</Es>
              </p>
            </div>
            <SpeakButton text={spanish} voiceURI={voiceURI} />
          </div>
          <div className="grid gap-3">
            {q.options.map((opt) => {
              const isAnswer = opt === q.word.he
              const style = !result
                ? 'bg-white'
                : isAnswer
                  ? 'bg-green-100 border-green-500 text-green-900'
                  : opt === chosen
                    ? 'bg-red-100 border-red-400 text-red-900'
                    : 'bg-white opacity-60'
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={!!result}
                  onClick={() => {
                    setChosen(opt)
                    answer(gradeChoice(q, opt))
                  }}
                  className={`min-h-14 rounded-2xl border-2 border-transparent px-4 text-start text-xl shadow-sm active:scale-[0.98] ${style}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">איך אומרים בספרדית?</p>
            <p className="mt-1 text-3xl font-bold">{q.word.he}</p>
          </div>
          <SpanishInput
            value={typed}
            onChange={setTyped}
            disabled={!!result}
            onSubmit={() => (result ? next() : typed.trim() && answer(gradeTyping(q, typed)))}
          />
          {!result && (
            <button
              type="button"
              disabled={!typed.trim()}
              onClick={() => answer(gradeTyping(q, typed))}
              className="min-h-14 rounded-2xl bg-orange-500 text-lg font-semibold text-white shadow disabled:opacity-40 active:scale-[0.98]"
            >
              בדיקה
            </button>
          )}
        </>
      )}

      {result && (
        <>
          <Feedback result={result} spanish={q.kind === 'typing'} />
          <button
            type="button"
            onClick={next}
            className="mt-auto mb-4 min-h-14 rounded-2xl bg-orange-500 text-lg font-semibold text-white shadow active:scale-[0.98]"
          >
            {index === questions.length - 1 ? 'לתוצאות' : 'הבא'}
          </button>
        </>
      )}
    </main>
  )
}
