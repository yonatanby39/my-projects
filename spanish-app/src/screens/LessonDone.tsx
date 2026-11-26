import { Es } from '../components/Es'
import { displaySpanish, wordsById } from '../lib/content'

interface Props {
  title: string
  xp: number
  accuracy: number
  /** Word ids that had mistakes. */
  missed: string[]
  goalXp: number
  xpToday: number
  onHome: () => void
}

export function LessonDone({ title, xp, accuracy, missed, goalXp, xpToday, onHome }: Props) {
  const goalReached = xpToday >= goalXp
  const words = missed.flatMap((id) => wordsById.get(id) ?? [])
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-6">
      <div className="pt-8 text-center animate-fade-in">
        <p className="text-7xl animate-pop">{accuracy >= 0.8 ? '🎉' : '💪'}</p>
        <h1 className="mt-4 text-3xl font-bold">{title}</h1>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-100 p-4 text-center">
          <p className="text-sm font-bold text-amber-700">נקודות</p>
          <p className="text-3xl font-bold text-amber-700">⚡ {xp}</p>
        </div>
        <div className="rounded-2xl border-2 border-green-300 bg-green-100 p-4 text-center">
          <p className="text-sm font-bold text-green-700">דיוק</p>
          <p className="text-3xl font-bold text-green-700">{Math.round(accuracy * 100)}%</p>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex justify-between text-sm font-semibold">
          <span>היעד היומי</span>
          <span>
            {Math.min(xpToday, goalXp)} / {goalXp}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(100, (xpToday / goalXp) * 100)}%` }} />
        </div>
        {goalReached && <p className="mt-2 text-center font-semibold text-amber-700">הגעת ליעד היומי! 🏆</p>}
      </section>

      {words.length > 0 && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">כדאי לחזור על:</h2>
          <ul className="grid gap-2">
            {words.map((w) => (
              <li key={w.id} className="flex justify-between gap-3">
                <Es className="font-semibold">{displaySpanish(w)}</Es>
                <span className="text-slate-600">{w.he}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button
        type="button"
        onClick={onHome}
        className="mt-auto mb-4 min-h-14 rounded-2xl border-b-4 border-orange-600 bg-orange-500 text-lg font-bold text-white active:translate-y-0.5 active:border-b-2"
      >
        המשך
      </button>
    </main>
  )
}
