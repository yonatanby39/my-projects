import { useState } from 'react'
import { type Word, words, wordsById } from './lib/content'
import { learnWords, nextNewWordIds, reviewWord } from './lib/progress'
import { type QuizQuestion, type QuizResult, buildQuiz, srsGrade } from './lib/quiz'
import { Home } from './screens/Home'
import { Lesson } from './screens/Lesson'
import { LessonDone } from './screens/LessonDone'
import { Quiz } from './screens/Quiz'
import { today, useAppState } from './useAppState'

const LESSON_SIZE = 10
const allWordIds = words.map((w) => w.id)

type Screen =
  | { name: 'home' }
  | { name: 'lesson'; words: Word[] }
  | { name: 'quiz'; questions: QuizQuestion[] }
  | { name: 'done'; questions: QuizQuestion[]; results: QuizResult[] }

export default function App() {
  const [state, update] = useAppState()
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const goHome = () => setScreen({ name: 'home' })

  switch (screen.name) {
    case 'lesson':
      return (
        <Lesson
          words={screen.words}
          voiceURI={state.settings.voiceURI}
          onExit={goHome}
          onFinish={() => setScreen({ name: 'quiz', questions: buildQuiz(screen.words, words) })}
        />
      )
    case 'quiz':
      return (
        <Quiz
          questions={screen.questions}
          voiceURI={state.settings.voiceURI}
          onExit={goHome}
          onFinish={(results) => {
            // Words are saved as learned only after the quiz; each answer becomes their first review.
            const day = today()
            update((s) => {
              let next = learnWords(s, screen.questions.map((q) => q.word.id), day)
              screen.questions.forEach((q, i) => {
                next = reviewWord(next, q.word.id, srsGrade(results[i]), day)
              })
              return next
            })
            setScreen({ name: 'done', questions: screen.questions, results })
          }}
        />
      )
    case 'done':
      return <LessonDone questions={screen.questions} results={screen.results} onHome={goHome} />
    case 'home': {
      const nextIds = nextNewWordIds(state, allWordIds, LESSON_SIZE)
      return (
        <Home
          state={state}
          today={today()}
          newWordsAvailable={nextIds.length}
          onStartLesson={() => setScreen({ name: 'lesson', words: nextIds.map((id) => wordsById.get(id)!) })}
        />
      )
    }
  }
}
