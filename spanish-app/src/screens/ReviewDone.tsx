export function ReviewDone({ count, onHome }: { count: number; onHome: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      <div className="pt-10 text-center">
        <p className="text-6xl">✅</p>
        <h1 className="mt-4 text-3xl font-bold">סיימת את החזרה להיום!</h1>
        <p className="mt-2 text-xl text-slate-600">חזרת על {count} מילים</p>
      </div>
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
