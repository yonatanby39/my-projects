import { useRef } from 'react'
import { SPECIAL_CHARS } from '../lib/answer'

interface Props {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
}

/** LTR text input for Spanish with quick-insert buttons for accented characters. */
export function SpanishInput({ value, onChange, onSubmit, disabled, placeholder = 'הקלד בספרדית' }: Props) {
  const ref = useRef<HTMLInputElement>(null)

  const insert = (ch: string) => {
    const el = ref.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    onChange(value.slice(0, start) + ch + value.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + ch.length, start + ch.length)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={ref}
        dir="ltr"
        lang="es"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit()
        }}
        className="min-h-14 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-left text-2xl outline-none placeholder:text-right placeholder:text-base focus:border-orange-400 disabled:bg-slate-50"
      />
      <div dir="ltr" className="grid grid-cols-9 gap-1.5">
        {SPECIAL_CHARS.map((ch) => (
          <button
            key={ch}
            type="button"
            disabled={disabled}
            // Keep focus (and the phone keyboard) in the input.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insert(ch)}
            className="min-h-12 rounded-xl bg-white text-xl shadow-sm active:scale-95 active:bg-orange-100 disabled:opacity-40"
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  )
}
