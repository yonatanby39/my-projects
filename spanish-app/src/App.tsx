import { Es } from './components/Es'

export default function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      <header className="pt-4">
        <h1 className="text-3xl font-bold">ספרדית ביום</h1>
        <p className="mt-1 text-slate-600">10–15 דקות של ספרדית ארגנטינאית בכל יום</p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">מילה לדוגמה</p>
        <p className="mt-2 text-4xl font-semibold">
          <Es>¡Hola, che!</Es>
        </p>
        <p className="mt-1 text-lg">שלום, חבר!</p>
      </section>

      <button
        type="button"
        className="min-h-14 rounded-2xl bg-orange-500 px-6 text-xl font-semibold text-white shadow active:scale-[0.98]"
      >
        התחל שיעור
      </button>

      <footer className="mt-auto text-center text-xs text-slate-400">
        שלב 1: שלד האפליקציה
      </footer>
    </main>
  )
}
