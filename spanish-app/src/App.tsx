import { useState } from 'react'
import { type ConjugationQuestion, buildDrill } from './lib/conjugation'
import { type Word, persons, verbs, words, wordsById } from './lib/content'
import { dueWordIds, learnWords, nextNewWordIds, recordPractice, reviewWord } from './lib/progress'
import { type QuizQuestion, type QuizResult, buildQuiz, srsGrade } from './lib/quiz'
import { Conjugation } from './screens/Conjugation'
import { ConjugationDone } from './screens/ConjugationDone'
import { Home } from './screens/Home'
import { Lesson } from './screens/Lesson'
import { LessonDone } from './screens/LessonDone'
import { Quiz } from './screens/Quiz'
import { Settings } from './screens/Settings'
import { Review } from './screens/Review'
import { ReviewDone } from './screens/ReviewDone'
import { today, useAppState } from './useAppState'

const LESSON_SIZE = 10
const DRILL_SIZE = 10
const allWordIds = words.map((w) => w.id)

type Screen =
  | { name: 'home' }
  | { name: 'lesson'; words: Word[] }
  | { name: 'quiz'; questions: QuizQuestion[] }
  | { name: 'done'; questions: QuizQuestion[]; results: QuizResult[] }
  | { name: 'review'; words: Word[] }
  | { name: 'reviewDone'; count: number }
  | { name: 'conjugation'; questions: ConjugationQuestion[] }
  | { name: 'conjugationDone'; correct: number; total: number }
  | { name: 'settings' }

export default function App() {
  const [state, update] = useAppState()
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const goHome = () => setScreen({ name: 'home' })
  const startDrill = () => setScreen({ name: 'conjugation', questions: buildDrill(verbs, persons, DRILL_SIZE) })

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
    case 'review':
      return (
        <Review
          words={screen.words}
          voiceURI={state.settings.voiceURI}
          onExit={goHome}
          onGrade={(id, grade) => update((s) => reviewWord(s, id, grade, today()))}
          onFinish={() => setScreen({ name: 'reviewDone', count: screen.words.length })}
        />
      )
    case 'reviewDone':
      return <ReviewDone count={screen.count} onHome={goHome} />
    case 'conjugation':
      return (
        <Conjugation
          questions={screen.questions}
          voiceURI={state.settings.voiceURI}
          onExit={goHome}
          onFinish={(correct) => {
            update((s) => recordPractice(s, today()))
            setScreen({ name: 'conjugationDone', correct, total: screen.questions.length })
          }}
        />
      )
    case 'conjugationDone':
      return <ConjugationDone correct={screen.correct} total={screen.total} onAgain={startDrill} onHome={goHome} />
    case 'settings':
      return (
        <Settings
          voiceURI={state.settings.voiceURI}
          onChangeVoice={(voiceURI) => update((s) => ({ ...s, settings: { ...s.settings, voiceURI } }))}
          onBack={goHome}
        />
      )
    case 'home': {
      const nextIds = nextNewWordIds(state, allWordIds, LESSON_SIZE)
      return (
        <Home
          state={state}
          today={today()}
          newWordsAvailable={nextIds.length}
          onStartLesson={() => setScreen({ name: 'lesson', words: nextIds.map((id) => wordsById.get(id)!) })}
          onStartConjugation={startDrill}
          onOpenSettings={() => setScreen({ name: 'settings' })}
          onStartReview={() =>
            setScreen({ name: 'review', words: dueWordIds(state, today()).flatMap((id) => wordsById.get(id) ?? []) })
          }
        />
      )
    }
  }
}
