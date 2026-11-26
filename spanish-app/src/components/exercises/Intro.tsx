import { useEffect } from 'react'
import { displaySpanish, type Word } from '../../lib/content'
import { speak } from '../../lib/speech'
import { Flashcard } from '../Flashcard'

/** New word: show the card and say it once. */
export function Intro({ word, voiceURI }: { word: Word; voiceURI: string | null }) {
  useEffect(() => {
    void speak(displaySpanish(word), voiceURI)
  }, [word, voiceURI])
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold tracking-wide text-orange-600">מילה חדשה ✨</p>
      <Flashcard word={word} voiceURI={voiceURI} />
    </div>
  )
}
