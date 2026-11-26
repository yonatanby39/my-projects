import { useState } from 'react'
import { Es } from '../components/Es'
import { GenderBadge } from '../components/GenderBadge'
import { SpeakButton } from '../components/SpeakButton'
import { type Word, displaySpanish } from '../lib/content'
import type { Grade } from '../lib/srs'

interface Props {
  words: Word[]
  voiceURI: string | null
  onGrade: (wordId: string, grade: Grade) => void
  onFinish: () => void
  onExit: () => void
}

const GRADES: { grade: Grade; label: string; hint: string; style: string }[] = [
  { grade: 'again', label: 'שכחתי', hint: 'מחר', style: 'bg-red-100 text-red-800' },
  { grade: 'hard', label: 'קשה', hint: '', style: 'bg-amber-100 text-amber-800' },
  { grade: 'good', label: 'טוב', hint: '', style: 'bg-green-100 text-green-800' },
  { grade: 'easy', label: 'קל', hint: '', style: 'bg-sky-100 text-sky-800' },
]

/** Spaced-repetition review: see the Spanish, recall the meaning, reveal, rate yourself. */
export function Review({ words, voiceURI, onGrade, onFinish, onExit }: Props) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const word = words[index]
  const spanish = displaySpanish(word)

  const grade = (g: Grade) => {
    onGrade(word.id, g)
    if (index === words.length - 1) return onFinish()
    setIndex((i) => i + 1)
    setRevealed(false)
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
            className="h-full rounded-full bg-sky-500 transition-all"
            style={{ width: `${(index / words.length) * 100}%` }}
          />
        </div>
        <span className="w-12 text-center text-sm text-slate-500">
          {index + 1}/{words.length}
        </span>
      </header>

      <p className="text-lg font-semibold text-slate-500">חזרה</p>

      <article className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-4xl font-bold break-words">
            <Es>{spanish}</Es>
          </p>
          <SpeakButton text={spanish} voiceURI={voiceURI} />
        </div>

        {revealed ? (
          <>
            <div className="flex items-center gap-3">
              <p className="text-2xl text-slate-700">{word.he}</p>
              <GenderBadge gender={word.gender} />
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-lg">
                <Es>{word.example.es}</Es>
              </p>
              <p className="mt-1 text-slate-600">{word.example.he}</p>
            </div>
          </>
        ) : (
          <p className="text-slate-500">נסה להיזכר מה המילה אומרת, ואז הצג את התשובה.</p>
        )}
      </article>

      <div className="mt-auto pb-4">
        {revealed ? (
          <>
            <p className="mb-2 text-center text-sm text-slate-500">כמה טוב זכרת?</p>
            <div className="grid grid-cols-4 gap-2">
              {GRADES.map((g) => (
                <button
                  key={g.grade}
                  type="button"
                  onClick={() => grade(g.grade)}
                  className={`min-h-16 rounded-2xl text-lg font-semibold shadow-sm active:scale-95 ${g.style}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="min-h-14 w-full rounded-2xl bg-sky-500 text-lg font-semibold text-white shadow active:scale-[0.98]"
          >
            הצג תשובה
          </button>
        )}
      </div>
    </main>
  )
}
