import { useState } from 'react'
import { Es } from '../components/Es'
import { SpeakButton } from '../components/SpeakButton'
import { Build } from '../components/exercises/Build'
import { Choice } from '../components/exercises/Choice'
import { Fill } from '../components/exercises/Fill'
import { Intro } from '../components/exercises/Intro'
import { Listen } from '../components/exercises/Listen'
import { Match } from '../components/exercises/Match'
import { Typing } from '../components/exercises/Typing'
import type { Exercise, ExerciseResult } from '../lib/exercises'
import { type Session as SessionState, answer, current, isDone, next, progress, startSession } from '../lib/session'
import { playComplete, playCorrect, playWrong } from '../lib/sound'

interface Props {
  exercises: Exercise[]
  voiceURI: string | null
  soundOn: boolean
  onFinish: (session: SessionState) => void
  onExit: () => void
}

const PRAISE = ['מצוין!', 'כל הכבוד!', 'נהדר!', '¡Muy bien!', '¡Genial!', 'בדיוק!']

/** Plays a list of exercises with feedback, retries and points. */
export function Session({ exercises, voiceURI, soundOn, onFinish, onExit }: Props) {
  const [session, setSession] = useState(() => startSession(exercises))
  const [result, setResult] = useState<ExerciseResult | null>(null)
  const [praise, setPraise] = useState(PRAISE[0])
  const item = current(session)

  const advance = (s: SessionState) => {
    const n = next(s)
    setResult(null)
    if (isDone(n)) {
      if (soundOn) playComplete()
      onFinish(n)
    } else setSession(n)
  }

  const onAnswer = (r: ExerciseResult) => {
    if (result) return
    setResult(r)
    setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)])
    if (soundOn && item?.exercise.type !== 'match') (r.correct ? playCorrect : playWrong)()
    setSession((s) => answer(s, r))
  }

  if (!item) return null
  const ex = item.exercise
  const props = { voiceURI, result, onAnswer }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-5 pb-56">
      <header className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onExit}
          aria-label="יציאה"
          className="h-11 w-11 shrink-0 rounded-full bg-white text-lg shadow-sm active:scale-95"
        >
          ✕
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-500"
            style={{ width: `${Math.max(4, progress(session) * 100)}%` }}
          />
        </div>
        <span className="min-w-12 text-center text-sm font-bold text-amber-600">⚡ {session.xp}</span>
      </header>

      {item.retry && <p className="text-sm font-semibold text-red-500">↻ שוב, הפעם תצליח</p>}

      <div key={item.key} className="animate-fade-in">
        {ex.type === 'intro' && <Intro word={ex.word} voiceURI={voiceURI} />}
        {ex.type === 'choice' && <Choice exercise={ex} {...props} />}
        {ex.type === 'listen' && <Listen exercise={ex} {...props} />}
        {(ex.type === 'typing' || ex.type === 'dictation') && <Typing exercise={ex} {...props} />}
        {ex.type === 'build' && <Build exercise={ex} {...props} />}
        {ex.type === 'fill' && <Fill exercise={ex} {...props} />}
        {ex.type === 'match' && <Match exercise={ex} {...props} soundOn={soundOn} />}
      </div>

      {ex.type === 'intro' && (
        <BottomBar>
          <ContinueButton tone="orange" onClick={() => advance(session)} label="המשך" />
        </BottomBar>
      )}

      {result && (
        <FeedbackSheet
          exercise={ex}
          result={result}
          praise={praise}
          voiceURI={voiceURI}
          onContinue={() => advance(session)}
        />
      )}
    </main>
  )
}

function BottomBar({ children, className = 'bg-amber-50/95' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`fixed inset-x-0 bottom-0 z-10 ${className}`}>
      <div className="mx-auto flex max-w-md flex-col gap-3 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
    </div>
  )
}

function ContinueButton({ tone, onClick, label }: { tone: 'green' | 'red' | 'orange'; onClick: () => void; label: string }) {
  const styles = {
    green: 'border-green-700 bg-green-600',
    red: 'border-red-700 bg-red-500',
    orange: 'border-orange-600 bg-orange-500',
  }
  return (
    <button
      type="button"
      autoFocus
      onClick={onClick}
      className={`min-h-14 w-full rounded-2xl border-b-4 text-lg font-bold text-white active:translate-y-0.5 active:border-b-2 ${styles[tone]}`}
    >
      {label}
    </button>
  )
}

function FeedbackSheet({
  exercise,
  result,
  praise,
  voiceURI,
  onContinue,
}: {
  exercise: Exercise
  result: ExerciseResult
  praise: string
  voiceURI: string | null
  onContinue: () => void
}) {
  const spanishAnswer = !(exercise.type === 'choice' && exercise.direction === 'es-he')
  const showAnswer = exercise.type !== 'match' && (!result.correct || result.status === 'accents' || exercise.type === 'build')
  const translation =
    exercise.type === 'build' || exercise.type === 'fill'
      ? exercise.sentence.he
      : exercise.type !== 'match'
        ? exercise.word.he
        : null
  const sayText = exercise.type === 'build' || exercise.type === 'fill' ? exercise.sentence.es : result.expected

  let title: string
  if (exercise.type === 'match') title = result.correct ? 'מושלם! בלי טעויות 🎯' : 'כל הזוגות הותאמו!'
  else if (!result.correct) title = 'לא בדיוק…'
  else if (result.status === 'accents') title = 'נכון! שים לב לכתיב:'
  else title = praise

  const good = result.correct || exercise.type === 'match'
  return (
    <BottomBar className={`animate-slide-up ${good ? 'bg-green-100' : 'bg-red-100'}`}>
      <div className={`flex items-start justify-between gap-3 ${good ? 'text-green-800' : 'text-red-800'}`}>
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold">
            {good ? '✓ ' : '✗ '}
            {title}
          </p>
          {showAnswer && (
            <>
              {!result.correct && <p className="text-sm">התשובה הנכונה:</p>}
              <p className="text-lg font-semibold">{spanishAnswer ? <Es>{result.expected}</Es> : result.expected}</p>
            </>
          )}
          {translation && showAnswer && spanishAnswer && <p className="text-sm opacity-80">{translation}</p>}
        </div>
        {exercise.type !== 'match' && spanishAnswer && <SpeakButton text={sayText} voiceURI={voiceURI} size="sm" />}
      </div>
      <ContinueButton tone={good ? 'green' : 'red'} onClick={onContinue} label={good ? 'המשך' : 'הבנתי'} />
    </BottomBar>
  )
}
