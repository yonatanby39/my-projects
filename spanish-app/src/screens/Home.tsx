import { useState } from 'react'
import { Es } from '../components/Es'
import { displaySpanish, wordsById } from '../lib/content'
import { dueWordIds, stats } from '../lib/progress'
import type { AppState } from '../lib/storage'

interface Props {
  state: AppState
  today: string
  newWordsAvailable: number
  onStartLesson: () => void
  onStartReview: () => void
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm">
      <span className="text-3xl font-bold">{value}</span>
      <span className="mt-1 text-center text-sm text-slate-500">{label}</span>
    </div>
  )
}

export function Home({ state, today, newWordsAvailable, onStartLesson, onStartReview }: Props) {
  const s = stats(state, today)
  const due = dueWordIds(state, today).flatMap((id) => wordsById.get(id) ?? [])
  const [showDue, setShowDue] = useState(false)

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      <header className="pt-4">
        <h1 className="text-3xl font-bold">ספרדית ביום</h1>
        <p className="mt-1 text-slate-600">
          {s.practicedToday ? 'כל הכבוד, תרגלת היום! 🎉' : '10 עד 15 דקות של ספרדית ארגנטינאית בכל יום'}
        </p>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <Stat value={s.streak} label="ימים ברצף 🔥" />
        <Stat value={s.wordsLearned} label="מילים שלמדתי" />
        <Stat value={s.dueToday} label="לחזרה היום" />
      </section>

      {due.length > 0 && (
        <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={onStartReview}
            className="min-h-16 rounded-2xl bg-sky-500 px-6 text-xl font-semibold text-white shadow active:scale-[0.98]"
          >
            חזרה: {due.length} מילים
          </button>
          <button
            type="button"
            onClick={() => setShowDue((v) => !v)}
            className="min-h-12 text-sky-700"
            aria-expanded={showDue}
          >
            {showDue ? 'הסתר את הרשימה ▲' : 'אילו מילים לחזרה היום? ▼'}
          </button>
          {showDue && (
            <ul className="grid gap-2 border-t border-slate-100 pt-3">
              {due.map((w) => (
                <li key={w.id} className="flex justify-between gap-3">
                  <Es className="font-semibold">{displaySpanish(w)}</Es>
                  <span className="text-slate-600">{w.he}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {newWordsAvailable > 0 ? (
        <button
          type="button"
          onClick={onStartLesson}
          className={`min-h-16 rounded-2xl px-6 text-xl font-semibold shadow active:scale-[0.98] ${
            due.length > 0 ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'
          }`}
        >
          שיעור חדש: {newWordsAvailable} מילים
        </button>
      ) : (
        <p className="rounded-2xl bg-white p-4 text-center">למדת את כל המילים! 🎉</p>
      )}
    </main>
  )
}
