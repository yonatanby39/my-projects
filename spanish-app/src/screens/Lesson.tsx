import { useState } from 'react'
import { Flashcard } from '../components/Flashcard'
import type { Word } from '../lib/content'

interface Props {
  words: Word[]
  voiceURI: string | null
  onFinish: () => void
  onExit: () => void
}

/** Step 1 of a lesson: go through the new words one card at a time. */
export function Lesson({ words, voiceURI, onFinish, onExit }: Props) {
  const [index, setIndex] = useState(0)
  const word = words[index]
  const last = index === words.length - 1

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
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: `${((index + 1) / words.length) * 100}%` }}
          />
        </div>
        <span className="w-12 text-center text-sm text-slate-500">
          {index + 1}/{words.length}
        </span>
      </header>

      <Flashcard key={word.id} word={word} voiceURI={voiceURI} />

      <div className="mt-auto flex gap-3 pb-4">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="min-h-14 flex-1 rounded-2xl bg-white text-lg font-semibold shadow-sm disabled:opacity-40 active:scale-[0.98]"
        >
          הקודם
        </button>
        <button
          type="button"
          onClick={() => (last ? onFinish() : setIndex((i) => i + 1))}
          className="min-h-14 flex-[2] rounded-2xl bg-orange-500 text-lg font-semibold text-white shadow active:scale-[0.98]"
        >
          {last ? 'סיימתי!' : 'הבא'}
        </button>
      </div>
    </main>
  )
}
