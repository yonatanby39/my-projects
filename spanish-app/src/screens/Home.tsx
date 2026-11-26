import { stats } from '../lib/progress'
import type { AppState } from '../lib/storage'

interface Props {
  state: AppState
  today: string
  newWordsAvailable: number
  onStartLesson: () => void
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm">
      <span className="text-3xl font-bold">{value}</span>
      <span className="mt-1 text-center text-sm text-slate-500">{label}</span>
    </div>
  )
}

export function Home({ state, today, newWordsAvailable, onStartLesson }: Props) {
  const s = stats(state, today)
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

      {newWordsAvailable > 0 ? (
        <button
          type="button"
          onClick={onStartLesson}
          className="min-h-16 rounded-2xl bg-orange-500 px-6 text-xl font-semibold text-white shadow active:scale-[0.98]"
        >
          שיעור חדש: {newWordsAvailable} מילים
        </button>
      ) : (
        <p className="rounded-2xl bg-white p-4 text-center">למדת את כל המילים! 🎉</p>
      )}
    </main>
  )
}
