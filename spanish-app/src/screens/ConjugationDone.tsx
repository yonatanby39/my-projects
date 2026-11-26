export function ConjugationDone({ correct, total, onAgain, onHome }: { correct: number; total: number; onAgain: () => void; onHome: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-6">
      <div className="pt-10 text-center">
        <p className="text-6xl">{correct >= total * 0.8 ? '🎉' : '💪'}</p>
        <h1 className="mt-4 text-3xl font-bold">סיימת את התרגול!</h1>
        <p className="mt-2 text-xl text-slate-600">
          {correct} מתוך {total} נכונות
        </p>
      </div>
      <button
        type="button"
        onClick={onAgain}
        className="mt-auto min-h-14 rounded-2xl bg-violet-500 text-lg font-semibold text-white shadow active:scale-[0.98]"
      >
        עוד סבב
      </button>
      <button
        type="button"
        onClick={onHome}
        className="mb-4 min-h-14 rounded-2xl bg-white text-lg font-semibold shadow-sm active:scale-[0.98]"
      >
        חזרה למסך הבית
      </button>
    </main>
  )
}
