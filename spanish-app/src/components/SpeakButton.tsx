import { speak, speechSupported } from '../lib/speech'

interface Props {
  text: string
  voiceURI: string | null
  size?: 'lg' | 'sm'
  label?: string
}

/** Plays Spanish pronunciation. Hidden when the browser has no speech support. */
export function SpeakButton({ text, voiceURI, size = 'lg', label = 'השמע הגייה' }: Props) {
  if (!speechSupported()) return null
  const dims = size === 'lg' ? 'h-14 w-14 text-2xl' : 'h-10 w-10 text-lg'
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => void speak(text, voiceURI)}
      className={`${dims} inline-flex shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 active:scale-95 active:bg-sky-200`}
    >
      🔊
    </button>
  )
}
