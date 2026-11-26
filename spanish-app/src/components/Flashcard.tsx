import { type Word, displaySpanish, topics } from '../lib/content'
import { Es } from './Es'
import { GenderBadge } from './GenderBadge'
import { SpeakButton } from './SpeakButton'

interface Props {
  word: Word
  voiceURI: string | null
}

/** A word card for learning: Spanish (with article), Hebrew, gender and an example sentence. */
export function Flashcard({ word, voiceURI }: Props) {
  const topic = topics.find((t) => t.id === word.topic)
  const spanish = displaySpanish(word)
  return (
    <article className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{topic?.he}</span>
        <GenderBadge gender={word.gender} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-4xl font-bold break-words">
          <Es>{spanish}</Es>
        </p>
        <SpeakButton text={spanish} voiceURI={voiceURI} />
      </div>

      <p className="text-2xl text-slate-700">{word.he}</p>

      <div className="rounded-2xl bg-amber-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg">
            <Es>{word.example.es}</Es>
          </p>
          <SpeakButton text={word.example.es} voiceURI={voiceURI} size="sm" label="השמע משפט לדוגמה" />
        </div>
        <p className="mt-1 text-slate-600">{word.example.he}</p>
      </div>
    </article>
  )
}
