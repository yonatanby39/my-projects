import { useState } from 'react'
import { Es } from '../components/Es'
import { SpanishInput } from '../components/SpanishInput'
import { SpeakButton } from '../components/SpeakButton'
import { VerbTable } from '../components/VerbTable'
import type { AnswerResult } from '../lib/answer'
import { type ConjugationQuestion, checkConjugation } from '../lib/conjugation'

interface Props {
  questions: ConjugationQuestion[]
  voiceURI: string | null
  onFinish: (correct: number) => void
  onExit: () => void
}

const TYPE_LABEL = { regular: 'פועל רגיל', stem: 'שינוי בגזע', irregular: 'פועל חריג' } as const

export function Conjugation({ questions, voiceURI, onFinish, onExit }: Props) {
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [correct, setCorrect] = useState(0)
  const q = questions[index]

  const check = () => {
    if (!typed.trim()) return
    const r = checkConjugation(q, typed)
    setResult(r)
    if (r.correct) setCorrect((c) => c + 1)
  }

  const next = () => {
    if (index === questions.length - 1) return onFinish(correct)
    setIndex((i) => i + 1)
    setTyped('')
    setResult(null)
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
            className="h-full rounded-full bg-violet-500 transition-all"
            style={{ width: `${((index + (result ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        <span className="w-12 text-center text-sm text-slate-500">
          {index + 1}/{questions.length}
        </span>
      </header>

      <p className="text-lg font-semibold text-slate-500">הטיית פעלים · הווה</p>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{q.verb.he}</span>
          <span>{TYPE_LABEL[q.verb.type]}</span>
        </div>
        <p className="mt-2 text-4xl font-bold">
          <Es>{q.verb.infinitive}</Es>
        </p>
        <p className="mt-4 text-2xl">
          <Es className="font-semibold text-violet-700">{q.person.es}</Es>
          <span className="ms-2 text-base text-slate-500">({q.person.he})</span>
        </p>
      </div>

      <SpanishInput
        value={typed}
        onChange={setTyped}
        disabled={!!result}
        placeholder="הקלד את הצורה הנכונה"
        onSubmit={() => (result ? next() : check())}
      />

      {!result ? (
        <button
          type="button"
          disabled={!typed.trim()}
          onClick={check}
          className="min-h-14 rounded-2xl bg-violet-500 text-lg font-semibold text-white shadow disabled:opacity-40 active:scale-[0.98]"
        >
          בדיקה
        </button>
      ) : (
        <>
          <div
            className={`flex items-center justify-between gap-3 rounded-2xl p-4 text-lg ${
              result.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            <span>
              {result.status === 'exact' ? '✓ נכון!' : result.correct ? '✓ נכון! שים לב לכתיב: ' : '✗ התשובה הנכונה: '}
              {result.status !== 'exact' && <Es className="font-bold">{q.person.es.split(' ')[0]} {result.expected}</Es>}
            </span>
            <SpeakButton text={`${q.person.es.split(' ')[0]} ${result.expected}`} voiceURI={voiceURI} size="sm" />
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <VerbTable verb={q.verb} highlight={q.person.key} />
          </div>
          <button
            type="button"
            onClick={next}
            className="mt-auto mb-4 min-h-14 rounded-2xl bg-violet-500 text-lg font-semibold text-white shadow active:scale-[0.98]"
          >
            {index === questions.length - 1 ? 'סיום' : 'הבא'}
          </button>
        </>
      )}
    </main>
  )
}
