import { useState } from 'react'
import { type ConjugationQuestion, buildDrill } from './lib/conjugation'
import { type Word, persons, sentences, verbs, words, wordsById } from './lib/content'
import { buildLesson, buildReview } from './lib/exercises'
import { addXp, dueWordIds, learnWords, nextNewWordIds, recordPractice, reviewWord, xpToday } from './lib/progress'
import { type Session as SessionState, XP_LESSON_BONUS, XP_REVIEW_BONUS } from './lib/session'
import { speechSupported } from './lib/speech'
import { Conjugation } from './screens/Conjugation'
import { ConjugationDone } from './screens/ConjugationDone'
import { Home } from './screens/Home'
import { LessonDone } from './screens/LessonDone'
import { Session } from './screens/Session'
import { Settings } from './screens/Settings'
import { today, useAppState } from './useAppState'

const LESSON_SIZE = 6
const DRILL_SIZE = 10
const allWordIds = words.map((w) => w.id)

type Mode = 'lesson' | 'review'

type Screen =
  | { name: 'home' }
  | { name: 'session'; mode: Mode; words: Word[]; key: number }
  | { name: 'done'; mode: Mode; xp: number; accuracy: number; missed: string[] }
  | { name: 'conjugation'; questions: ConjugationQuestion[] }
  | { name: 'conjugationDone'; correct: number; total: number }
  | { name: 'settings' }

export default function App() {
  const [state, update] = useAppState()
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const goHome = () => setScreen({ name: 'home' })
  const startDrill = () => setScreen({ name: 'conjugation', questions: buildDrill(verbs, persons, DRILL_SIZE) })
  const { voiceURI, soundOn, dailyGoalXp } = state.settings

  const finishSession = (mode: Mode, sessionWords: Word[], s: SessionState) => {
    const day = today()
    const xp = s.xp + (mode === 'lesson' ? XP_LESSON_BONUS : XP_REVIEW_BONUS)
    update((st) => {
      let next = mode === 'lesson' ? learnWords(st, sessionWords.map((w) => w.id), day) : st
      for (const w of sessionWords) {
        const mistakes = s.mistakes[w.id] ?? 0
        const grade = mistakes === 0 ? 'good' : mode === 'lesson' ? 'hard' : 'again'
        next = reviewWord(next, w.id, grade, day)
      }
      return addXp(next, day, xp)
    })
    setScreen({
      name: 'done',
      mode,
      xp,
      accuracy: s.gradedCount ? s.firstTryCorrect / s.gradedCount : 1,
      missed: sessionWords.filter((w) => s.mistakes[w.id]).map((w) => w.id),
    })
  }

  switch (screen.name) {
    case 'session': {
      const opts = { audio: speechSupported(), sentences }
      return (
        <Session
          key={screen.key}
          exercises={
            screen.mode === 'lesson' ? buildLesson(screen.words, words, opts) : buildReview(screen.words, words, opts)
          }
          voiceURI={voiceURI}
          soundOn={soundOn}
          onExit={goHome}
          onFinish={(s) => finishSession(screen.mode, screen.words, s)}
        />
      )
    }
    case 'done':
      return (
        <LessonDone
          title={screen.mode === 'lesson' ? 'סיימת את השיעור!' : 'סיימת את החזרה!'}
          xp={screen.xp}
          accuracy={screen.accuracy}
          missed={screen.missed}
          goalXp={dailyGoalXp}
          xpToday={xpToday(state, today())}
          onHome={goHome}
        />
      )
    case 'conjugation':
      return (
        <Conjugation
          questions={screen.questions}
          voiceURI={voiceURI}
          onExit={goHome}
          onFinish={(correct) => {
            update((s) => addXp(recordPractice(s, today()), today(), correct * 2))
            setScreen({ name: 'conjugationDone', correct, total: screen.questions.length })
          }}
        />
      )
    case 'conjugationDone':
      return <ConjugationDone correct={screen.correct} total={screen.total} onAgain={startDrill} onHome={goHome} />
    case 'settings':
      return (
        <Settings
          voiceURI={voiceURI}
          soundOn={soundOn}
          onChangeVoice={(v) => update((s) => ({ ...s, settings: { ...s.settings, voiceURI: v } }))}
          onChangeSound={(on) => update((s) => ({ ...s, settings: { ...s.settings, soundOn: on } }))}
          onBack={goHome}
        />
      )
    case 'home': {
      const nextIds = nextNewWordIds(state, allWordIds, LESSON_SIZE)
      const start = (mode: Mode, ids: string[]) =>
        setScreen({ name: 'session', mode, words: ids.flatMap((id) => wordsById.get(id) ?? []), key: Date.now() })
      return (
        <Home
          state={state}
          today={today()}
          newWordsAvailable={nextIds.length}
          onStartLesson={() => start('lesson', nextIds)}
          onStartReview={() => start('review', dueWordIds(state, today()))}
          onStartConjugation={startDrill}
          onOpenSettings={() => setScreen({ name: 'settings' })}
        />
      )
    }
  }
}
