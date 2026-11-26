import { useState } from 'react'

interface Props {
  options: string[]
  answer: string
  spanish: boolean
  locked: boolean
  onPick: (option: string) => void
}

/** A column of large option buttons that turn green / red after answering. */
export function Options({ options, answer, spanish, locked, onPick }: Props) {
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <div className="grid gap-3">
      {options.map((opt) => {
        const style = !locked
          ? 'border-slate-200 bg-white active:bg-orange-50'
          : opt === answer
            ? 'border-green-500 bg-green-100 text-green-900 animate-pop'
            : opt === picked
              ? 'border-red-400 bg-red-100 text-red-900 animate-shake'
              : 'border-slate-200 bg-white opacity-50'
        return (
          <button
            key={opt}
            type="button"
            disabled={locked}
            dir={spanish ? 'ltr' : undefined}
            onClick={() => {
              setPicked(opt)
              onPick(opt)
            }}
            className={`min-h-14 rounded-2xl border-2 border-b-4 px-4 text-start text-xl ${style}`}
            lang={spanish ? 'es' : undefined}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
