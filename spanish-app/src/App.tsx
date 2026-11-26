import { useState } from 'react'
import { type Word, words, wordsById } from './lib/content'
import { learnWords, nextNewWordIds } from './lib/progress'
import { Home } from './screens/Home'
import { Lesson } from './screens/Lesson'
import { today, useAppState } from './useAppState'

const LESSON_SIZE = 10
const allWordIds = words.map((w) => w.id)

type Screen = { name: 'home' } | { name: 'lesson'; words: Word[] }

export default function App() {
  const [state, update] = useAppState()
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const nextIds = nextNewWordIds(state, allWordIds, LESSON_SIZE)

  if (screen.name === 'lesson') {
    return (
      <Lesson
        words={screen.words}
        voiceURI={state.settings.voiceURI}
        onExit={() => setScreen({ name: 'home' })}
        onFinish={() => {
          // The quiz (step 6) will come before saving; for now finishing the cards learns them.
          update((s) => learnWords(s, screen.words.map((w) => w.id), today()))
          setScreen({ name: 'home' })
        }}
      />
    )
  }

  return (
    <Home
      state={state}
      today={today()}
      newWordsAvailable={nextIds.length}
      onStartLesson={() => setScreen({ name: 'lesson', words: nextIds.map((id) => wordsById.get(id)!) })}
    />
  )
}
